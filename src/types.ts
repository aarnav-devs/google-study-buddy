export type Language = 'en' | 'hi' | 'es' | 'fr';

export type LearningStyle = 'visual' | 'story' | 'step_by_step';

export type Subject = 'Maths' | 'Science' | 'English' | 'Social Studies';

export type TextSize = 'sm' | 'base' | 'lg' | 'xl';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'buddy';
  text: string;
  timestamp: number;
  subject?: Subject;
  learningStyle?: LearningStyle;
  actionTriggered?: 'hint' | 'example' | 'another_way' | 'got_it';
  isTyping?: boolean;
}

export interface MiniCheckQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  clue?: string;
  correctFeedback: string;
  incorrectFeedback: string;
}

export interface MiniCheckData {
  title: string;
  topic: string;
  questions: MiniCheckQuestion[];
}

export interface UserProfile {
  name: string;
  language: Language;
  learningStyle: LearningStyle;
  onboarded: boolean;
  textSize: TextSize;
}
