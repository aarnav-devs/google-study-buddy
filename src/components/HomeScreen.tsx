import React, { useState, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { startNativeSpeechRecognition, stopNativeSpeechRecognition } from '../nativeSpeech';
import { Subject, Language, LearningStyle } from '../types';
import { LOCALES } from '../locales';
import { Mascot } from './Mascot';
import {
  Calculator,
  FlaskConical,
  BookA,
  Compass,
  ArrowRight,
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

interface HomeScreenProps {
  studentName: string;
  language: Language;
  learningStyle: LearningStyle;
  onAskQuestion: (question: string, subject?: Subject) => void;
  onSelectSubject: (subject: Subject) => void;
  onStartMiniCheck: (subject?: Subject, topic?: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  studentName,
  language,
  learningStyle,
  onAskQuestion,
  onSelectSubject,
  onStartMiniCheck,
}) => {
  const [askInput, setAskInput] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<Subject | 'All'>('All');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const t = LOCALES[language];

  // Subject icons and theme colors
  const subjectConfig: Record<
    Subject,
    {
      icon: React.ReactNode;
      colorClass: string;
      accentBorder: string;
      badgeBg: string;
      topics: string[];
    }
  > = {
    Maths: {
      icon: <Calculator className="w-7 h-7 text-blue-600" />,
      colorClass: 'bg-blue-50/80 hover:bg-blue-50 text-blue-900 border-blue-200/90',
      accentBorder: 'hover:border-blue-400 group-hover:border-blue-400',
      badgeBg: 'bg-blue-100/80 text-blue-800',
      topics: ['Fractions & Pizza', 'Geometry & Shapes', 'Algebra Basics', 'Multiplication Tricks'],
    },
    Science: {
      icon: <FlaskConical className="w-7 h-7 text-emerald-600" />,
      colorClass: 'bg-emerald-50/80 hover:bg-emerald-50 text-emerald-900 border-emerald-200/90',
      accentBorder: 'hover:border-emerald-400 group-hover:border-emerald-400',
      badgeBg: 'bg-emerald-100/80 text-emerald-800',
      topics: ['Photosynthesis', 'Solar System', 'Gravity & Motion', 'Human Body Organs'],
    },
    English: {
      icon: <BookA className="w-7 h-7 text-amber-600" />,
      colorClass: 'bg-amber-50/80 hover:bg-amber-50 text-amber-900 border-amber-200/90',
      accentBorder: 'hover:border-amber-400 group-hover:border-amber-400',
      badgeBg: 'bg-amber-100/80 text-amber-800',
      topics: ['Similes vs Metaphors', 'Past & Present Tense', 'Story Writing Sparks', 'Reading Clues'],
    },
    'Social Studies': {
      icon: <Compass className="w-7 h-7 text-rose-600" />,
      colorClass: 'bg-rose-50/80 hover:bg-rose-50 text-rose-900 border-rose-200/90',
      accentBorder: 'hover:border-rose-400 group-hover:border-rose-400',
      badgeBg: 'bg-rose-100/80 text-rose-800',
      topics: ['River Valley Civilizations', 'Reading World Maps', 'Community & Democracy', 'Ancient Inventions'],
    },
  };

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!askInput.trim()) return;
    const subj = selectedSubjectFilter === 'All' ? undefined : selectedSubjectFilter;
    onAskQuestion(askInput.trim(), subj);
  };

  // Mic voice input via Web Speech API
  const handleToggleVoice = async () => {
    const langCode =
      language === 'hi' ? 'hi-IN' : language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : 'en-US';

    if (Capacitor.isNativePlatform()) {
      if (isListening) {
        try {
          await stopNativeSpeechRecognition();
        } catch (error) {
          console.error('Failed to stop speech recognition:', error);
        } finally {
          setIsListening(false);
        }
        return;
      }

      setIsListening(true);
      try {
        const transcript = await startNativeSpeechRecognition(langCode);
        if (transcript) setAskInput(transcript);
      } catch (error) {
        console.error('Native speech recognition failed:', error);
        alert(error instanceof Error ? error.message : 'Speech recognition could not start. Please type your question.');
      } finally {
        setIsListening(false);
      }
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        language === 'hi'
          ? 'आपके ब्राउज़र में आवाज़ पहचान (Speech Recognition) समर्थित नहीं है।'
          : 'Speech recognition is not supported in this browser. Please type your question.'
      );
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = langCode;
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setAskInput(transcript);
      };

      recognition.onerror = (event: any) => {
        recognitionRef.current = null;
        setIsListening(false);
        if (event.error !== 'aborted') {
          alert(event.error === 'not-allowed' ? 'Microphone permission was denied.' : 'Speech recognition failed. Please type your question.');
        }
      };

      recognition.onend = () => {
        recognitionRef.current = null;
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech error:', err);
      recognitionRef.current = null;
      setIsListening(false);
    }
  };

  return (
    <div className="pb-28 max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-8">
      {/* 1. Greeting with the student's name */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 sm:p-8 shadow-xl shadow-blue-500/10">
        {/* Decorative background shapes */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white/90">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>
                {t.chat.learningStyleTag}: {t.styles[learningStyle].title} ({t.styles[learningStyle].icon})
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {t.home.greetingPrefix}, <span className="text-yellow-300">{studentName}</span>! 👋
            </h2>

            <p className="text-blue-100 text-sm sm:text-base max-w-xl font-medium">
              {t.home.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Mascot size="lg" mood="happy" className="shrink-0 bg-white/15 p-2 rounded-2xl backdrop-blur-md" />
          </div>
        </div>
      </div>

      {/* 2. Subject Tiles: Maths, Science, English, Social Studies */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <span>{t.home.subjectSectionTitle}</span>
          </h3>
          <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
            Pick a subject to explore hints & concepts
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['Maths', 'Science', 'English', 'Social Studies'] as Subject[]).map((subjKey) => {
            const config = subjectConfig[subjKey];
            const info = t.home.subjects[subjKey];

            return (
              <div
                key={subjKey}
                onClick={() => onSelectSubject(subjKey)}
                className={`group cursor-pointer rounded-3xl p-5 border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${config.colorClass} ${config.accentBorder} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white rounded-2xl shadow-xs border border-slate-100 group-hover:scale-110 transition-transform">
                      {config.icon}
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/80 border border-slate-200/60 text-slate-600">
                      Explore
                    </span>
                  </div>

                  <h4 className="font-extrabold text-lg tracking-tight mb-1 text-slate-900 group-hover:text-blue-600 transition-colors">
                    {info.name}
                  </h4>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                    {info.desc}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-200/60">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Popular topics:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {config.topics.slice(0, 2).map((topic, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAskQuestion(`Can you explain ${topic} to me?`, subjKey);
                        }}
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border border-slate-200/80 bg-white/90 hover:bg-white text-slate-700 transition-colors truncate max-w-[170px] text-left`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-2 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                  <span>Start session</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mini Check Launchpad Banner */}
      <div className="rounded-3xl border border-emerald-200 bg-linear-to-r from-emerald-50 via-teal-50 to-white p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-md shadow-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-base sm:text-lg">
              {t.home.miniCheckBannerTitle}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md">
              {t.home.miniCheckBannerDesc}
            </p>
          </div>
        </div>

        <button
          onClick={() => onStartMiniCheck()}
          className="shrink-0 w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{t.home.miniCheckBannerBtn}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Prompts Starters */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {t.home.quickPromptsTitle}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {t.home.quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onAskQuestion(prompt.text, prompt.subject)}
              className="text-left p-3.5 rounded-2xl bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 transition-all flex items-start justify-between gap-3 shadow-xs group cursor-pointer"
            >
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  {prompt.subject}
                </span>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                  "{prompt.text}"
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0 mt-2" />
            </button>
          ))}
        </div>
      </div>

      {/* 3. A big "Ask me anything" bar at the bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-linear-to-t from-white via-white/95 to-transparent backdrop-blur-md">
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={handleAskSubmit}
            className="relative flex items-center bg-white rounded-3xl shadow-2xl border-2 border-blue-500/30 hover:border-blue-500 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all p-1.5 sm:p-2"
          >
            {/* Subject Selector Pill */}
            <div className="hidden sm:flex items-center pl-2 pr-1">
              <select
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value as any)}
                className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl px-2.5 py-2 border-0 focus:outline-none cursor-pointer"
              >
                <option value="All">All Subjects</option>
                <option value="Maths">Maths 📐</option>
                <option value="Science">Science 🔬</option>
                <option value="English">English 📚</option>
                <option value="Social Studies">Social Studies 🌍</option>
              </select>
            </div>

            {/* Main Text Input */}
            <input
              type="text"
              value={askInput}
              onChange={(e) => setAskInput(e.target.value)}
              placeholder={isListening ? t.chat.micListening : t.home.askBarPlaceholder}
              className="flex-1 px-3 sm:px-4 py-3 text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent font-medium"
            />

            {/* Mic button for voice input */}
            <button
              type="button"
              onClick={handleToggleVoice}
              title={t.chat.micTooltip}
              aria-label={t.chat.micTooltip}
              className={`p-3 rounded-2xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-200'
                  : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Submit Arrow Button */}
            <button
              type="submit"
              disabled={!askInput.trim()}
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer ml-1"
            >
              <span className="hidden sm:inline">{t.home.askButton}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
