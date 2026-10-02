import React, { useState, useEffect } from 'react';
import { apiUrl } from '../api';
import { Subject, Language, LearningStyle, MiniCheckData, MiniCheckQuestion } from '../types';
import { LOCALES } from '../locales';
import { Mascot } from './Mascot';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  MessageSquare,
  HelpCircle,
  Award,
  Zap,
} from 'lucide-react';

interface MiniCheckScreenProps {
  subject: Subject;
  topic?: string;
  language: Language;
  learningStyle: LearningStyle;
  studentName: string;
  onBackToChat: () => void;
  onBackToHome: () => void;
}

export const MiniCheckScreen: React.FC<MiniCheckScreenProps> = ({
  subject,
  topic = 'Core Concepts',
  language,
  learningStyle,
  studentName,
  onBackToChat,
  onBackToHome,
}) => {
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState<MiniCheckData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showClue, setShowClue] = useState(false);
  const [adaptiveFeedback, setAdaptiveFeedback] = useState<string>('');

  const t = LOCALES[language];

  // Fetch or generate adaptive quiz questions from backend
  const fetchMiniCheck = async () => {
    setLoading(true);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsCompleted(false);
    setShowClue(false);
    setAdaptiveFeedback('');

    try {
      const res = await fetch(apiUrl('/api/study/mini-check'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic,
          learningStyle,
          language,
          studentName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setQuizData(data);
      } else {
        throw new Error('Failed to load quiz');
      }
    } catch (err) {
      console.error('Quiz loading failed, fallback will load:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMiniCheck();
  }, [subject, language]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Mascot size="lg" mood="thinking" className="animate-spin duration-3000" />
        <div className="space-y-1">
          <h3 className="text-lg font-extrabold text-slate-800">
            Generating your personalized Mini Check...
          </h3>
          <p className="text-xs text-slate-500">
            Tailoring 2-3 adaptive questions to your {t.styles[learningStyle].title} style!
          </p>
        </div>
      </div>
    );
  }

  const questions: MiniCheckQuestion[] = quizData?.questions || [
    {
      id: 'default_1',
      question:
        language === 'hi'
          ? 'यदि आपके पास 4 आम हैं और आप 2 आम अपने दोस्त को देते हैं, तो आपके पास कितना हिस्सा बचा?'
          : 'If a pizza has 8 slices and you share 4 with a buddy, what fraction did you share?',
      options:
        language === 'hi'
          ? ['1/4 हिस्सा', '1/2 (आधा) हिस्सा', '3/4 हिस्सा', 'कोई नहीं']
          : ['1/4 of the pizza', '1/2 of the pizza', '3/4 of the pizza', '1/8 of the pizza'],
      correctIndex: 1,
      clue: '4 is exactly half of 8!',
      correctFeedback: "Nice! Let's try one more.",
      incorrectFeedback: 'Almost! Think about dividing into 2 equal halves.',
    },
    {
      id: 'default_2',
      question:
        language === 'hi'
          ? 'भिन्न 2/4 का सरलतम रूप क्या होगा?'
          : 'Which of the following is equivalent to 2/3?',
      options: language === 'hi' ? ['1/2', '1/3', '2/3', '1/4'] : ['4/6', '3/4', '2/6', '4/9'],
      correctIndex: 0,
      clue: 'Multiply top and bottom by 2!',
      correctFeedback: 'Fantastic job! You mastered this topic! 🌟',
      incorrectFeedback: 'Multiply or divide both numerator and denominator by 2.',
    },
  ];

  const currentQ = questions[currentQuestionIndex];
  const isCorrect = selectedOption === currentQ?.correctIndex;

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);

    if (selectedOption === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
      // Adaptive feedback
      if (currentQuestionIndex === 0) {
        setAdaptiveFeedback("Nice! Let's try one more.");
      } else {
        setAdaptiveFeedback("You're getting so good at this! Concept mastered! 🌟");
      }
    } else {
      setAdaptiveFeedback(currentQ.incorrectFeedback || 'Close! Take a look at the clue below.');
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setShowClue(false);
      setAdaptiveFeedback('');
    } else {
      setIsCompleted(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Top Breadcrumb & Subject Badge */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            {subject}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {quizData?.topic || topic}
          </span>
        </div>

        {/* Adaptive pill */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
          <Zap className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t.miniCheck.adaptiveTag}</span>
        </div>
      </div>

      {/* Completion View */}
      {isCompleted ? (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="flex justify-center">
            <Mascot size="xl" mood="celebrating" className="animate-bounce duration-1000" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Mini Check Complete</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {t.miniCheck.congratsTitle}
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              {t.miniCheck.congratsSubtitle}
            </p>
          </div>

          {/* Score Card */}
          <div className="py-4 px-6 rounded-2xl bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 max-w-sm mx-auto">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Final Score
            </div>
            <div className="text-3xl font-extrabold text-blue-700">
              {score} / {questions.length}
            </div>
            <p className="text-xs text-blue-900/70 font-semibold mt-1">
              {t.miniCheck.scoreText(score, questions.length)}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={fetchMiniCheck}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.miniCheck.retryQuiz}</span>
            </button>

            <button
              onClick={onBackToChat}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t.miniCheck.backToChat}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Active Question Card */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Mascot size="sm" mood={isAnswerSubmitted ? (isCorrect ? 'celebrating' : 'thinking') : 'happy'} />
              <span className="text-xs font-bold text-slate-500">
                {t.miniCheck.questionOf(currentQuestionIndex + 1, questions.length)}
              </span>
            </div>

            {/* Stepper Dots */}
            <div className="flex items-center gap-1.5">
              {questions.map((_, i) => (
                <span
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === currentQuestionIndex
                      ? 'bg-blue-600 scale-125'
                      : i < currentQuestionIndex
                      ? 'bg-emerald-500'
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 leading-snug">
              {currentQ.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((option, index) => {
              const isSelected = selectedOption === index;
              let optionStyle = 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white text-slate-800';

              if (isAnswerSubmitted) {
                if (index === currentQ.correctIndex) {
                  optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20';
                } else if (isSelected) {
                  optionStyle = 'border-red-400 bg-red-50 text-red-900 ring-2 ring-red-400/20';
                } else {
                  optionStyle = 'border-slate-100 bg-slate-50/50 text-slate-400 opacity-60';
                }
              } else if (isSelected) {
                optionStyle = 'border-blue-500 bg-blue-50/80 text-blue-900 font-bold ring-2 ring-blue-500/20';
              }

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectOption(index)}
                  disabled={isAnswerSubmitted}
                  className={`w-full text-left p-4 rounded-2xl border text-sm sm:text-base font-semibold transition-all flex items-center justify-between gap-3 cursor-pointer ${optionStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs bg-slate-100 text-slate-600">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{option}</span>
                  </div>

                  {isAnswerSubmitted && index === currentQ.correctIndex && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {isAnswerSubmitted && isSelected && index !== currentQ.correctIndex && (
                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Friendly Feedback & Clue Section */}
          {isAnswerSubmitted && (
            <div
              className={`p-4 rounded-2xl border transition-all animate-in fade-in duration-200 ${
                isCorrect
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900'
                  : 'bg-amber-50/90 border-amber-300 text-amber-900'
              }`}
            >
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="font-extrabold text-sm">
                    {isCorrect ? 'Nice! Let\'s try one more.' : 'Good try! Here is a helpful clue:'}
                  </div>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed">
                    {isCorrect ? currentQ.correctFeedback : currentQ.clue || currentQ.incorrectFeedback}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer Navigation Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            {!isAnswerSubmitted ? (
              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                {t.miniCheck.checkAnswer}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {currentQuestionIndex + 1 < questions.length
                    ? t.miniCheck.nextQuestion
                    : t.miniCheck.finishQuiz}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
