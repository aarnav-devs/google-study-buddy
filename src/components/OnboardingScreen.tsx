import React, { useState } from 'react';
import { Mascot } from './Mascot';
import { Language, LearningStyle } from '../types';
import { LOCALES } from '../locales';
import { Sparkles, ArrowRight, User } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: (data: { name: string; language: Language; learningStyle: LearningStyle }) => void;
  initialLanguage?: Language;
  initialLearningStyle?: LearningStyle;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
  initialLanguage = 'en',
  initialLearningStyle = 'visual',
}) => {
  const [name, setName] = useState('');
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [learningStyle, setLearningStyle] = useState<LearningStyle>(initialLearningStyle);
  const [error, setError] = useState('');

  const t = LOCALES[language];

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError(
        language === 'hi'
          ? 'कृपया अपना नाम दर्ज करें ताकि हम आपसे बात कर सकें!'
          : language === 'es'
          ? '¡Por favor ingresa tu nombre para saludarte!'
          : language === 'fr'
          ? 'Entre ton prénom pour commencer !'
          : 'Please enter your name so Study Buddy can greet you!'
      );
      return;
    }
    setError('');
    onComplete({ name: cleanName, language, learningStyle });
  };

  const styleOptions: { id: LearningStyle; icon: string; title: string; desc: string; badge: string; border: string; bg: string }[] = [
    {
      id: 'visual',
      icon: '🎨',
      title: t.styles.visual.title,
      desc: t.onboarding.styleDescriptions.visual,
      badge: 'Visual & Shapes',
      border: 'border-blue-400 ring-2 ring-blue-500/20 bg-blue-50/70',
      bg: 'hover:border-blue-300 hover:bg-blue-50/40',
    },
    {
      id: 'story',
      icon: '📖',
      title: t.styles.story.title,
      desc: t.onboarding.styleDescriptions.story,
      badge: 'Real-world Analogies',
      border: 'border-amber-400 ring-2 ring-amber-500/20 bg-amber-50/70',
      bg: 'hover:border-amber-300 hover:bg-amber-50/40',
    },
    {
      id: 'step_by_step',
      icon: '🔢',
      title: t.styles.step_by_step.title,
      desc: t.onboarding.styleDescriptions.step_by_step,
      badge: 'Structured Checkpoints',
      border: 'border-emerald-400 ring-2 ring-emerald-500/20 bg-emerald-50/70',
      bg: 'hover:border-emerald-300 hover:bg-emerald-50/40',
    },
  ];

  const languagesList: { id: Language; label: string; flag: string; native: string }[] = [
    { id: 'en', label: 'English', flag: '🇬🇧', native: 'English' },
    { id: 'hi', label: 'हिन्दी', flag: '🇮🇳', native: 'Hindi' },
    { id: 'es', label: 'Español', flag: '🇪🇸', native: 'Spanish' },
    { id: 'fr', label: 'Français', flag: '🇫🇷', native: 'French' },
  ];

  return (
    <div className="min-h-dvh bg-linear-to-b from-blue-50/60 via-slate-50 to-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-10 transition-all">
        {/* Header with Mascot, Google colors & greeting */}
        <div className="text-center space-y-3 mb-8">
          <div className="flex justify-center">
            <Mascot size="lg" mood="happy" className="animate-bounce hover:animate-none duration-1000" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            <span>Google Study Buddy</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
            {t.onboarding.greeting}
          </h1>

          <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto">
            {t.onboarding.tagline}
          </p>
        </div>

        <form onSubmit={handleStart} className="space-y-6">
          {/* Step 1: Student Name */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.onboarding.nameLabel}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder={t.onboarding.namePlaceholder}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all text-base"
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-red-500 font-semibold pl-1">{error}</p>}
          </div>

          {/* Step 2: Pick a Language */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.onboarding.languageLabel}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {languagesList.map((lang) => {
                const isSelected = language === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setLanguage(lang.id)}
                    className={`py-3 px-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/80 text-blue-700 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className="font-bold text-sm tracking-tight">{lang.label}</span>
                    <span className="text-[11px] text-slate-400 font-medium">{lang.native}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Pick a Learning Style */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                {t.onboarding.styleLabel}
              </label>
              <span className="text-[11px] text-slate-400 font-medium">You can switch anytime</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {styleOptions.map((st) => {
                const isSelected = learningStyle === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setLearningStyle(st.id)}
                    className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected ? st.border : `border-slate-200 bg-white ${st.bg}`
                    }`}
                  >
                    <div>
                      <div className="text-2xl mb-2">{st.icon}</div>
                      <h4 className="font-extrabold text-slate-800 text-sm mb-1">{st.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                      <span>{st.badge}</span>
                      {isSelected ? (
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      ) : (
                        <span className="w-2 h-2 rounded-full border border-slate-300"></span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4: Let's Start Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-base shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{t.onboarding.startButton}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>

        {/* Friendly footer hint */}
        <p className="text-center text-xs text-slate-400 mt-6 font-medium">
          Built to help you understand deeply with hints, not just final answers.
        </p>
      </div>
    </div>
  );
};
