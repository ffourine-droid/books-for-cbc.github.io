
import { supabase } from './supabaseClient';
import { Topic, Lesson, Grade, Subject } from '../types';

const ensureClient = () => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  return supabase;
};

export const dataService = {
  // Subjects
  async getAllSubjects(): Promise<Subject[]> {
    const client = ensureClient();
    const { data, error } = await client.from('subjects').select('*').order('name');
    if (error) throw error;
    return data || [];
  },

  async getSubjectsByGrade(grade: Grade): Promise<Subject[]> {
    const client = ensureClient();
    // Get subjects that have topics for this specific grade
    const { data, error } = await client
      .from('topics')
      .select('subject_id, subjects!inner(id, name, code)')
      .eq('grade', grade);
    
    if (error) throw error;
    
    const subjectsMap = new Map<string, Subject>();
    data?.forEach(item => {
      const sub = item.subjects as any as Subject;
      if (sub && !subjectsMap.has(sub.id)) {
        subjectsMap.set(sub.id, sub);
      }
    });
    return Array.from(subjectsMap.values());
  },

  async addSubject(name: string, code?: string): Promise<Subject> {
    const client = ensureClient();
    const { data, error } = await client.from('subjects').insert([{ name, code }]).select().single();
    if (error) throw error;
    return data;
  },

  async deleteSubject(id: string): Promise<void> {
    const client = ensureClient();
    const { error } = await client.from('subjects').delete().eq('id', id);
    if (error) throw error;
  },

  // Topics
  // Fixed missing method for AdminDashboard
  async getTopicsByGrade(grade: Grade): Promise<Topic[]> {
    const client = ensureClient();
    const { data, error } = await client
      .from('topics')
      .select('*')
      .eq('grade', grade)
      .order('order_number', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async getTopicsByGradeAndSubject(grade: Grade, subjectId: string): Promise<Topic[]> {
    const client = ensureClient();
    const { data, error } = await client
      .from('topics')
      .select('*')
      .eq('grade', grade)
      .eq('subject_id', subjectId)
      .order('order_number', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async addTopic(topic: Omit<Topic, 'id'>): Promise<Topic> {
    const client = ensureClient();
    const { data, error } = await client.from('topics').insert([topic]).select().single();
    if (error) throw error;
    return data;
  },

  // Lessons
  async getLessonsByTopic(topicId: string): Promise<Lesson[]> {
    const client = ensureClient();
    const { data, error } = await client
      .from('lessons')
      .select('*')
      .eq('topic_id', topicId)
      .order('id', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async addLesson(lesson: Omit<Lesson, 'id'>): Promise<Lesson> {
    const client = ensureClient();
    const { data, error } = await client.from('lessons').insert([lesson]).select().single();
    if (error) throw error;
    return data;
  }
};
