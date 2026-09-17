import React from 'react';
import { KeyIcon } from './Icons';

interface HeaderProps {
  hasKey: boolean;
  onOpenSettings: () => void;
  onReset: () => void;
  showReset: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  hasKey,
  onOpenSettings,
  onReset,
  showReset,
}) => {
  return (
    <header className="border-b border-[#21262d] bg-[#12151a] sticky top-0 z-30 px-4 sm:px-8 py-3.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-3.5">
          <button
            id="nav-logo-btn"
            onClick={onReset}
            className="text-left group cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500 rounded px-1"
          >
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white inline-block">
              On Paper
            </h1>
          </button>
          <span className="hidden sm:inline-block text-sm text-[#8b949e] border-l border-[#30363d] pl-3.5 font-normal">
            what this advert actually commits to.
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {showReset && (
            <button
              id="header-new-advert-btn"
              onClick={onReset}
              className="min-h-[44px] px-3.5 py-2 text-xs uppercase tracking-wider font-semibold text-[#c9d1d9] hover:text-white bg-[#1e232b] hover:bg-[#282f3a] border border-[#30363d] rounded transition-colors"
            >
              New Advert
            </button>
          )}

          <button
            id="settings-key-btn"
            onClick={onOpenSettings}
            className={`min-h-[44px] inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded border transition-colors ${
              hasKey
                ? 'border-[#238636]/40 text-[#7ee787] bg-[#162a1c]/60 hover:bg-[#1f3b27]'
                : 'border-amber-500/40 text-amber-300 bg-amber-950/40 hover:bg-amber-900/50'
            }`}
            title="Configure Gemini API Key"
          >
            <KeyIcon className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{hasKey ? 'Key Connected' : 'Set API Key'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
