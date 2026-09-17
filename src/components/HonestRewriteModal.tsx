import React from 'react';

interface HonestRewriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewrittenText: string | null;
  isLoading: boolean;
  missingLabels: string[];
}

export const HonestRewriteModal: React.FC<HonestRewriteModalProps> = ({
  isOpen,
  onClose,
  rewrittenText,
  isLoading,
  missingLabels,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#21262d] flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl font-bold text-white">
              Honest Advert Preview
            </h3>
            <p className="text-xs text-[#8b949e]">
              Bracketed uppercase placeholders inserted where the employer dodged specifics.
            </p>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] text-[#8b949e] hover:text-white flex items-center justify-center text-xl font-bold rounded"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex flex-wrap gap-1.5 text-xs">
            <span className="text-[#8b949e] font-semibold py-1">Identified absences:</span>
            {missingLabels.map((lbl) => (
              <span key={lbl} className="bg-rose-950/40 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded">
                {lbl}
              </span>
            ))}
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-sm text-[#8b949e] space-y-3">
              <div className="inline-block w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p>Rewriting advert with honest placeholders…</p>
            </div>
          ) : rewrittenText ? (
            <div className="p-4 bg-[#0d1117] border border-[#21262d] rounded text-sm sm:text-base text-[#e6edf3] leading-relaxed whitespace-pre-wrap font-sans">
              {rewrittenText.split(/(\[[A-Z\s'’]+\])/g).map((part, i) => {
                if (part.startsWith('[') && part.endsWith(']')) {
                  return (
                    <span
                      key={i}
                      className="bg-amber-950/80 text-amber-300 border border-amber-500/60 font-mono font-semibold px-1.5 py-0.5 rounded"
                    >
                      {part}
                    </span>
                  );
                }
                return <span key={i}>{part}</span>;
              })}
            </div>
          ) : (
            <p className="text-sm text-zinc-400">No rewritten text available.</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#21262d] bg-[#12151a] flex justify-end">
          <button
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 text-xs uppercase tracking-wider font-semibold bg-[#21262d] hover:bg-[#30363d] text-white rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
