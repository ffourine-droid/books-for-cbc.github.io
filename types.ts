
export type Grade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface Subject {
  id: string;
  name: string;
  code?: string;
}

export interface Topic {
  id: string;
  subject_id: string;
  grade: Grade;
  title: string;
  order_number: number;
}

export type LessonType = 'explanation' | 'question';
export type QuestionType = 'input' | 'mcq';

export interface Lesson {
  id: string;
  topic_id: string;
  type: LessonType;
  content: string;
  question_type?: QuestionType;
  options?: string; // JSON string of options for MCQ
  correct_answer?: string;
  explanation?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
