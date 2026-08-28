import React from 'react';
import { Volume2, CheckCircle2, AlertCircle, History } from 'lucide-react';

interface HeaderProps {
  hasApiKey: boolean | null;
  historyCount: number;
  onOpenHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  hasApiKey,
  historyCount,
  onOpenHistory,
}) => {
  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 sm:px-8 shrink-0 sticky top-0 z-30">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-[#111827] flex items-center justify-center rounded-sm shrink-0 shadow-xs">
          <div className="w-4 h-4 border-2 border-white rotate-45" />
        </div>
        <div className="flex items-center space-x-3">
          <span className="font-bold text-lg sm:text-xl tracking-tight text-[#111827]">
            LEXICON<span className="text-[#6B7280] font-normal">.TTS</span>
          </span>
          <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB]">
            Gemini 3.1 Flash Audio
          </span>
        </div>
      </div>

      {/* Navigation / Actions */}
      <div className="flex items-center space-x-4 sm:space-x-6">
        {/* Service Status */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-[#F9FAFB] text-xs font-medium text-[#374151] border border-[#E5E7EB]">
          {hasApiKey === null ? (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          ) : hasApiKey ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Engine Active</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Local Mode</span>
            </>
          )}
        </div>

        {/* History button */}
        <button
          id="history-toggle-btn"
          onClick={onOpenHistory}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-semibold text-[#111827] bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#D1D5DB] transition-colors cursor-pointer"
        >
          <History className="w-3.5 h-3.5 text-[#6B7280]" />
          <span>History</span>
          {historyCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-sm text-[10px] font-mono font-bold bg-[#111827] text-white">
              {historyCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

