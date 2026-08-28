import { VoiceProfile, SpeechStyle } from '../types';

export const VOICES: VoiceProfile[] = [
  {
    id: 'Kore',
    name: 'Kore',
    gender: 'Female',
    accent: 'Neutral Natural',
    tagline: 'Warm, clear & balanced',
    description: 'A versatile, articulate voice perfect for narrations, explanations, and conversational prompts.',
    recommendedStyles: ['natural', 'cheerful', 'calm', 'storyteller'],
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
  },
  {
    id: 'Puck',
    name: 'Puck',
    gender: 'Male',
    accent: 'Lively Expressive',
    tagline: 'Playful, upbeat & crisp',
    description: 'Dynamic, high-energy voice ideal for tutorials, podcasts, cheerful greetings, and characters.',
    recommendedStyles: ['cheerful', 'enthusiastic', 'storyteller', 'natural'],
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    gender: 'Male',
    accent: 'Deep Resonant',
    tagline: 'Authoritative, calm & deep',
    description: 'Rich low tones suitable for formal announcements, cinematic narrations, and serious essays.',
    recommendedStyles: ['serious', 'dramatic', 'calm', 'natural'],
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',
  },
  {
    id: 'Charon',
    name: 'Charon',
    gender: 'Male',
    accent: 'Smooth Meditative',
    tagline: 'Serene, gentle & slow',
    description: 'Relaxed pacing and warm cadence designed for mindfulness sessions, sleep stories, and guides.',
    recommendedStyles: ['calm', 'whisper', 'natural', 'storyteller'],
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    gender: 'Female',
    accent: 'Modern Bright',
    tagline: 'Friendly, bright & modern',
    description: 'Light, friendly timbre for modern assistant prompts, customer service, and commercial reads.',
    recommendedStyles: ['natural', 'cheerful', 'serious', 'enthusiastic'],
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60',
  },
  {
    id: 'Aoede',
    name: 'Aoede',
    gender: 'Female',
    accent: 'Melodic Poetic',
    tagline: 'Expressive, resonant & soulful',
    description: 'Rich modulation and emotional depth for audiobooks, poetry, and dramatic storytelling.',
    recommendedStyles: ['storyteller', 'dramatic', 'whisper', 'cheerful'],
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
  },
];

export const SPEECH_STYLES: {
  id: SpeechStyle;
  label: string;
  description: string;
  iconName: string;
}[] = [
  {
    id: 'natural',
    label: 'Standard',
    description: 'Clean and neutral.',
    iconName: 'Sparkles',
  },
  {
    id: 'cheerful',
    label: 'Cheerful',
    description: 'Upbeat, warm, and inviting tone.',
    iconName: 'Smile',
  },
  {
    id: 'serious',
    label: 'News Anchor',
    description: 'Professional, articulate, and objective delivery.',
    iconName: 'Radio',
  },
  {
    id: 'calm',
    label: 'Meditative',
    description: 'Soft, steady, and soothing cadence.',
    iconName: 'Waves',
  },
  {
    id: 'storyteller',
    label: 'Storyteller',
    description: 'Richly expressive with theatrical pauses.',
    iconName: 'BookOpen',
  },
  {
    id: 'dramatic',
    label: 'Cinematic',
    description: 'Bold, deep emphasis for movie trailers or epic stories.',
    iconName: 'Film',
  },
  {
    id: 'whisper',
    label: 'Whisper',
    description: 'Soft, intimate, and breathy articulation.',
    iconName: 'Volume1',
  },
  {
    id: 'enthusiastic',
    label: 'High Energy',
    description: 'Excited, punchy, and motivating pace.',
    iconName: 'Flame',
  },
];
