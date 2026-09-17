import React, { useEffect, useState } from 'react';
import { AdvertInput } from './components/AdvertInput';
import { AdvertViewer } from './components/AdvertViewer';
import { ApiKeyModal } from './components/ApiKeyModal';
import { CommitmentRow } from './components/CommitmentRow';
import { Header } from './components/Header';
import { HonestRewriteModal } from './components/HonestRewriteModal';
import { ArrowLeftIcon } from './components/Icons';
import { ShortlistTable } from './components/ShortlistTable';
import { VerdictBlock } from './components/VerdictBlock';
import { DEFAULT_MODEL_ID } from './constants';
import {
  parseAdvertChunks,
  parseModelJson,
  verifyAndScoreAdvert,
} from './lib/extractor';
import {
  AdvertAnalysis,
  RawModelOutput,
  RawMultiModelOutputItem,
} from './types';

const SESSION_KEY_NAME = 'on_paper_gemini_api_key';

export function App() {
  // Inputs
  const [title, setTitle] = useState('');
  const [employer, setEmployer] = useState('');
  const [advert, setAdvert] = useState('');

  // API Key state
  const [apiKey, setApiKey] = useState<string>(() => {
    return sessionStorage.getItem(SESSION_KEY_NAME) || '';
  });
  const [hasEnvKey, setHasEnvKey] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Execution & results state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [singleAnalysis, setSingleAnalysis] = useState<AdvertAnalysis | null>(null);
  const [multiAnalyses, setMultiAnalyses] = useState<AdvertAnalysis[] | null>(null);
  const [selectedMultiIndex, setSelectedMultiIndex] = useState(0);

  // Quote highlighting state
  const [activeQuote, setActiveQuote] = useState<string | null>(null);

  // Phase 3 Rewrite state
  const [isRewriteModalOpen, setIsRewriteModalOpen] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewrittenText, setRewrittenText] = useState<string | null>(null);

  // Check health / server env key
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.hasEnvKey) {
          setHasEnvKey(true);
        }
      })
      .catch((err) => {
        console.warn('Health check failed:', err);
      });
  }, []);

  const handleSaveKey = (newKey: string) => {
    setApiKey(newKey);
    if (newKey) {
      sessionStorage.setItem(SESSION_KEY_NAME, newKey);
    } else {
      sessionStorage.removeItem(SESSION_KEY_NAME);
    }
  };

  const handleReset = () => {
    setSingleAnalysis(null);
    setMultiAnalyses(null);
    setActiveQuote(null);
    setErrorMessage(null);
    setRewrittenText(null);
  };

  // Main Read action
  const handleReadAdvert = async () => {
    if (advert.trim().length < 200 || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);
    setActiveQuote(null);
    setRewrittenText(null);

    try {
      const chunks = parseAdvertChunks(advert);
      const isMulti = chunks.length > 1;

      const payload = isMulti
        ? {
            adverts: chunks,
            apiKey: apiKey || undefined,
            modelId: DEFAULT_MODEL_ID,
          }
        : {
            advert: advert.trim(),
            title: title.trim() || undefined,
            employer: employer.trim() || undefined,
            apiKey: apiKey || undefined,
            modelId: DEFAULT_MODEL_ID,
          };

      const response = await fetch('/api/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'NO_API_KEY') {
          setIsSettingsOpen(true);
        }
        throw new Error(data.error || 'Something went wrong reading that advert.');
      }

      if (isMulti) {
        // Parse array of extracted outputs per §8 Phase 2
        const rawArray = parseModelJson<RawMultiModelOutputItem[]>(data.rawText, true);

        const evaluatedList: AdvertAnalysis[] = chunks.map((chunk, idx) => {
          // Find matching item by index, or fallback by array index
          const item =
            (Array.isArray(rawArray) && rawArray.find((r) => r.index === chunk.index)) ||
            (Array.isArray(rawArray) && rawArray[idx]) ||
            ({} as RawModelOutput);

          return verifyAndScoreAdvert(
            `advert-${chunk.index}`,
            chunk.title || `Advert #${chunk.index + 1}`,
            chunk.employer || 'Unknown Employer',
            chunk.advert,
            item as RawModelOutput,
            data.modelId || DEFAULT_MODEL_ID
          );
        });

        setMultiAnalyses(evaluatedList);
        setSelectedMultiIndex(0);
        setSingleAnalysis(null);
      } else {
        // Single advert evaluation per §6
        const rawOutput = parseModelJson<RawModelOutput>(data.rawText, false);

        const evaluated = verifyAndScoreAdvert(
          'single-advert',
          title.trim(),
          employer.trim(),
          advert.trim(),
          rawOutput,
          data.modelId || DEFAULT_MODEL_ID
        );

        setSingleAnalysis(evaluated);
        setMultiAnalyses(null);
      }
    } catch (err: any) {
      console.error('Extraction error:', err);
      setErrorMessage(err.message || 'Something went wrong reading that advert.');
    } finally {
      setIsLoading(false);
    }
  };

  // Phase 3: Honest rewrite
  const currentAnalysis = multiAnalyses
    ? multiAnalyses[selectedMultiIndex]
    : singleAnalysis;

  const handleTriggerRewrite = async () => {
    if (!currentAnalysis || isRewriting) return;

    setIsRewriting(true);
    setIsRewriteModalOpen(true);

    const absentOrUnverified = currentAnalysis.commitments
      .filter((c) => c.status !== 'confirmed')
      .map((c) => c.label);

    try {
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          advert: currentAnalysis.advert,
          missingPhrases: absentOrUnverified,
          apiKey: apiKey || undefined,
          modelId: DEFAULT_MODEL_ID,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to rewrite advert.');
      }
      setRewrittenText(data.rewrittenText);
    } catch (err: any) {
      console.error('Rewrite error:', err);
      setRewrittenText(`Failed to generate honest advert: ${err.message}`);
    } finally {
      setIsRewriting(false);
    }
  };

  const hasActiveResult = Boolean(singleAnalysis || multiAnalyses);

  return (
    <div className="min-h-screen bg-[#0d0f12] text-[#e1e6ed] flex flex-col font-sans selection:bg-[#2b3544]">
      <Header
        hasKey={Boolean(apiKey || hasEnvKey)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onReset={handleReset}
        showReset={hasActiveResult}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {!hasActiveResult ? (
          /* Input View */
          <AdvertInput
            title={title}
            setTitle={setTitle}
            employer={employer}
            setEmployer={setEmployer}
            advert={advert}
            setAdvert={setAdvert}
            isLoading={isLoading}
            onRead={handleReadAdvert}
            errorMessage={errorMessage}
            onClearError={() => setErrorMessage(null)}
          />
        ) : (
          /* Result View */
          <div className="space-y-8 animate-fadeIn">
            {/* Back button */}
            <div className="flex items-center justify-between">
              <button
                id="btn-back-to-advert"
                onClick={handleReset}
                className="min-h-[44px] inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8b949e] hover:text-[#f0f6fc] transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Edit advert / Try another</span>
              </button>

              {currentAnalysis?.employer && (
                <div className="text-xs text-[#8b949e] font-medium truncate max-w-xs sm:max-w-md">
                  <span>{currentAnalysis.employer}</span>
                  {currentAnalysis.title && <span> — {currentAnalysis.title}</span>}
                </div>
              )}
            </div>

            {/* If Shortlist mode, render comparison table (§8 Phase 2) */}
            {multiAnalyses && (
              <ShortlistTable
                analyses={multiAnalyses}
                selectedIndex={selectedMultiIndex}
                onSelectAdvert={(idx) => {
                  setSelectedMultiIndex(idx);
                  setActiveQuote(null);
                }}
                requestSummary={`${multiAnalyses.length} adverts · 1 request`}
              />
            )}

            {/* Headline verdict block (§6.2) */}
            {currentAnalysis && (
              <>
                <VerdictBlock
                  confirmedCount={currentAnalysis.confirmedCount}
                  band={currentAnalysis.band}
                  verdictSentence={currentAnalysis.verdictSentence}
                  onTriggerRewrite={handleTriggerRewrite}
                  isRewriting={isRewriting}
                />

                {/* Seven commitment rows (§6.3) */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-[#21262d] pb-2">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8b949e]">
                      The seven commitments
                    </h2>
                    <span className="text-xs text-[#484f58]">
                      Click any confirmed row to locate evidence in advert
                    </span>
                  </div>

                  <div className="space-y-2">
                    {currentAnalysis.commitments.map((commit) => (
                      <CommitmentRow
                        key={commit.key}
                        commitment={commit}
                        isSelected={Boolean(activeQuote && activeQuote === commit.quote)}
                        onSelectQuote={(q) => setActiveQuote(q)}
                      />
                    ))}
                  </div>
                </div>

                {/* Advert Viewer with in-place quote highlighting (§6.3) */}
                <AdvertViewer
                  title={currentAnalysis.title}
                  employer={currentAnalysis.employer}
                  advert={currentAnalysis.advert}
                  activeQuote={activeQuote}
                />

                {/* Footer quiet line (§6.4) */}
                <footer className="pt-6 pb-8 border-t border-[#21262d] text-center">
                  <p
                    id="result-footer-line"
                    className="text-xs text-[#8b949e] font-mono tracking-tight"
                  >
                    {currentAnalysis.modelId} · {currentAnalysis.confirmedCount} quotes verified ·{' '}
                    {currentAnalysis.unverifiedCount} not found in the advert
                  </p>
                </footer>
              </>
            )}
          </div>
        )}
      </main>

      {/* Settings Modal for API Key */}
      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveKey={handleSaveKey}
        hasEnvKey={hasEnvKey}
      />

      {/* Honest Rewrite Modal (Phase 3) */}
      <HonestRewriteModal
        isOpen={isRewriteModalOpen}
        onClose={() => setIsRewriteModalOpen(false)}
        rewrittenText={rewrittenText}
        isLoading={isRewriting}
        missingLabels={
          currentAnalysis
            ? currentAnalysis.commitments
                .filter((c) => c.status !== 'confirmed')
                .map((c) => c.label)
            : []
        }
      />
    </div>
  );
}
export default App;
