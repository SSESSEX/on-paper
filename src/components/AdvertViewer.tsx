import React, { useEffect, useRef } from 'react';
import { normalise } from '../lib/extractor';

interface AdvertViewerProps {
  title?: string;
  employer?: string;
  advert: string;
  activeQuote: string | null;
}

export const AdvertViewer: React.FC<AdvertViewerProps> = ({
  title,
  employer,
  advert,
  activeQuote,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLElement>(null);

  // When activeQuote changes, scroll the highlighted mark into view
  useEffect(() => {
    if (activeQuote && markRef.current) {
      markRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeQuote]);

  // Helper to render advert text with highlight
  const renderHighlightedText = () => {
    if (!activeQuote || !activeQuote.trim()) {
      return <span>{advert}</span>;
    }

    const normQuote = normalise(activeQuote);
    const normAdvert = normalise(advert);

    if (!normAdvert.includes(normQuote)) {
      return <span>{advert}</span>;
    }

    // Try exact literal substring match first
    let startIndex = advert.toLowerCase().indexOf(activeQuote.toLowerCase());

    // If literal match fails (e.g. whitespace or curly quotes difference), search using tokens
    if (startIndex === -1) {
      const tokens = activeQuote.trim().split(/\s+/);
      if (tokens.length > 0) {
        const firstToken = tokens[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const lastToken = tokens[tokens.length - 1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const fuzzyRegex = new RegExp(`${firstToken}[\\s\\S]*?${lastToken}`, 'i');
        const match = advert.match(fuzzyRegex);
        if (match && match.index !== undefined) {
          startIndex = match.index;
          const matchLength = match[0].length;
          const before = advert.substring(0, startIndex);
          const matched = advert.substring(startIndex, startIndex + matchLength);
          const after = advert.substring(startIndex + matchLength);

          return (
            <>
              <span>{before}</span>
              <mark ref={markRef} id="active-highlight" className="quote-highlight active">
                {matched}
              </mark>
              <span>{after}</span>
            </>
          );
        }
      }
      return <span>{advert}</span>;
    }

    const before = advert.substring(0, startIndex);
    const matched = advert.substring(startIndex, startIndex + activeQuote.length);
    const after = advert.substring(startIndex + activeQuote.length);

    return (
      <>
        <span>{before}</span>
        <mark ref={markRef} id="active-highlight" className="quote-highlight active">
          {matched}
        </mark>
        <span>{after}</span>
      </>
    );
  };

  return (
    <div className="space-y-3 pt-6 border-t border-[#21262d]">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8b949e]">
          Original advert text
        </h3>
        {activeQuote && (
          <span className="text-xs text-amber-400 font-medium">
            Highlighting quote
          </span>
        )}
      </div>

      <div
        ref={containerRef}
        className="p-5 bg-[#12151a] border border-[#21262d] rounded-lg text-[#c9d1d9] text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans max-h-[500px] overflow-y-auto"
      >
        {(title || employer) && (
          <div className="mb-4 pb-3 border-b border-[#21262d] text-xs font-medium text-[#8b949e] space-y-0.5">
            {title && <div><span className="text-[#484f58] uppercase">Title:</span> {title}</div>}
            {employer && <div><span className="text-[#484f58] uppercase">Employer:</span> {employer}</div>}
          </div>
        )}
        {renderHighlightedText()}
      </div>
    </div>
  );
};
