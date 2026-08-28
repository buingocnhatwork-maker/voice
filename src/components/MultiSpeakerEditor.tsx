import React from 'react';
import { SpeakerConfig, VoiceName } from '../types';
import { VOICES } from '../data/voices';
import { Users, Plus, MessageSquare } from 'lucide-react';

interface MultiSpeakerEditorProps {
  speakers: SpeakerConfig[];
  onChangeSpeakers: (speakers: SpeakerConfig[]) => void;
  scriptText: string;
  onChangeScriptText: (text: string) => void;
  disabled?: boolean;
}

export const MultiSpeakerEditor: React.FC<MultiSpeakerEditorProps> = ({
  speakers,
  onChangeSpeakers,
  scriptText,
  onChangeScriptText,
  disabled = false,
}) => {
  const updateSpeaker = (index: number, field: keyof SpeakerConfig, value: string) => {
    const updated = [...speakers];
    if (updated[index]) {
      updated[index] = { ...updated[index], [field]: value };
      onChangeSpeakers(updated);
    }
  };

  const handleQuickInsert = (speakerName: string) => {
    const addition = `\n${speakerName}: `;
    onChangeScriptText(scriptText + addition);
  };

  return (
    <div className="space-y-4">
      {/* Speaker Configuration Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F9FAFB] p-4 rounded-lg border border-[#E5E7EB]">
        {speakers.map((sp, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B7280] flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-[#111827]" />
                <span>Speaker {idx + 1} Profile</span>
              </span>
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={sp.speaker}
                disabled={disabled}
                onChange={(e) => updateSpeaker(idx, 'speaker', e.target.value)}
                placeholder={`Speaker ${idx + 1} Name`}
                aria-label={`Speaker ${idx + 1} Name`}
                className="w-1/2 px-3 py-2 text-xs font-medium rounded-md border border-[#E5E7EB] bg-white text-[#111827] focus:outline-none focus:border-[#111827]"
              />

              <select
                value={sp.voice}
                disabled={disabled}
                onChange={(e) => updateSpeaker(idx, 'voice', e.target.value as VoiceName)}
                aria-label={`Speaker ${idx + 1} Voice`}
                className="w-1/2 px-3 py-2 text-xs font-medium rounded-md border border-[#E5E7EB] bg-white text-[#111827] focus:outline-none focus:border-[#111827]"
              >
                {VOICES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.gender}, {v.accent})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1 pt-0.5">
              <button
                type="button"
                onClick={() => handleQuickInsert(sp.speaker)}
                className="text-[11px] font-semibold text-[#111827] hover:underline inline-flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add "{sp.speaker}:" prefix</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Script input area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#6B7280]">
          <label
            htmlFor="multi-speaker-dialogue-input"
            className="font-bold text-[11px] uppercase tracking-wider text-[#6B7280] flex items-center space-x-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#111827]" />
            <span>Dialogue Script Editor</span>
          </label>
          <span className="font-mono text-[10px] text-[#9CA3AF]">Format: Speaker: text</span>
        </div>

        <textarea
          id="multi-speaker-dialogue-input"
          value={scriptText}
          disabled={disabled}
          onChange={(e) => onChangeScriptText(e.target.value)}
          rows={6}
          placeholder={`Alex: Welcome to our studio recording!\nJordan: Great to be here Alex, what are we talking about today?\nAlex: Today we explore AI-generated speech synthesis!`}
          className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm font-mono text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#111827] transition-all"
        />
      </div>
    </div>
  );
};

