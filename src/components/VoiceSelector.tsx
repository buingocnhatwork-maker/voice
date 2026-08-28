import React, { useState } from 'react';
import { VOICES } from '../data/voices';
import { VoiceName } from '../types';
import { Check, Volume2, User } from 'lucide-react';

interface VoiceSelectorProps {
  selectedVoice: VoiceName;
  onSelectVoice: (voice: VoiceName) => void;
  disabled?: boolean;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onSelectVoice,
  disabled = false,
}) => {
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);

  // Instant browser preview using Web Speech API for quick auditioning
  const handleAudition = (e: React.MouseEvent, voiceName: VoiceName) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const samplePhrases: Record<VoiceName, string> = {
      Kore: 'Hello! I am Kore. Warm, articulate, and ready to bring your words to life.',
      Puck: 'Hey there! I am Puck, crisp, lively, and full of natural energy.',
      Fenrir: 'Greetings. I am Fenrir. Resonant, deep, and measured for authoritative reads.',
      Charon: 'Welcome. I am Charon. Calm, serene, and grounded for relaxing listening.',
      Zephyr: 'Hi! I am Zephyr. Modern, friendly, and bright for clear announcements.',
      Aoede: 'Greetings. I am Aoede. Melodic, expressive, and crafted for rich storytelling.',
    };

    const utterance = new SpeechSynthesisUtterance(samplePhrases[voiceName]);
    const voices = window.speechSynthesis.getVoices();
    
    // Attempt to match male/female browser voice if available
    const targetGender = VOICES.find((v) => v.id === voiceName)?.gender;
    if (targetGender === 'Male') {
      const maleVoice = voices.find((v) => /male|guy|david|george/i.test(v.name));
      if (maleVoice) utterance.voice = maleVoice;
      utterance.pitch = 0.9;
    } else {
      const femaleVoice = voices.find((v) => /female|zira|samantha|karen|victoria/i.test(v.name));
      if (femaleVoice) utterance.voice = femaleVoice;
      utterance.pitch = 1.05;
    }

    utterance.onstart = () => setPlayingPreview(voiceName);
    utterance.onend = () => setPlayingPreview(null);
    utterance.onerror = () => setPlayingPreview(null);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] flex items-center space-x-1.5">
          <User className="w-3.5 h-3.5 text-[#111827]" />
          <span>Voice Personality</span>
        </label>
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#9CA3AF]">
          6 Studio Neural Profiles
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {VOICES.map((voice) => {
          const isSelected = selectedVoice === voice.id;
          const isAuditioning = playingPreview === voice.id;

          return (
            <div
              key={voice.id}
              id={`voice-card-${voice.id.toLowerCase()}`}
              onClick={() => !disabled && onSelectVoice(voice.id)}
              className={`relative rounded-lg p-3.5 border text-left cursor-pointer transition-all duration-150 ${
                isSelected
                  ? 'border-2 border-[#111827] bg-[#F9FAFB] shadow-xs'
                  : 'border border-[#E5E7EB] bg-white hover:border-[#9CA3AF] hover:bg-[#FAFAFA]'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {/* Top row: Name & Gender Badge */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-[#111827]">
                    {voice.name}
                  </span>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-sm bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB]">
                    {voice.gender} • {voice.accent}
                  </span>
                </div>

                {isSelected && (
                  <div className="h-5 w-5 rounded-sm bg-[#111827] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Tagline */}
              <p className="text-xs font-semibold text-[#374151] mb-1">
                {voice.tagline}
              </p>

              {/* Description */}
              <p className="text-[11px] text-[#6B7280] line-clamp-2 leading-relaxed">
                {voice.description}
              </p>

              {/* Audition sample button */}
              <div className="mt-3 pt-2 border-t border-[#E5E7EB] flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#9CA3AF] uppercase">
                  {voice.recommendedStyles.slice(0, 2).join(', ')}
                </span>
                <button
                  type="button"
                  id={`audition-btn-${voice.id.toLowerCase()}`}
                  onClick={(e) => handleAudition(e, voice.id)}
                  className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-sm text-[11px] font-semibold transition-colors cursor-pointer ${
                    isAuditioning
                      ? 'bg-[#111827] text-white animate-pulse'
                      : 'text-[#374151] bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#D1D5DB]'
                  }`}
                  title="Audition sample phrase"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>{isAuditioning ? 'Playing...' : 'Audition'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

