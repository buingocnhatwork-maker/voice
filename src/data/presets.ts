import { TextPreset } from '../types';

export const TEXT_PRESETS: TextPreset[] = [
  {
    id: 'welcome-studio',
    title: 'Studio Welcome',
    category: 'Narration',
    style: 'natural',
    suggestedVoice: 'Kore',
    mode: 'single',
    text: 'Welcome to the Text to Speech Studio. Type or paste any script here, choose your preferred voice personality, and generate lifelike studio-grade speech in seconds.',
  },
  {
    id: 'podcast-intro',
    title: 'Podcast Intro',
    category: 'Podcast',
    style: 'enthusiastic',
    suggestedVoice: 'Puck',
    mode: 'single',
    text: 'Hey everyone, welcome back to The Frontier Podcast! Today, we are breaking down breakthrough technologies, generative models, and how artificial intelligence is transforming human creativity.',
  },
  {
    id: 'deep-meditation',
    title: 'Guided Relaxation',
    category: 'Meditation',
    style: 'calm',
    suggestedVoice: 'Charon',
    mode: 'single',
    text: 'Take a slow, deep breath in... hold it gently at the top... and let all the tension melt away as you exhale. Feel the quiet stillness settling into your mind.',
  },
  {
    id: 'breaking-news',
    title: 'News Bulletin',
    category: 'Business',
    style: 'serious',
    suggestedVoice: 'Fenrir',
    mode: 'single',
    text: 'This is the hourly technology briefing. Markets rallied today following groundbreaking announcements in clean energy infrastructure and next-generation computing architectures.',
  },
  {
    id: 'fairy-tale',
    title: 'Enchanted Tale',
    category: 'Creative',
    style: 'storyteller',
    suggestedVoice: 'Aoede',
    mode: 'single',
    text: 'High atop the whispering mountains, where mist dances between silver pines, an ancient traveler unlocked a hidden gate forged from fallen starlight.',
  },
  {
    id: 'dialogue-tech',
    title: 'Dual-Speaker Debate',
    category: 'Dialogue',
    style: 'natural',
    suggestedVoice: 'Kore',
    mode: 'multi',
    speakers: [
      { speaker: 'Alex', voice: 'Kore' },
      { speaker: 'Jordan', voice: 'Puck' },
    ],
    text: `TTS the following conversation between Alex and Jordan:
Alex: Have you tested the new speech synthesis model yet?
Jordan: Yes! The cadence and natural phrasing are honestly incredible.
Alex: I love how easily you can switch between warm conversational tones and intense cinematic pacing.
Jordan: Exactly. It makes generating narrations, audiobooks, and character dialogues effortless.`,
  },
  {
    id: 'dialogue-interview',
    title: 'Radio Interview',
    category: 'Dialogue',
    style: 'serious',
    suggestedVoice: 'Fenrir',
    mode: 'multi',
    speakers: [
      { speaker: 'Host', voice: 'Fenrir' },
      { speaker: 'Guest', voice: 'Zephyr' },
    ],
    text: `TTS the following conversation between Host and Guest:
Host: Welcome back. Doctor Vance, what inspired your team's latest research on acoustic synthesis?
Guest: We wanted to bridge the gap between mechanical speech and genuine emotional expression, giving creators full artistic control.
Host: And the feedback from creators has been overwhelmingly positive so far.`,
  },
];
