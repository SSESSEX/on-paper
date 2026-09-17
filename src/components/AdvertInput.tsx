import React from 'react';
import {
  CONCRETE_EXAMPLE,
  SHORTLIST_EXAMPLE_TEXT,
  VAGUE_EXAMPLE,
} from '../examples';
import { SpinnerIcon } from './Icons';

interface AdvertInputProps {
  title: string;
  setTitle: (val: string) => void;
  employer: string;
  setEmployer: (val: string) => void;
  advert: string;
  setAdvert: (val: string) => void;
  isLoading: boolean;
  onRead: () => void;
  errorMessage: string | null;
  onClearError: () => void;
}

export const AdvertInput: React.FC<AdvertInputProps> = ({
  title,
  setTitle,
  employer,
  setEmployer,
  advert,
  setAdvert,
  isLoading,
  onRead,
  errorMessage,
  onClearError,
}) => {
  const charCount = advert.trim().length;
  const isShortlist = advert.includes('\n---') || advert.includes('---');
  const isTooShort = charCount > 0 && charCount < 200;
  const canSubmit = charCount >= 200 && !isLoading;

  const loadConcrete = (e: React.MouseEvent) => {
    e.preventDefault();
    onClearError();
    setTitle(CONCRETE_EXAMPLE.title);
    setEmployer(CONCRETE_EXAMPLE.employer);
    setAdvert(CONCRETE_EXAMPLE.text);
  };

  const loadVague = (e: React.MouseEvent) => {
    e.preventDefault();
    onClearError();
    setTitle(VAGUE_EXAMPLE.title);
    setEmployer(VAGUE_EXAMPLE.employer);
    setAdvert(VAGUE_EXAMPLE.text);
  };

  const loadShortlist = (e: React.MouseEvent) => {
    e.preventDefault();
    onClearError();
    setTitle('');
    setEmployer('');
    setAdvert(SHORTLIST_EXAMPLE_TEXT);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Editorial intro statement */}
      <div className="space-y-2 border-b border-[#21262d] pb-6">
        <p className="font-display text-xl sm:text-2xl text-[#f0f6fc] leading-snug">
          A job advert is a document. It makes some commitments and avoids others.
        </p>
        <p className="text-sm text-[#8b949e] max-w-2xl leading-relaxed">
          On Paper reads an advert and reports what the employer has actually committed to in writing across seven specific categories, quoting the exact sentence behind each. It does not judge or predict.
        </p>
      </div>

      {/* Error state if returned */}
      {errorMessage && (
        <div
          id="error-banner"
          className="p-4 rounded border border-rose-500/50 bg-rose-950/40 text-rose-200 text-sm flex items-start justify-between gap-3"
        >
          <div className="space-y-1">
            <p className="font-semibold">{errorMessage}</p>
            <p className="text-xs text-rose-300/80">
              Your pasted advert has been preserved. Check your key or try again.
            </p>
          </div>
          <button
            onClick={onClearError}
            className="min-h-[44px] min-w-[44px] text-rose-400 hover:text-rose-200 flex items-center justify-center font-bold text-lg"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Two optional inputs above textarea */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="input-job-title" className="block text-xs font-semibold uppercase tracking-wider text-[#8b949e] mb-1.5">
            Job title <span className="text-xs normal-case text-[#484f58] font-normal">(optional)</span>
          </label>
          <input
            id="input-job-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Lead Data Engineer"
            className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#161b22] border border-[#30363d] rounded text-[#e6edf3] placeholder-[#484f58] text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="input-employer" className="block text-xs font-semibold uppercase tracking-wider text-[#8b949e] mb-1.5">
            Employer <span className="text-xs normal-case text-[#484f58] font-normal">(optional)</span>
          </label>
          <input
            id="input-employer"
            type="text"
            value={employer}
            onChange={(e) => setEmployer(e.target.value)}
            placeholder="e.g. Apex Metallurgy Ltd"
            className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#161b22] border border-[#30363d] rounded text-[#e6edf3] placeholder-[#484f58] text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* Textarea */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="input-advert-text" className="block text-xs font-semibold uppercase tracking-wider text-[#8b949e]">
            Job advert text
          </label>
          <div className="text-xs text-[#8b949e]">
            {charCount > 0 && (
              <span className={isTooShort ? 'text-amber-400 font-medium' : 'text-[#8b949e]'}>
                {charCount.toLocaleString()} characters {isShortlist && '· shortlist mode detected'}
              </span>
            )}
          </div>
        </div>

        <textarea
          id="input-advert-text"
          rows={12}
          value={advert}
          onChange={(e) => {
            setAdvert(e.target.value);
            if (errorMessage) onClearError();
          }}
          placeholder="Paste the whole job advert here."
          className="w-full p-4 bg-[#161b22] border border-[#30363d] rounded text-[#e6edf3] placeholder-[#484f58] text-sm sm:text-base leading-relaxed focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-y font-sans"
        />

        {/* Too short warning per §6.1 */}
        {isTooShort && (
          <p id="short-advert-warning" className="text-xs text-amber-400 font-medium py-1">
            Too short to read — paste the full advert.
          </p>
        )}
      </div>

      {/* Bottom controls: Try an example links & primary button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#8b949e]">
          <span className="font-semibold text-[#c9d1d9]">Try an example:</span>
          <button
            id="example-concrete-btn"
            onClick={loadConcrete}
            className="min-h-[44px] px-2.5 py-1 text-emerald-400 hover:text-emerald-300 underline underline-offset-4 cursor-pointer focus:outline-none"
          >
            Concrete (7 of 7)
          </button>
          <span className="text-[#30363d]">·</span>
          <button
            id="example-vague-btn"
            onClick={loadVague}
            className="min-h-[44px] px-2.5 py-1 text-rose-400 hover:text-rose-300 underline underline-offset-4 cursor-pointer focus:outline-none"
          >
            Vague pipeline (0 of 7)
          </button>
          <span className="text-[#30363d]">·</span>
          <button
            id="example-shortlist-btn"
            onClick={loadShortlist}
            className="min-h-[44px] px-2.5 py-1 text-amber-400 hover:text-amber-300 underline underline-offset-4 cursor-pointer focus:outline-none"
          >
            Shortlist (5 adverts)
          </button>
        </div>

        <button
          id="btn-read-it"
          disabled={!canSubmit}
          onClick={onRead}
          className={`min-h-[44px] w-full sm:w-auto px-8 py-2.5 rounded font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer ${
            canSubmit
              ? 'bg-[#e6edf3] text-[#0d0f12] hover:bg-white active:scale-[0.99] shadow-lg shadow-black/30'
              : 'bg-[#21262d] text-[#484f58] cursor-not-allowed border border-[#30363d]'
          }`}
        >
          {isLoading ? (
            <>
              <SpinnerIcon className="w-4 h-4 text-[#0d0f12]" />
              <span>Reading advert…</span>
            </>
          ) : (
            <span>Read it</span>
          )}
        </button>
      </div>
    </div>
  );
};
