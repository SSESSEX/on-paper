import React, { useState } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveKey: (key: string) => void;
  hasEnvKey: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveKey,
  hasEnvKey,
}) => {
  const [inputVal, setInputVal] = useState(apiKey);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKey(inputVal.trim());
    onClose();
  };

  const handleClear = () => {
    setInputVal('');
    onSaveKey('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#21262d] flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-white">
            Gemini API Key Settings
          </h3>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] text-[#8b949e] hover:text-white flex items-center justify-center text-xl font-bold rounded"
            aria-label="Close settings"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {hasEnvKey && (
            <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded text-xs text-emerald-300">
              ✓ Server environment key is detected (<code className="font-mono">GEMINI_API_KEY</code>). You can leave this blank to use the environment key, or enter a custom key below to override it for this session.
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="modal-gemini-key" className="block text-xs font-semibold uppercase tracking-wider text-[#8b949e]">
              Gemini API Key
            </label>
            <input
              id="modal-gemini-key"
              type="password"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#0d1117] border border-[#30363d] rounded text-sm text-[#e6edf3] font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
            {/* Exact note mandated by section 2 of BUILD_PROMPT.md */}
            <p className="text-xs text-[#8b949e] leading-relaxed pt-1">
              This key is used directly from your browser. Fine for a local demo — do not
              deploy this page publicly with a key in it.
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#21262d]">
            {apiKey ? (
              <button
                type="button"
                onClick={handleClear}
                className="min-h-[44px] px-3 text-xs text-rose-400 hover:text-rose-300 font-medium"
              >
                Clear key
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#8b949e] hover:text-white rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-[#e6edf3] hover:bg-white text-[#0d0f12] rounded transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
