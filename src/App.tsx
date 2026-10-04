/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { apiUrl } from './api';
import { UserProfile, Language, LearningStyle, Subject, TextSize, ChatMessage } from './types';
import { OnboardingScreen } from './components/OnboardingScreen';
import { TopNav } from './components/TopNav';
import { HomeScreen } from './components/HomeScreen';
import { ChatScreen } from './components/ChatScreen';
import { MiniCheckScreen } from './components/MiniCheckScreen';

const STORAGE_KEY = 'google_study_buddy_profile_v1';
const CHAT_HISTORY_KEY = 'google_study_buddy_chat_v1';

export default function App() {
  // User Profile State
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse local profile:', e);
    }
    return {
      name: '',
      language: 'en',
      learningStyle: 'visual',
      onboarded: false,
      textSize: 'base',
    };
  });

  // Current Screen
  const [currentScreen, setCurrentScreen] = useState<'home' | 'chat' | 'mini-check'>('home');
  const [currentSubject, setCurrentSubject] = useState<Subject>('Maths');
  const [currentTopic, setCurrentTopic] = useState<string>('Fractions & Ratios');
  const menuBackHandlerRef = useRef<(() => boolean) | null>(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let removeListener: (() => Promise<void>) | undefined;
    let disposed = false;
    void CapacitorApp.addListener('backButton', () => {
      if (menuBackHandlerRef.current?.()) return;
      if (currentScreen === 'mini-check') {
        setCurrentScreen('chat');
      } else if (currentScreen === 'chat') {
        setCurrentScreen('home');
      } else {
        void CapacitorApp.exitApp();
      }
    }).then((listener) => {
      if (disposed) void listener.remove();
      else removeListener = () => listener.remove();
    });

    return () => {
      disposed = true;
      void removeListener?.();
    };
  }, [currentScreen]);

  // Chat messages
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_HISTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load chat history:', e);
    }
    return [];
  });

  const [isAiLoading, setIsAiLoading] = useState(false);

  // Sync profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save profile:', e);
    }
  }, [profile]);

  // Sync chat to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save chat:', e);
    }
  }, [messages]);

  // Handle Onboarding Completion
  const handleOnboardingComplete = (data: {
    name: string;
    language: Language;
    learningStyle: LearningStyle;
  }) => {
    const updatedProfile: UserProfile = {
      ...profile,
      name: data.name,
      language: data.language,
      learningStyle: data.learningStyle,
      onboarded: true,
    };
    setProfile(updatedProfile);
    setCurrentScreen('home');

    // Add initial welcoming message from Study Buddy
    const initialGreeting =
      data.language === 'hi'
        ? `नमस्ते ${data.name}! मैं आपका स्टडी बडी हूँ। गणित, विज्ञान, अंग्रेज़ी या सामाजिक अध्ययन में से जो भी पढ़ना चाहते हैं, पूछिए! हम एक साथ कदम-दर-कदम सीखेंगे!`
        : data.language === 'es'
        ? `¡Hola ${data.name}! Soy tu Study Buddy. Pregúntame sobre Matemáticas, Ciencias, Inglés o Estudios Sociales. ¡Aprenderemos paso a paso juntos!`
        : data.language === 'fr'
        ? `Bonjour ${data.name} ! Je suis ton Study Buddy. Pose-moi n'importe quelle question en Maths, Sciences, Anglais ou Histoire-Géo !`
        : `Hi ${data.name}! I'm Study Buddy. Ask me anything in Maths, Science, English, or Social Studies. We'll work through the clues step-by-step together!`;

    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'buddy',
        text: initialGreeting,
        timestamp: Date.now(),
        subject: 'Maths',
        learningStyle: data.learningStyle,
      },
    ]);
  };

  // Send message to backend Gemini route
  const handleSendMessage = async (
    text: string,
    action?: 'hint' | 'example' | 'another_way' | 'got_it'
  ) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
      subject: currentSubject,
      actionTriggered: action,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsAiLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch(apiUrl('/api/study/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          action,
          subject: currentSubject,
          learningStyle: profile.learningStyle,
          language: profile.language,
          studentName: profile.name,
          history,
        }),
      });

      if (!res.ok) {
        let errorMessage = `Chat API returned HTTP ${res.status}`;
        const errorData: unknown = await res.json().catch(() => null);
        if (
          errorData &&
          typeof errorData === 'object' &&
          'error' in errorData &&
          typeof errorData.error === 'string'
        ) {
          errorMessage += `: ${errorData.error}`;
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      const buddyReply: ChatMessage = {
        id: `buddy-${Date.now()}`,
        sender: 'buddy',
        text: data.reply,
        timestamp: Date.now(),
        subject: currentSubject,
        learningStyle: profile.learningStyle,
        actionTriggered: action,
      };

      setMessages((prev) => [...prev, buddyReply]);
    } catch (err) {
      console.error('Failed to get chat response:', err);
      const apiConfigurationMissing = err instanceof Error && err.message.includes('VITE_API_BASE_URL');
      // Fallback friendly message
      const fallbackReply: ChatMessage = {
        id: `buddy-${Date.now()}`,
        sender: 'buddy',
        text:
          apiConfigurationMissing
            ? 'AI chat is not configured for this Android build. Set VITE_API_BASE_URL to your deployed HTTPS backend and rebuild the app.'
            : profile.language === 'hi'
            ? `बहुत अच्छा सवाल है! आइए इसे एक कदम पीछे से देखते हैं। आप इस सवाल में सबसे पहला सुराग क्या देखते हैं?`
            : `Great curiosity! Let's take a small step back. What is the very first clue you notice in this question?`,
        timestamp: Date.now(),
        subject: currentSubject,
        learningStyle: profile.learningStyle,
        actionTriggered: action,
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // From Home Screen: "Ask me anything" bar
  const handleHomeAsk = (question: string, subject?: Subject) => {
    if (subject) {
      setCurrentSubject(subject);
    }
    setCurrentScreen('chat');
    handleSendMessage(question);
  };

  // From Home Screen: Select Subject Tile
  const handleSelectSubject = (subject: Subject) => {
    setCurrentSubject(subject);
    setCurrentScreen('chat');
  };

  // Start Mini Check
  const handleStartMiniCheck = (subject?: Subject, topic?: string) => {
    if (subject) setCurrentSubject(subject);
    if (topic) setCurrentTopic(topic);
    setCurrentScreen('mini-check');
  };

  // Screen 1: Onboarding
  if (!profile.onboarded) {
    return (
      <OnboardingScreen
        onComplete={handleOnboardingComplete}
        initialLanguage={profile.language}
        initialLearningStyle={profile.learningStyle}
      />
    );
  }

  // App Layout with TopNav + Screen Router
  return (
    <div className="min-h-dvh bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* TopNav with logo, student greeting, language dropdown in corner, learning style switch, accessibility text size */}
      <TopNav
        menuBackHandlerRef={menuBackHandlerRef}
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        language={profile.language}
        onLanguageChange={(lang) => setProfile((prev) => ({ ...prev, language: lang }))}
        learningStyle={profile.learningStyle}
        onLearningStyleChange={(st) => setProfile((prev) => ({ ...prev, learningStyle: st }))}
        studentName={profile.name}
        textSize={profile.textSize}
        onTextSizeChange={(sz) => setProfile((prev) => ({ ...prev, textSize: sz }))}
      />

      <main className="flex-1">
        {currentScreen === 'home' && (
          <HomeScreen
            studentName={profile.name}
            language={profile.language}
            learningStyle={profile.learningStyle}
            onAskQuestion={handleHomeAsk}
            onSelectSubject={handleSelectSubject}
            onStartMiniCheck={handleStartMiniCheck}
          />
        )}

        {currentScreen === 'chat' && (
          <ChatScreen
            messages={messages}
            currentSubject={currentSubject}
            language={profile.language}
            learningStyle={profile.learningStyle}
            studentName={profile.name}
            textSize={profile.textSize}
            onSendMessage={handleSendMessage}
            onSubjectChange={setCurrentSubject}
            onTextSizeChange={(sz) => setProfile((prev) => ({ ...prev, textSize: sz }))}
            onBackToHome={() => setCurrentScreen('home')}
            onStartMiniCheck={handleStartMiniCheck}
            isLoading={isAiLoading}
          />
        )}

        {currentScreen === 'mini-check' && (
          <MiniCheckScreen
            subject={currentSubject}
            topic={currentTopic}
            language={profile.language}
            learningStyle={profile.learningStyle}
            studentName={profile.name}
            onBackToChat={() => setCurrentScreen('chat')}
            onBackToHome={() => setCurrentScreen('home')}
          />
        )}
      </main>
    </div>
  );
}
