import React, { useState, useRef, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { startNativeSpeechRecognition, stopNativeSpeechRecognition } from '../nativeSpeech';
import { ChatMessage, Subject, Language, LearningStyle, TextSize } from '../types';
import { LOCALES } from '../locales';
import { Mascot } from './Mascot';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Type,
  ArrowLeft,
  Sparkles,
  BookOpen,
  CheckCircle,
  HelpCircle,
  RotateCcw,
  CheckCheck,
} from 'lucide-react';

interface ChatScreenProps {
  messages: ChatMessage[];
  currentSubject: Subject;
  language: Language;
  learningStyle: LearningStyle;
  studentName: string;
  textSize: TextSize;
  onSendMessage: (text: string, action?: 'hint' | 'example' | 'another_way' | 'got_it') => void;
  onSubjectChange: (subject: Subject) => void;
  onTextSizeChange: (size: TextSize) => void;
  onBackToHome: () => void;
  onStartMiniCheck: (subject?: Subject, topic?: string) => void;
  isLoading: boolean;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  messages,
  currentSubject,
  language,
  learningStyle,
  studentName,
  textSize,
  onSendMessage,
  onSubjectChange,
  onTextSizeChange,
  onBackToHome,
  onStartMiniCheck,
  isLoading,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const t = LOCALES[language];

  // Auto-scroll when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle Form Submit
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  // Quick Action Click
  const handleQuickAction = (action: 'hint' | 'example' | 'another_way' | 'got_it') => {
    if (isLoading) return;
    const actionLabel =
      action === 'hint'
        ? t.chat.actionButtons.hint
        : action === 'example'
        ? t.chat.actionButtons.example
        : action === 'another_way'
        ? t.chat.actionButtons.anotherWay
        : t.chat.actionButtons.gotIt;

    onSendMessage(actionLabel, action);
  };

