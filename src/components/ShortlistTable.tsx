import React from 'react';
import { COMMITMENT_DEFINITIONS } from '../constants';
import { AdvertAnalysis, CommitmentKey } from '../types';
import { AbsentIcon, ConfirmedIcon, UnverifiedIcon } from './Icons';

interface ShortlistTableProps {
  analyses: AdvertAnalysis[];
  selectedIndex: number;
  onSelectAdvert: (index: number) => void;
  requestSummary: string;
}

export const ShortlistTable: React.FC<ShortlistTableProps> = ({
  analyses,
  selectedIndex,
  onSelectAdvert,
  requestSummary,
}) => {
  // Sort descending by confirmed count per Phase 2 spec
  const sortedAnalyses = [...analyses].sort((a, b) => b.confirmedCount - a.confirmedCount);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#21262d] pb-3">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
          Shortlist Comparison
        </h2>
        <span
          id="shortlist-callout"
          className="text-xs uppercase tracking-wider font-semibold text-amber-400 font-mono bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30"
        >
          {requestSummary}
        </span>
      </div>

      <div className="overflow-x-auto border border-[#30363d] rounded-lg bg-[#161b22]">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-[#30363d] bg-[#0d1117] text-[#8b949e] text-xs font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Role / Advert</th>
              {COMMITMENT_DEFINITIONS.map((c) => (
                <th key={c.key} className="py-3 px-2 text-center" title={c.label}>
                  <span className="truncate max-w-[60px] inline-block">{c.key}</span>
                </th>
              ))}
              <th className="py-3 px-4 text-center">Score</th>
              <th className="py-3 px-4 text-right">Band</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#21262d]">
            {sortedAnalyses.map((item) => {
              const isSelected = item.id === analyses[selectedIndex]?.id;
              const originalIdx = analyses.findIndex((a) => a.id === item.id);

              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectAdvert(originalIdx)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#1f2937] text-white font-medium'
                      : 'hover:bg-[#1c2128] text-[#c9d1d9]'
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5 max-w-[220px] sm:max-w-xs truncate">
                      <div className="font-semibold text-[#f0f6fc] truncate">
                        {item.title || `Advert #${originalIdx + 1}`}
                      </div>
                      <div className="text-xs text-[#8b949e] truncate">
                        {item.employer || 'Employer not stated'}
                      </div>
                    </div>
                  </td>

                  {COMMITMENT_DEFINITIONS.map((def) => {
                    const commit = item.commitments.find((c) => c.key === def.key);
                    const status = commit?.status || 'absent';

                    return (
                      <td key={def.key} className="py-3 px-2 text-center">
                        <div className="flex items-center justify-center">
                          {status === 'confirmed' && <ConfirmedIcon className="w-4 h-4 text-emerald-400" />}
                          {status === 'absent' && <AbsentIcon className="w-4 h-4 text-zinc-600" />}
                          {status === 'unverified' && <UnverifiedIcon className="w-4 h-4 text-amber-400" />}
                        </div>
                      </td>
                    );
                  })}

                  <td className="py-3.5 px-4 text-center font-bold">
                    <span className={item.confirmedCount >= 5 ? 'text-emerald-400' : item.confirmedCount >= 3 ? 'text-amber-400' : 'text-rose-400'}>
                      {item.confirmedCount} <span className="text-[#8b949e] font-normal text-xs">/ 7</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded border ${
                        item.band === 'CONCRETE'
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                          : item.band === 'PARTIAL'
                          ? 'bg-amber-950/40 text-amber-300 border-amber-500/40'
                          : 'bg-rose-950/40 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {item.band}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-[#8b949e] italic">
        Click any row above to inspect the individual breakdown and highlighted quote evidence below.
      </p>
    </div>
  );
};
