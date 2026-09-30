'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, AlertCircle, RefreshCw, Volume2, ArrowRight, Sparkles } from 'lucide-react';
import { cleanVoiceTranscript } from '@/lib/search';

interface VoiceSearchProps {
  onSearch: (transcript: string) => void;
  className?: string;
  buttonSize?: 'sm' | 'md' | 'lg';
  iconClassName?: string;
}

const POPULAR_VOICE_PROMPTS = [
  'Apple Watch Ultra 2',
  'Desi Ghee',
  'Smartphones & Mobiles',
  'Chilgoza & Badam',
  'Sidr Honey',
  'Peshawari Chappal',
];

export function VoiceSearchModal({ onSearch, className = '', buttonSize = 'md', iconClassName = '' }: VoiceSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en-US' | 'ur-PK'>('en-US');

  const SILENCE_TIMEOUT_MS = 8000; // 8 seconds of silence auto-cutoff (within 7-10s range)

  const recognitionRef = useRef<any>(null);
  const autoSubmitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isManuallyClosedRef = useRef(false);

  const transcriptRef = useRef('');
  const interimTranscriptRef = useRef('');

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    interimTranscriptRef.current = interimTranscript;
  }, [interimTranscript]);

  // Clear silence timer
  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  // Reset/start 8s silence auto-cutoff timer
  const resetSilenceTimer = () => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      const captured = transcriptRef.current || interimTranscriptRef.current;
      if (captured && captured.trim().length > 0) {
        // If words were captured before going silent for 8s, search them!
        executeSearch(captured);
      } else {
        // No words captured for 8 seconds -> Turn off mic automatically and return to original state
        stopRecognition();
        setErrorMessage('Microphone turned off (8s silence). Returning to normal search...');
        // Auto-close overlay after 1 second so page returns to original state!
        setTimeout(() => {
          handleCloseModal();
        }, 1000);
      }
    }, SILENCE_TIMEOUT_MS);
  };

  // Stop listening helper
  const stopRecognition = () => {
    isManuallyClosedRef.current = true;
    clearSilenceTimer();

    if (autoSubmitTimerRef.current) {
      clearTimeout(autoSubmitTimerRef.current);
      autoSubmitTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onaudiostart = null;
        recognitionRef.current.onsoundstart = null;
        recognitionRef.current.onspeechstart = null;
        recognitionRef.current.onspeechend = null;
        recognitionRef.current.onsoundend = null;
        recognitionRef.current.abort();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  // Handle Escape key to close modal back to original state
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      stopRecognition();
    };
  }, [isOpen]);

  const executeSearch = (rawText: string) => {
    const textToUse = rawText || transcriptRef.current || interimTranscriptRef.current;
    const finalQuery = cleanVoiceTranscript(textToUse);
    if (!finalQuery.trim()) {
      handleCloseModal();
      return;
    }

    stopRecognition();
    setIsOpen(false);
    setTranscript('');
    setInterimTranscript('');
    setErrorMessage(null);
    transcriptRef.current = '';
    interimTranscriptRef.current = '';
    onSearch(finalQuery);
  };

  // Start pure Web Speech Recognition
  const startListening = () => {
    stopRecognition();
    isManuallyClosedRef.current = false;
    setErrorMessage(null);
    setTranscript('');
    setInterimTranscript('');
    transcriptRef.current = '';
    interimTranscriptRef.current = '';

    if (typeof window === 'undefined') return;

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setErrorMessage('Web Speech Recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or a mobile browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false; // Finalizes automatically on speech pauses
      recognition.interimResults = true; // Real-time live transcript
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
        resetSilenceTimer(); // Start 8s silence countdown on mic start
      };

      // Reset silence timer whenever any audio/sound/speech activity is detected
      recognition.onaudiostart = () => {
        resetSilenceTimer();
      };

      recognition.onsoundstart = () => {
        resetSilenceTimer();
      };

      recognition.onspeechstart = () => {
        resetSilenceTimer();
      };

      // When user stops speaking (speech pause detected), execute search immediately!
      recognition.onspeechend = () => {
        clearSilenceTimer();
        const captured = transcriptRef.current || interimTranscriptRef.current;
        if (captured && captured.trim().length > 0) {
          executeSearch(captured);
        }
      };

      recognition.onsoundend = () => {
        clearSilenceTimer();
        const captured = transcriptRef.current || interimTranscriptRef.current;
        if (captured && captured.trim().length > 0) {
          executeSearch(captured);
        }
      };

      recognition.onresult = (event: any) => {
        resetSilenceTimer(); // Reset silence timer on every spoken result

        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            final += item[0].transcript;
          } else {
            interim += item[0].transcript;
          }
        }

        if (final) {
          const cleaned = cleanVoiceTranscript(final);
          setTranscript(cleaned);
          transcriptRef.current = cleaned;
          setInterimTranscript('');
          interimTranscriptRef.current = '';

          // Foran (Instantly) trigger search on speech finalization
          clearSilenceTimer();
          if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
          autoSubmitTimerRef.current = setTimeout(() => {
            executeSearch(cleaned);
          }, 150); // Fast 150ms instant execution
        } else if (interim) {
          setInterimTranscript(interim);
          interimTranscriptRef.current = interim;

          // If user pauses speaking for 450ms on interim speech, execute search immediately
          if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
          autoSubmitTimerRef.current = setTimeout(() => {
            const currentInterim = interimTranscriptRef.current || transcriptRef.current;
            if (currentInterim && currentInterim.trim().length > 1) {
              executeSearch(currentInterim);
            }
          }, 450);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        clearSilenceTimer();

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMessage('Microphone access is blocked. Please click the lock or camera/mic icon in your address bar to Allow.');
        } else if (event.error === 'no-speech') {
          if (!transcriptRef.current && !interimTranscriptRef.current) {
            setErrorMessage('Microphone timed out (no speech detected). Tap the mic to speak again.');
          }
        } else if (event.error === 'network') {
          setErrorMessage('Network error with speech recognition service. Please check your internet connection.');
        } else {
          setErrorMessage(`Speech recognition notice: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        clearSilenceTimer();
        setIsListening(false);
        const captured = transcriptRef.current || interimTranscriptRef.current;
        if (captured && captured.trim().length > 0) {
          executeSearch(captured);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      resetSilenceTimer();
    } catch (err: any) {
      console.error('Failed to start SpeechRecognition:', err);
      clearSilenceTimer();
      setErrorMessage('Microphone could not be started. Tap to try again.');
      setIsListening(false);
    }
  };

  const handleOpenModal = () => {
    setIsOpen(true);
    startListening();
  };

  const handleCloseModal = () => {
    stopRecognition();
    setIsOpen(false);
    setTranscript('');
    setInterimTranscript('');
    setErrorMessage(null);
  };

  const currentDisplayText = transcript || interimTranscript;

  return (
    <>
      {/* Soundbar animations */}
      <style>{`
        @keyframes soundWaveBar {
          0%, 100% { height: 6px; opacity: 0.4; }
          50% { height: 28px; opacity: 1; }
        }
        .yt-sound-1 { animation: soundWaveBar 0.7s ease-in-out infinite; }
        .yt-sound-2 { animation: soundWaveBar 0.5s ease-in-out infinite 0.15s; }
        .yt-sound-3 { animation: soundWaveBar 0.8s ease-in-out infinite 0.3s; }
        .yt-sound-4 { animation: soundWaveBar 0.6s ease-in-out infinite 0.1s; }
        .yt-sound-5 { animation: soundWaveBar 0.75s ease-in-out infinite 0.25s; }
      `}</style>

      {/* Trigger Microphone Icon */}
      <button
        type="button"
        onClick={handleOpenModal}
        aria-label="Search with voice"
        title="Search with voice / بول کر سرچ کریں"
        className={`relative flex items-center justify-center rounded-xl transition-all focus:outline-none group ${buttonSize === 'sm'
            ? 'p-1.5 hover:bg-amber-100/80 text-amber-900'
            : buttonSize === 'lg'
              ? 'p-2.5 bg-brand-600 hover:bg-brand-500 text-slate-950 font-bold'
              : 'p-2 hover:bg-amber-100 text-amber-900'
          } ${className}`}
      >
        <Mic className={`w-4 h-4 transition-transform group-hover:scale-110 ${iconClassName || 'text-brand-800'}`} />
        <span className="sr-only">Voice Search</span>
      </button>

      {/* YouTube / TikTok Style Clean Voice Overlay */}
      {isOpen && (
        <div
          onClick={handleCloseModal}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn cursor-pointer"
        >
          {/* Main Floating Voice Box */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-[#0F0F0F] text-white rounded-[32px] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.95)] p-7 sm:p-9 flex flex-col justify-between min-h-[400px] overflow-hidden cursor-default"
          >

            {/* Top Bar: Minimal Header & Language Toggle & Close */}
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase font-mono flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-red-500" />
                  Voice Search
                </span>

                {/* Quick Language Toggle */}
                <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10 text-[10px] font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('en-US');
                      stopRecognition();
                      setTimeout(() => startListening(), 100);
                    }}
                    className={`px-2 py-0.5 rounded-md transition ${language === 'en-US' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    English / Roman
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('ur-PK');
                      stopRecognition();
                      setTimeout(() => startListening(), 100);
                    }}
                    className={`px-2 py-0.5 rounded-md transition ${language === 'ur-PK' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    اردو
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center transition-all active:scale-90"
                aria-label="Close voice search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Middle: Big Spoken Text / Real-Time Transcribe Area */}
            <div className="my-auto py-5 text-left">
              {currentDisplayText ? (
                <div className="space-y-3">
                  <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white font-display tracking-tight leading-tight animate-fadeIn break-words">
                    &ldquo;{currentDisplayText}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-red-400 font-semibold flex items-center gap-1.5 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      Searching matching products...
                    </p>
                    <button
                      type="button"
                      onClick={() => executeSearch(currentDisplayText)}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 shadow-md active:scale-95"
                    >
                      Search Now <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : errorMessage ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5 text-rose-400">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-base sm:text-lg font-bold text-slate-100 font-display">
                      {errorMessage}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 pl-7">
                    Tap the red microphone button below or choose a suggestion below:
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white font-display tracking-tight flex items-center gap-2">
                    Listening
                    <span className="inline-flex gap-1 items-center pt-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce" />
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 font-medium">
                    Speak now: e.g. &ldquo;Apple Watch Ultra 2&rdquo;, &ldquo;Desi Ghee&rdquo;, &ldquo;Smartphones&rdquo;
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Mic will auto turn off after 8 seconds of silence</span>
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Hero: Large YouTube / TikTok Pulsing Mic Button & Dancing Soundwave Bars */}
            <div className="flex flex-col items-center justify-center pt-2 space-y-4">
              <div className="relative flex items-center justify-center">
                {/* Concentric Expanding Ripple Rings */}
                {isListening && (
                  <>
                    <div className="absolute w-36 h-36 rounded-full bg-red-500/15 animate-ping duration-1000 pointer-events-none" />
                    <div className="absolute w-28 h-28 rounded-full bg-red-500/25 animate-pulse duration-700 pointer-events-none" />
                  </>
                )}

                {/* Big YouTube / TikTok Style Mic Button (Tapping while listening executes search if text exists, or restarts) */}
                <button
                  type="button"
                  onClick={
                    isListening
                      ? currentDisplayText
                        ? () => executeSearch(currentDisplayText)
                        : stopRecognition
                      : startListening
                  }
                  className={`relative w-20 h-20 sm:w-22 sm:h-22 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-95 ${isListening
                      ? 'bg-red-600 hover:bg-red-500 text-white ring-8 ring-red-500/20 shadow-[0_0_45px_rgba(239,68,68,0.6)]'
                      : 'bg-white/10 hover:bg-white/20 text-white ring-4 ring-white/10'
                    }`}
                  aria-label={isListening ? 'Tap to finish & search' : 'Start speaking'}
                >
                  <Mic className="w-8 h-8 sm:w-9 sm:h-9 text-white" />
                </button>
              </div>

              {/* YouTube / TikTok Style Live Equalizer Frequency Waveform (5 dancing sound bars) */}
              {isListening ? (
                <div className="flex items-center gap-1.5 h-8">
                  <span className="w-1.5 bg-gradient-to-t from-red-600 to-amber-400 rounded-full yt-sound-1" />
                  <span className="w-1.5 bg-gradient-to-t from-red-600 to-amber-400 rounded-full yt-sound-2" />
                  <span className="w-1.5 bg-gradient-to-t from-red-600 to-amber-400 rounded-full yt-sound-3" />
                  <span className="w-1.5 bg-gradient-to-t from-red-600 to-amber-400 rounded-full yt-sound-4" />
                  <span className="w-1.5 bg-gradient-to-t from-red-600 to-amber-400 rounded-full yt-sound-5" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startListening}
                  className="text-xs text-slate-300 hover:text-white font-semibold flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 transition"
                >
                  <RefreshCw className="w-3 h-3" /> Tap mic to speak
                </button>
              )}

              {/* Quick Spoken Suggestion Chips (1-Click Fallback) */}
              <div className="w-full pt-2 border-t border-white/5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Or tap to search:
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {POPULAR_VOICE_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => executeSearch(prompt)}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white/5 hover:bg-red-600 text-slate-300 hover:text-white border border-white/10 transition active:scale-95"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