  // Web Speech API: Voice Input
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
        if (transcript) setInputText(transcript);
      } catch (error) {
        console.error('Native speech recognition failed:', error);
        alert(error instanceof Error ? error.message : 'Speech recognition could not start. Please type your message.');
      } finally {
        setIsListening(false);
      }
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
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
        setInputText(transcript);
      };

      recognition.onerror = (event: any) => {
        recognitionRef.current = null;
        setIsListening(false);
        if (event.error !== 'aborted') {
          alert(event.error === 'not-allowed' ? 'Microphone permission was denied.' : 'Speech recognition failed. Please type your message.');
        }
      };

      recognition.onend = () => {
        recognitionRef.current = null;
        setIsListening(false);
        inputRef.current?.focus();
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      recognitionRef.current = null;
      setIsListening(false);
    }
  };

  // Text to Speech playback
  const handleToggleSpeak = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown formatting for cleaner speech
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    const langCode =
      language === 'hi'
        ? 'hi-IN'
        : language === 'es'
        ? 'es-ES'
        : language === 'fr'
        ? 'fr-FR'
        : 'en-US';
    utterance.lang = langCode;
    utterance.rate = 0.95; // Slightly slower for student clarity

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Text size classes mapping
  const textSizeClasses = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-relaxed',
    xl: 'text-xl leading-relaxed',
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-7rem)] md:h-[calc(100dvh-4rem)] max-w-4xl mx-auto bg-slate-50/50">
      {/* Top Chat Sub-Header */}
      <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToHome}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            title="Back to home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Subject Dropdown Picker */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
              Subject:
            </span>
            <select
              value={currentSubject}
              onChange={(e) => onSubjectChange(e.target.value as Subject)}
              className="text-xs font-extrabold text-blue-700 bg-blue-50/80 hover:bg-blue-100 border border-blue-200 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="Maths">Maths 📐</option>
              <option value="Science">Science 🔬</option>
              <option value="English">English 📚</option>
              <option value="Social Studies">Social Studies 🌍</option>
            </select>
          </div>
        </div>

        {/* Learning Style + Text Size Accessibility Toolbar */}
        <div className="flex items-center gap-2">
          <div className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 hidden sm:flex items-center gap-1">
            <span>{t.styles[learningStyle].icon}</span>
            <span>{t.styles[learningStyle].title}</span>
          </div>

          {/* Text Size Accessibility Toggle */}
          <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
            {(['sm', 'base', 'lg', 'xl'] as TextSize[]).map((sz) => (
              <button
                key={sz}
                onClick={() => onTextSizeChange(sz)}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                  textSize === sz ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {sz === 'sm' ? 'A' : sz === 'base' ? 'A+' : sz === 'lg' ? 'A++' : 'A+++'}
              </button>
            ))}
          </div>

          {/* Quick Mini Check launcher */}
          <button
            onClick={() => onStartMiniCheck(currentSubject)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
            title="Take a quick 2-question Mini Check"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Mini Check</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-md mx-auto">
            <Mascot size="xl" mood="happy" className="animate-pulse" />
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-800">
                {t.home.greetingPrefix}, {studentName}!
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.chat.emptyChatPrompt}
              </p>
            </div>

            {/* Quick Starters */}
            <div className="pt-2 w-full space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Tap to ask right away:
              </span>
              <div className="grid grid-cols-1 gap-2">
                {t.home.quickPrompts
                  .filter((p) => p.subject === currentSubject)
                  .map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => onSendMessage(prompt.text)}
                      className="text-left text-xs sm:text-sm font-semibold p-3 bg-white hover:bg-blue-50/60 rounded-2xl border border-slate-200 hover:border-blue-300 text-slate-700 transition-all shadow-xs flex items-center justify-between"
                    >
                      <span>"{prompt.text}"</span>
                      <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0 ml-2" />
                    </button>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            const isLastBuddyMessage =
              !isUser &&
              (index === messages.length - 1 ||
                (index === messages.length - 2 && messages[messages.length - 1].sender === 'user'));

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <Mascot
                    size="md"
                    mood={speakingMessageId === msg.id ? 'speaking' : 'happy'}
                    className="shrink-0 mt-1"
                  />
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] flex flex-col ${
                    isUser ? 'items-end' : 'items-start'
                  }`}
                >
                  {/* Message Bubble */}
                  <div
                    className={`rounded-3xl p-4 sm:p-5 shadow-sm transition-all ${textSizeClasses[textSize]} ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-xs'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    {/* Formatted Text */}
                    <div className="whitespace-pre-line font-medium">
                      {msg.text}
                    </div>

                    {/* Footer on buddy message: Text to speech button */}
                    {!isUser && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-3 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="font-semibold text-slate-500">
                            Study Buddy ({t.styles[learningStyle].title})
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleSpeak(msg.id, msg.text)}
                          title={t.chat.ttsTooltip}
                          className="flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          {speakingMessageId === msg.id ? (
                            <>
                              <VolumeX className="w-4 h-4 text-red-500" />
                              <span className="text-[11px] text-red-500 font-bold">Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-4 h-4" />
                              <span className="text-[11px] font-medium hidden sm:inline">Listen</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* QUICK BUTTONS under each Study Buddy reply */}
                  {!isUser && (
                    <div className="mt-2.5 w-full space-y-2">
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuickAction('hint')}
                          disabled={isLoading}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 active:bg-amber-200 border border-amber-200 text-amber-800 text-xs font-bold transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
                        >
                          {t.chat.actionButtons.hint}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAction('example')}
                          disabled={isLoading}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 active:bg-blue-200 border border-blue-200 text-blue-800 text-xs font-bold transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
                        >
                          {t.chat.actionButtons.example}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAction('another_way')}
                          disabled={isLoading}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 active:bg-purple-200 border border-purple-200 text-purple-800 text-xs font-bold transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
                        >
                          {t.chat.actionButtons.anotherWay}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAction('got_it')}
                          disabled={isLoading}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-300 text-emerald-800 text-xs font-extrabold transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
                        >
                          {t.chat.actionButtons.gotIt}
                        </button>
                      </div>

                      {/* If the student clicked "I got it!", offer the Mini Check card right away! */}
                      {msg.actionTriggered === 'got_it' && (
                        <div className="p-3.5 rounded-2xl bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-300 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-300">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
                            <span className="text-xs sm:text-sm font-bold text-emerald-900">
                              {t.chat.takeMiniCheckPrompt}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onStartMiniCheck(currentSubject)}
                            className="shrink-0 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-transform active:scale-95 cursor-pointer"
                          >
                            {t.chat.startMiniCheckBtn}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Loading / Thinking State */}
        {isLoading && (
          <div className="flex gap-3 items-center">
            <Mascot size="md" mood="thinking" className="animate-spin duration-3000" />
            <div className="bg-white border border-slate-200 rounded-3xl px-4 py-3 shadow-xs flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              <span>{t.chat.buddyThinking}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Sticky Input Bar */}
      <div className="px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-4 sm:pt-4 sm:pb-[calc(1rem+env(safe-area-inset-bottom))] bg-white border-t border-slate-200 shrink-0">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={handleToggleVoice}
            title={t.chat.micTooltip}
            aria-label={t.chat.micTooltip}
            className={`p-3 rounded-2xl transition-all cursor-pointer ${
              isListening
                ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-200'
                : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50 bg-slate-100'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? t.chat.micListening : t.chat.inputPlaceholder}
              className={`w-full pl-4 pr-10 py-3 bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-transparent focus:border-blue-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium transition-all ${textSizeClasses[textSize]}`}
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            title={t.chat.sendTooltip}
            className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        {/* Helpful coaching reminder banner */}
        <div className="mt-2 text-center text-[11px] text-slate-400 font-medium">
          Study Buddy uses Socratic coaching: answers give a hint and a question back to help you think!
        </div>
      </div>
    </div>
  );
};
