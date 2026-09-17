import React from 'react';
import { VerdictBand } from '../types';
import { SparklesIcon } from './Icons';

interface VerdictBlockProps {
  confirmedCount: number;
  band: VerdictBand;
  verdictSentence: string;
  onTriggerRewrite?: () => void;
  isRewriting?: boolean;
}

export const VerdictBlock: React.FC<VerdictBlockProps> = ({
  confirmedCount,
  band,
  verdictSentence,
  onTriggerRewrite,
  isRewriting = false,
}) => {
  const getBandStyles = () => {
    switch (band) {
      case 'CONCRETE':
        return {
          bg: 'bg-emerald-950/20 border-emerald-500/30',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          numberColor: 'text-emerald-400',
        };
      case 'PARTIAL':
        return {
          bg: 'bg-amber-950/20 border-amber-500/30',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          numberColor: 'text-amber-400',
        };
      case 'VAGUE':
      default:
        return {
          bg: 'bg-rose-950/20 border-rose-500/30',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          numberColor: 'text-rose-400',
        };
    }
  };

  const styles = getBandStyles();

  return (
    <div
      id="verdict-block"
      className={`p-6 sm:p-8 rounded-lg border ${styles.bg} transition-all space-y-4`}
    >
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <span className={`font-display text-4xl sm:text-5xl font-bold tracking-tight ${styles.numberColor}`}>
            {confirmedCount} <span className="text-xl sm:text-2xl text-[#8b949e] font-normal">/ 7</span>
          </span>
          <span
            id="verdict-band-badge"
            className={`text-xs uppercase tracking-wider font-semibold px-2.5 py-1 rounded border ${styles.badge}`}
          >
            {band}
          </span>
        </div>

        {band === 'VAGUE' && onTriggerRewrite && (
          <button
            id="btn-rewrite-honest"
            disabled={isRewriting}
            onClick={onTriggerRewrite}
            className="min-h-[44px] self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-amber-300 hover:text-amber-100 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 rounded transition-colors cursor-pointer"
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>{isRewriting ? 'Generating honest advert…' : 'Rewrite as honest advert'}</span>
          </button>
        )}
      </div>

      <p id="verdict-sentence" className="font-display text-lg sm:text-xl text-[#f0f6fc] leading-snug">
        {verdictSentence}
      </p>
    </div>
  );
};
