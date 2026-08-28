export type VoiceName = 'Kore' | 'Puck' | 'Fenrir' | 'Charon' | 'Zephyr' | 'Aoede';

export type SpeechStyle =
  | 'natural'
  | 'cheerful'
  | 'serious'
  | 'calm'
  | 'dramatic'
  | 'whisper'
  | 'enthusiastic'
  | 'storyteller';

export interface VoiceProfile {
  id: VoiceName;
  name: string;
  gender: 'Female' | 'Male' | 'Neutral';
  accent: string;
  tagline: string;
  description: string;
  recommendedStyles: SpeechStyle[];
  badgeColor: string;
}

export interface SpeakerConfig {
  speaker: string;
  voice: VoiceName;
}

export interface GenerationHistoryItem {
  id: string;
  timestamp: number;
  text: string;
  voice: string;
  style: SpeechStyle | string;
  mode: 'single' | 'multi';
  audioUrl: string;
  duration?: number;
  charCount: number;
  speakers?: SpeakerConfig[];
}

export interface TextPreset {
  id: string;
  title: string;
  category: 'Narration' | 'Podcast' | 'Business' | 'Meditation' | 'Dialogue' | 'Creative';
  style: SpeechStyle;
  suggestedVoice: VoiceName;
  mode: 'single' | 'multi';
  text: string;
  speakers?: SpeakerConfig[];
}
