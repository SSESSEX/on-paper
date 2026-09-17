import React from 'react';
import { EvaluatedCommitment } from '../types';
import { AbsentIcon, ConfirmedIcon, UnverifiedIcon } from './Icons';

interface CommitmentRowProps {
  commitment: EvaluatedCommitment;
  onSelectQuote?: (quote: string) => void;
  isSelected?: boolean;
}

export const CommitmentRow: React.FC<CommitmentRowProps> = ({
  commitment,
  onSelectQuote,
  isSelected = false,
}) => {
  const { status, label, quote, unverifiedNote } = commitment;

  const isConfirmed = status === 'confirmed';
  const isUnverified = status === 'unverified';

  const handleClick = () => {
    if (isConfirmed && onSelectQuote && quote) {
      onSelectQuote(quote);
    }
  };

  return (
    <div
      id={`commitment-row-${commitment.key}`}
      onClick={handleClick}
      className={`p-4 sm:p-5 rounded border transition-all ${
        isConfirmed
          ? isSelected
            ? 'bg-[#1e2530] border-amber-500 shadow-md ring-1 ring-amber-500 cursor-pointer'
            : 'bg-[#161b22] border-[#30363d] hover:border-[#484f58] hover:bg-[#1a212b] cursor-pointer'
          : isUnverified
          ? 'bg-[#1b1715] border-amber-900/50'
          : 'bg-[#111419] border-[#21262d] opacity-80'
      }`}
      role={isConfirmed ? 'button' : undefined}
      tabIndex={isConfirmed ? 0 : undefined}
      onKeyDown={(e) => {
        if (isConfirmed && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="flex items-start gap-3.5">
        {/* Status icon */}
        <div className="pt-0.5 shrink-0">
          {status === 'confirmed' && <ConfirmedIcon className="w-5 h-5 text-emerald-400" />}
          {status === 'absent' && <AbsentIcon className="w-5 h-5 text-zinc-500" />}
          {status === 'unverified' && <UnverifiedIcon className="w-5 h-5 text-amber-400" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-sm sm:text-base font-medium text-[#f0f6fc]">
              {label}
            </h3>

            {isConfirmed && (
              <span className="text-[11px] uppercase tracking-wider text-amber-400/80 font-medium shrink-0">
                {isSelected ? 'Highlighted below' : 'Click to highlight'}
              </span>
            )}
          </div>

          {status === 'confirmed' && (
            <div className="text-sm text-[#e6edf3] font-serif italic bg-[#0d1117] p-2.5 rounded border border-[#21262d] leading-relaxed text-[#fef3c7]">
              “{quote}”
            </div>
          )}

          {status === 'absent' && (
            <p className="text-sm text-[#8b949e] italic">
              not stated
            </p>
          )}

          {status === 'unverified' && (
            <div className="space-y-1 text-sm">
              <p className="text-amber-400 font-medium">
                {unverifiedNote || "the model quoted something that isn't in the advert"}
              </p>
              {quote && (
                <p className="text-xs text-[#8b949e] font-mono bg-[#0d1117] p-2 rounded border border-[#30363d]">
                  Model quote: "{quote}"
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
