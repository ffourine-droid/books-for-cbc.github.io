
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
  created_by?: string;
}

export type LessonType = 'explanation' | 'question' | 'assignment' | 'note';
export type QuestionType = 'input' | 'mcq';

export interface Lesson {
  id: string;
  topic_id: string;
  type: LessonType;
  content: string;
  question_type?: QuestionType;
  options?: string; 
  correct_answer?: string;
  explanation?: string;
  due_date?: string; 
  created_by?: string;
}

export interface Profile {
  id: string;
  username: string;
  role: 'student' | 'admin' | 'teacher';
  created_at?: string;
}

export interface Book {
  id: string;
  title: string;
  author?: string;
  type: 'ebook' | 'audiobook';
  url: string;
  cover_url?: string;
  created_at?: string;
  created_by?: string;
}

export interface Project {
  id: string;
  grade: Grade;
  title: string;
  description: string;
  link?: string;
  created_at?: string;
  created_by?: string;
}

export interface ThemeConfig {
  mode: 'light' | 'dark';
  primary: string;
  secondary: string;
  accent: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
