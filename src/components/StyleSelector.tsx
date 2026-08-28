import React from 'react';
import { SPEECH_STYLES } from '../data/voices';
import { SpeechStyle } from '../types';
import {
  Sparkles,
  Smile,
  Radio,
  Waves,
  BookOpen,
  Film,
  Volume1,
  Flame,
  Wand2,
} from 'lucide-react';

interface StyleSelectorProps {
  selectedStyle: SpeechStyle;
  onSelectStyle: (style: SpeechStyle) => void;
  disabled?: boolean;
}

const ICONS: Record<string, React.ElementType> = {
  Sparkles,
  Smile,
  Radio,
  Waves,
  BookOpen,
  Film,
  Volume1,
  Flame,
};

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  selectedStyle,
  onSelectStyle,
  disabled = false,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] flex items-center space-x-1.5">
          <Wand2 className="w-3.5 h-3.5 text-[#111827]" />
          <span>Speech Delivery & Expressive Mode</span>
        </label>
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#9CA3AF]">
          Directive Tuning
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {SPEECH_STYLES.map((style) => {
          const isSelected = selectedStyle === style.id;
          const Icon = ICONS[style.iconName] || Sparkles;

          return (
            <button
              type="button"
              key={style.id}
              id={`style-chip-${style.id}`}
              disabled={disabled}
              onClick={() => onSelectStyle(style.id)}
              className={`flex items-start space-x-2.5 p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-2 border-[#111827] bg-[#F9FAFB] text-[#111827] shadow-xs'
                  : 'border border-[#E5E7EB] bg-white text-[#374151] hover:border-[#9CA3AF] hover:bg-[#FAFAFA]'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div
                className={`p-1.5 rounded-md shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-[#111827] text-white'
                    : 'bg-[#F3F4F6] text-[#6B7280]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold truncate leading-tight">
                  {style.label}
                </div>
                <div className="text-[10px] text-[#6B7280] line-clamp-1 mt-0.5">
                  {style.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

