import React from 'react';
import { GenerationHistoryItem } from '../types';
import {
  X,
  Play,
  Download,
  Trash2,
  Clock,
  Volume2,
} from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: GenerationHistoryItem[];
  onSelectHistoryItem: (item: GenerationHistoryItem) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onDeleteHistoryItem,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const handleDownloadItem = (e: React.MouseEvent, item: GenerationHistoryItem) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = item.audioUrl;
    a.download = `tts-${item.voice.toLowerCase()}-${item.timestamp}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-[#E5E7EB] transition-all">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Clock className="w-4 h-4 text-[#111827]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#111827]">
              Generation Log
            </h2>
            <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB]">
              {history.length}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded-sm hover:bg-rose-50 transition-colors cursor-pointer"
              >
                Clear all
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6">
              <div className="h-10 w-10 rounded-sm bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] mb-3">
                <Volume2 className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#111827]">
                No recordings yet
              </p>
              <p className="text-xs text-[#6B7280] mt-1 max-w-xs">
                Synthesized audio master files will be retained here during your session.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectHistoryItem(item)}
                className="group p-3.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] hover:bg-white hover:border-[#111827] transition-all cursor-pointer space-y-2 relative shadow-2xs"
              >
                {/* Meta info */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#111827]">
                      {item.voice}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-white text-[#374151] border border-[#E5E7EB]">
                      {item.style}
                    </span>
                    {item.mode === 'multi' && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-[#111827] text-white">
                        Dialogue
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-[#9CA3AF]">
                    {formatDate(item.timestamp)}
                  </span>
                </div>

                {/* Text excerpt */}
                <p className="text-xs text-[#374151] line-clamp-2 leading-relaxed">
                  {item.text}
                </p>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-1.5 border-t border-[#E5E7EB]">
                  <span className="text-[10px] font-mono text-[#9CA3AF]">
                    {item.charCount} chars
                  </span>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectHistoryItem(item);
                      }}
                      className="p-1 rounded-sm text-[#6B7280] hover:text-[#111827] hover:bg-[#E5E7EB]"
                      title="Load and Play"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDownloadItem(e, item)}
                      className="p-1 rounded-sm text-[#6B7280] hover:text-[#111827] hover:bg-[#E5E7EB]"
                      title="Download WAV"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteHistoryItem(item.id);
                      }}
                      className="p-1 rounded-sm text-[#9CA3AF] hover:text-rose-600 hover:bg-rose-50"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

