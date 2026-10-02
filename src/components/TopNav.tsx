import React, { useEffect, useState } from 'react';
import { Mascot } from './Mascot';
import { Language, LearningStyle, TextSize } from '../types';
import { LOCALES } from '../locales';
import { Globe, Type, Sparkles, BookOpen, CheckCircle2, ChevronDown, Check } from 'lucide-react';

interface TopNavProps {
  menuBackHandlerRef: React.MutableRefObject<(() => boolean) | null>;
  currentScreen: 'home' | 'chat' | 'mini-check';
  onNavigate: (screen: 'home' | 'chat' | 'mini-check') => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  learningStyle: LearningStyle;
  onLearningStyleChange: (style: LearningStyle) => void;
  studentName: string;
  textSize: TextSize;
  onTextSizeChange: (size: TextSize) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  menuBackHandlerRef,
  currentScreen,
  onNavigate,
  language,
  onLanguageChange,
  learningStyle,
  onLearningStyleChange,
  studentName,
  textSize,
  onTextSizeChange,
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [styleMenuOpen, setStyleMenuOpen] = useState(false);
  const [textSizeMenuOpen, setTextSizeMenuOpen] = useState(false);

  const t = LOCALES[language];

  useEffect(() => {
    menuBackHandlerRef.current = () => {
      if (!langMenuOpen && !styleMenuOpen && !textSizeMenuOpen) return false;
      setLangMenuOpen(false);
      setStyleMenuOpen(false);
      setTextSizeMenuOpen(false);
      return true;
    };

    return () => {
      menuBackHandlerRef.current = null;
    };
  }, [langMenuOpen, menuBackHandlerRef, styleMenuOpen, textSizeMenuOpen]);

  const textSizes: { id: TextSize; label: string; desc: string }[] = [
    { id: 'sm', label: 'A', desc: 'Standard' },
    { id: 'base', label: 'A+', desc: 'Comfortable' },
    { id: 'lg', label: 'A++', desc: 'Large' },
    { id: 'xl', label: 'A+++', desc: 'Extra Large' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <Mascot size="sm" mood={currentScreen === 'chat' ? 'speaking' : 'happy'} />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-800 group-hover:text-blue-600 transition-colors">
                <span className="text-blue-600">G</span>
                <span className="text-red-500">o</span>
                <span className="text-yellow-500">o</span>
                <span className="text-blue-600">g</span>
                <span className="text-green-600">l</span>
                <span className="text-red-500">e</span>{' '}
                <span className="text-slate-800">Study Buddy</span>
              </span>
            </div>
            {studentName && (
              <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">
                {t.home.greetingPrefix}, <strong className="text-slate-700">{studentName}</strong>!
              </span>
            )}
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="hidden md:flex items-center p-1 bg-slate-100 rounded-full border border-slate-200 text-sm font-semibold">
          <button
            onClick={() => onNavigate('home')}
            className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              currentScreen === 'home'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span>Home</span>
          </button>
          <button
            onClick={() => onNavigate('chat')}
            className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              currentScreen === 'chat'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span>Chat</span>
          </button>
          <button
            onClick={() => onNavigate('mini-check')}
            className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              currentScreen === 'mini-check'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Mini Check</span>
          </button>
        </nav>

        {/* Right Tools: Style badge + Text Size + Language Switcher */}
        <div className="flex items-center gap-2">
          {/* Active Learning Style Quick Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setStyleMenuOpen(!styleMenuOpen);
                setLangMenuOpen(false);
                setTextSizeMenuOpen(false);
              }}
              title="Current learning style"
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1.5"
            >
              <span>{t.styles[learningStyle].icon}</span>
              <span className="hidden lg:inline">{t.styles[learningStyle].title}</span>
              <ChevronDown className="w-3.5 h-3.5 text-amber-700 opacity-70" />
            </button>

            {styleMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Learning Style
                </div>
                {(['visual', 'story', 'step_by_step'] as LearningStyle[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      onLearningStyleChange(st);
                      setStyleMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      learningStyle === st ? 'bg-amber-50 font-semibold text-amber-900' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{t.styles[st].icon}</span>
                      <div>
                        <div className="font-bold">{t.styles[st].title}</div>
                        <div className="text-[11px] text-slate-500">{t.styles[st].subtitle}</div>
                      </div>
                    </div>
                    {learningStyle === st && <Check className="w-4 h-4 text-amber-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Text Size Accessibility Toggle */}
          <div className="relative">
            <button
              onClick={() => {
                setTextSizeMenuOpen(!textSizeMenuOpen);
                setLangMenuOpen(false);
                setStyleMenuOpen(false);
              }}
              title={t.chat.textSizeTooltip}
              aria-label={t.chat.textSizeTooltip}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1"
            >
              <Type className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-bold uppercase">{textSize}</span>
            </button>

            {textSizeMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Text Accessibility
                </div>
                {textSizes.map((sz) => (
                  <button
                    key={sz.id}
                    onClick={() => {
                      onTextSizeChange(sz.id);
                      setTextSizeMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      textSize === sz.id ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-extrabold mr-2">{sz.label}</span>
                      <span className="text-slate-500 font-normal">{sz.desc}</span>
                    </div>
                    {textSize === sz.id && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language Switch in top corner */}
          <div className="relative">
            <button
              onClick={() => {
                setLangMenuOpen(!langMenuOpen);
                setStyleMenuOpen(false);
                setTextSizeMenuOpen(false);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.languages[language]}</span>
              <ChevronDown className="w-3 h-3 text-blue-600 opacity-70" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Select Language
                </div>
                {(['en', 'hi', 'es', 'fr'] as Language[]).map((code) => (
                  <button
                    key={code}
                    onClick={() => {
                      onLanguageChange(code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      language === code ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <span>{t.languages[code]}</span>
                    {language === code && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 py-1.5 bg-slate-50 text-xs font-medium">
        <button
          onClick={() => onNavigate('home')}
          className={`px-3 py-1 rounded-lg flex items-center gap-1 ${
            currentScreen === 'home' ? 'text-blue-700 font-bold bg-white shadow-xs' : 'text-slate-600'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-500" />
          <span>Home</span>
        </button>
        <button
          onClick={() => onNavigate('chat')}
          className={`px-3 py-1 rounded-lg flex items-center gap-1 ${
            currentScreen === 'chat' ? 'text-blue-700 font-bold bg-white shadow-xs' : 'text-slate-600'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
          <span>Chat</span>
        </button>
        <button
          onClick={() => onNavigate('mini-check')}
          className={`px-3 py-1 rounded-lg flex items-center gap-1 ${
            currentScreen === 'mini-check' ? 'text-blue-700 font-bold bg-white shadow-xs' : 'text-slate-600'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Mini Check</span>
        </button>
      </div>
    </header>
  );
};
