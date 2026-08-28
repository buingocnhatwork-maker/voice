import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { VoiceSelector } from './components/VoiceSelector';
import { StyleSelector } from './components/StyleSelector';
import { AudioPlayer } from './components/AudioPlayer';
import { MultiSpeakerEditor } from './components/MultiSpeakerEditor';
import { HistoryDrawer } from './components/HistoryDrawer';
import { TEXT_PRESETS } from './data/presets';
import { VOICES } from './data/voices';
import {
  VoiceName,
  SpeechStyle,
  SpeakerConfig,
  GenerationHistoryItem,
  TextPreset,
} from './types';
import {
  Sparkles,
  Play,
  Mic,
  Users,
  AlertCircle,
  Clock,
  Trash2,
  Bookmark,
} from 'lucide-react';

const STORAGE_KEY = 'tts_generation_history_v1';

export default function App() {
  // Application State
  const [mode, setMode] = useState<'single' | 'multi'>('single');
  const [text, setText] = useState<string>(
    'Welcome to Lexicon TTS. Transform any text into natural neural speech with lifelike cadence, precision, and expressive dynamic range.'
  );
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>('Kore');
  const [selectedStyle, setSelectedStyle] = useState<SpeechStyle>('natural');
  const [speakers, setSpeakers] = useState<SpeakerConfig[]>([
    { speaker: 'Alex', voice: 'Kore' },
    { speaker: 'Jordan', voice: 'Puck' },
  ]);

  // Loading & Generation State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<{
    audioUrl: string;
    voiceName: string;
    styleName: string;
    textSnippet: string;
    charCount: number;
  } | null>(null);

  // History & Server Status State
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [browserSpeaking, setBrowserSpeaking] = useState<boolean>(false);

  // Load history & check server health on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // ignore
    }

    // Health check
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(data.hasApiKey);
      })
      .catch(() => {
        setHasApiKey(false);
      });
  }, []);

  // Save history to localStorage
  const saveToHistory = (item: GenerationHistoryItem) => {
    const updated = [item, ...history.filter((h) => h.id !== item.id)].slice(0, 30);
    setHistory(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // storage full
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Preset Selection
  const applyPreset = (preset: TextPreset) => {
    setText(preset.text);
    setSelectedStyle(preset.style);
    setSelectedVoice(preset.suggestedVoice);
    setMode(preset.mode);
    if (preset.speakers) {
      setSpeakers(preset.speakers);
    }
    setError(null);
  };

  // Main Speech Generation Trigger
  const handleGenerate = async () => {
    if (!text.trim()) {
      setError('Please enter some text to generate speech.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const payload = {
        text: text.trim(),
        voice: selectedVoice,
        style: selectedStyle,
        mode,
        speakers: mode === 'multi' ? speakers : undefined,
      };

      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Speech generation failed. Please try again.');
      }

      const generatedAudio = {
        audioUrl: data.audioUrl,
        voiceName: mode === 'multi' ? `${speakers[0].speaker} & ${speakers[1].speaker}` : selectedVoice,
        styleName: selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1),
        textSnippet: text.trim(),
        charCount: text.length,
      };

      setCurrentAudio(generatedAudio);

      // Add to session history
      const historyEntry: GenerationHistoryItem = {
        id: `gen-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        text: text.trim(),
        voice: generatedAudio.voiceName,
        style: selectedStyle,
        mode,
        audioUrl: data.audioUrl,
        charCount: text.length,
        speakers: mode === 'multi' ? speakers : undefined,
      };
      saveToHistory(historyEntry);
    } catch (err: any) {
      console.error('Speech generation error:', err);
      setError(err.message || 'An error occurred while generating speech.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Fallback instant browser speech synthesis
  const handleBrowserSpeech = () => {
    if (!('speechSynthesis' in window)) {
      setError('Browser speech synthesis is not supported on this browser.');
      return;
    }

    if (browserSpeaking) {
      window.speechSynthesis.cancel();
      setBrowserSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const targetGender = VOICES.find((v) => v.id === selectedVoice)?.gender;
    if (targetGender === 'Male') {
      const maleVoice = voices.find((v) => /male|guy|david|george/i.test(v.name));
      if (maleVoice) utterance.voice = maleVoice;
    } else {
      const femaleVoice = voices.find((v) => /female|zira|samantha|karen|victoria/i.test(v.name));
      if (femaleVoice) utterance.voice = femaleVoice;
    }

    utterance.onstart = () => setBrowserSpeaking(true);
    utterance.onend = () => setBrowserSpeaking(false);
    utterance.onerror = () => setBrowserSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Calculate estimated reading duration (~150 words per min)
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const estimatedSeconds = Math.max(1, Math.round((wordCount / 145) * 60));

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#111827] flex flex-col font-sans selection:bg-[#111827] selection:text-white">
      {/* Top Geometric Header */}
      <Header
        hasApiKey={hasApiKey}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Studio Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Preset Chips Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B7280] shrink-0 flex items-center space-x-1">
            <Bookmark className="w-3 h-3 text-[#111827]" />
            <span>Templates:</span>
          </span>
          {TEXT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className="px-2.5 py-1 rounded-sm text-xs font-semibold bg-white hover:bg-[#FAFAFA] text-[#374151] hover:text-[#111827] border border-[#E5E7EB] hover:border-[#9CA3AF] shrink-0 transition-colors cursor-pointer shadow-2xs"
            >
              {preset.title}
            </button>
          ))}
        </div>

        {/* Studio Workspace Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Script Editor & Controls */}
          <div className="lg:col-span-7 space-y-5">
            {/* Mode Selector Geometric Tabs */}
            <div className="bg-[#E5E7EB] p-1 rounded-lg flex items-center space-x-1 max-w-xs">
              <button
                type="button"
                id="mode-single-speaker-btn"
                onClick={() => {
                  setMode('single');
                  setError(null);
                }}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  mode === 'single'
                    ? 'bg-white text-[#111827] shadow-xs'
                    : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-[#111827]" />
                <span>Single Voice</span>
              </button>

              <button
                type="button"
                id="mode-multi-speaker-btn"
                onClick={() => {
                  setMode('multi');
                  setError(null);
                }}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  mode === 'multi'
                    ? 'bg-white text-[#111827] shadow-xs'
                    : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-[#111827]" />
                <span>Dialogue (2 Voices)</span>
              </button>
            </div>

            {/* Editor Area */}
            {mode === 'single' ? (
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm space-y-3">
                {/* Editor Header */}
                <div className="flex items-center justify-between text-xs text-[#6B7280]">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-[#6B7280] flex items-center space-x-1.5">
                    <span>Input Text Prompt</span>
                  </span>
                  <div className="flex items-center space-x-3 font-mono text-[11px]">
                    <span className="flex items-center space-x-1 text-[#6B7280]">
                      <Clock className="w-3 h-3" />
                      <span>~{estimatedSeconds}s audio</span>
                    </span>
                    <span className="text-[#374151] font-semibold">{text.length} chars</span>
                    {text.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setText('')}
                        className="text-[#9CA3AF] hover:text-rose-600 transition-colors cursor-pointer"
                        title="Clear text"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Textarea */}
                <textarea
                  id="tts-text-input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={isGenerating}
                  rows={6}
                  placeholder="Enter or paste the text you would like to convert to speech..."
                  className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#111827] text-sm leading-relaxed resize-y font-sans"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                <MultiSpeakerEditor
                  speakers={speakers}
                  onChangeSpeakers={setSpeakers}
                  scriptText={text}
                  onChangeScriptText={setText}
                  disabled={isGenerating}
                />
              </div>
            )}

            {/* Error Message Notice */}
            {error && (
              <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">{error}</p>
                  <p className="text-[11px] text-rose-700 mt-0.5 font-mono">
                    Local speech preview is available as offline fallback.
                  </p>
                </div>
              </div>
            )}

            {/* Action Bar (Generate button + Browser preview) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  id="browser-tts-preview-btn"
                  onClick={handleBrowserSpeech}
                  disabled={isGenerating || !text.trim()}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-lg text-xs font-bold text-[#111827] bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#D1D5DB] transition-colors disabled:opacity-50 cursor-pointer"
                  title="Test instant local browser speech without API call"
                >
                  <Play className={`w-3.5 h-3.5 ${browserSpeaking ? 'text-[#111827] fill-current' : ''}`} />
                  <span>{browserSpeaking ? 'Stop Preview' : 'Local Preview'}</span>
                </button>
              </div>

              <button
                type="button"
                id="generate-speech-primary-btn"
                onClick={handleGenerate}
                disabled={isGenerating || !text.trim()}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[#111827] hover:bg-black active:scale-[0.98] shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <div className="flex items-center space-x-1 mr-1">
                      <span className="w-1.5 h-3 bg-white animate-pulse rounded-xs" />
                      <span className="w-1.5 h-4 bg-white animate-pulse delay-75 rounded-xs" />
                      <span className="w-1.5 h-2 bg-white animate-pulse delay-150 rounded-xs" />
                    </div>
                    <span>Synthesizing Output...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Synthesize Audio</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Voice Selection & Style Tuning */}
          <div className="lg:col-span-5 space-y-5">
            {mode === 'single' && (
              <>
                {/* Voice Selection */}
                <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                  <VoiceSelector
                    selectedVoice={selectedVoice}
                    onSelectVoice={setSelectedVoice}
                    disabled={isGenerating}
                  />
                </div>

                {/* Style / Delivery Tuning */}
                <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                  <StyleSelector
                    selectedStyle={selectedStyle}
                    onSelectStyle={setSelectedStyle}
                    disabled={isGenerating}
                  />
                </div>
              </>
            )}

            {mode === 'multi' && (
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-sm bg-[#111827] text-white">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#111827]">
                      Multi-Speaker Dialogue Engine
                    </h3>
                    <p className="text-xs text-[#6B7280]">
                      Turn-taking speech synthesis with synchronized pacing.
                    </p>
                  </div>
                </div>

                <div className="text-xs text-[#374151] space-y-2 leading-relaxed bg-[#F9FAFB] p-3.5 rounded-lg border border-[#E5E7EB]">
                  <p className="font-bold text-[#111827] uppercase tracking-wider text-[10px]">
                    Dialogue Configuration:
                  </p>
                  <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-[#6B7280]">
                    <li>{speakers[0]?.speaker || 'Speaker 1'}: {speakers[0]?.voice} voice</li>
                    <li>{speakers[1]?.speaker || 'Speaker 2'}: {speakers[1]?.voice} voice</li>
                    <li>Synchronized turn-taking neural delivery</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Audio Player Result Section */}
        {currentAudio && (
          <section className="pt-2">
            <AudioPlayer
              audioUrl={currentAudio.audioUrl}
              voiceName={currentAudio.voiceName}
              styleName={currentAudio.styleName}
              textSnippet={currentAudio.textSnippet}
              charCount={currentAudio.charCount}
            />
          </section>
        )}
      </main>

      {/* History Slide-over Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistoryItem={(item) => {
          setText(item.text);
          setSelectedVoice((item.voice in VOICES ? item.voice : 'Kore') as VoiceName);
          setSelectedStyle((item.style as SpeechStyle) || 'natural');
          setMode(item.mode);
          if (item.speakers) setSpeakers(item.speakers);
          setCurrentAudio({
            audioUrl: item.audioUrl,
            voiceName: item.voice,
            styleName: item.style,
            textSnippet: item.text,
            charCount: item.charCount,
          });
          setIsHistoryOpen(false);
        }}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}

