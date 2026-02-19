
import { supabase } from './supabaseClient';
import { Topic, Lesson, Grade, Subject, Profile, Book, Project } from '../types';

const ensureClient = () => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  return supabase;
};

export const dataService = {
  // Auth & Profiles
  async login(username: string, password: string): Promise<Profile> {
    const client = ensureClient();
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();
    
    if (error) throw new Error("Invalid username or password.");
    return data;
  },

  async register(username: string, password: string, role: 'student' | 'teacher' | 'admin' = 'student'): Promise<Profile> {
    const client = ensureClient();
    const { data, error } = await client
      .from('profiles')
      .insert([{ username, password, role }])
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') throw new Error("Username already exists.");
      throw error;
    }
    return data;
  },

  async searchUsers(query: string): Promise<Profile[]> {
    const client = ensureClient();
    const { data, error } = await client
      .from('profiles')
      .select('id, username, role')
      .ilike('username', `%${query}%`)
      .limit(10);
    if (error) throw error;
    return data || [];
  },

  // Library / Books
  async getBooks(type?: 'ebook' | 'audiobook', ownerId?: string): Promise<Book[]> {
    const client = ensureClient();
    let query = client.from('books').select('*');
    if (type) query = query.eq('type', type);
    if (ownerId) query = query.eq('created_by', ownerId);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async addBook(book: Omit<Book, 'id' | 'created_at'>, userId: string): Promise<Book> {
    const client = ensureClient();
    const { data, error } = await client.from('books').insert([{ ...book, created_by: userId }]).select().single();
    if (error) throw error;
    return data;
  },

  async deleteBook(id: string): Promise<void> {
    const client = ensureClient();
    const { error } = await client.from('books').delete().eq('id', id);
    if (error) throw error;
  },

  // Projects
  async getProjects(grade?: Grade, ownerId?: string): Promise<Project[]> {
    const client = ensureClient();
    let query = client.from('projects').select('*');
    if (grade) query = query.eq('grade', grade);
    if (ownerId) query = query.eq('created_by', ownerId);
    const { data, error } = await query.order('grade', { ascending: true }).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async addProject(project: Omit<Project, 'id' | 'created_at'>, userId: string): Promise<Project> {
    const client = ensureClient();
    const { data, error } = await client.from('projects').insert([{ ...project, created_by: userId }]).select().single();
    if (error) throw error;
    return data;
  },

  async deleteProject(id: string): Promise<void> {
    const client = ensureClient();
    const { error } = await client.from('projects').delete().eq('id', id);
    if (error) throw error;
  },

  // Subjects
  async getAllSubjects(): Promise<Subject[]> {
    const client = ensureClient();
    const { data, error } = await client
      .from('subjects')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
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
  async getTopicsByGrade(grade: Grade, ownerId?: string): Promise<Topic[]> {
    const client = ensureClient();
    let query = client.from('topics').select('*').eq('grade', grade);
    if (ownerId) query = query.eq('created_by', ownerId);
    const { data, error } = await query.order('order_number', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async getTopicsByGradeAndSubject(grade: Grade, subjectId: string, ownerId?: string): Promise<Topic[]> {
    const client = ensureClient();
    let query = client
      .from('topics')
      .select('*')
      .eq('grade', grade)
      .eq('subject_id', subjectId);
    
    if (ownerId) query = query.eq('created_by', ownerId);
    
    const { data, error } = await query.order('order_number', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async addTopic(topic: Omit<Topic, 'id'>, userId: string): Promise<Topic> {
    const client = ensureClient();
    const { data, error } = await client.from('topics').insert([{ ...topic, created_by: userId }]).select().single();
    if (error) throw error;
    return data;
  },

  async deleteTopic(id: string): Promise<void> {
    const client = ensureClient();
    const { error } = await client.from('topics').delete().eq('id', id);
    if (error) throw error;
  },

  // Lessons
  async getLessonsByTopic(topicId: string, ownerId?: string): Promise<Lesson[]> {
    const client = ensureClient();
    let query = client.from('lessons').select('*').eq('topic_id', topicId);
    if (ownerId) query = query.eq('created_by', ownerId);
    const { data, error } = await query.order('id', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async addLesson(lesson: Omit<Lesson, 'id'>, userId: string): Promise<Lesson> {
    const client = ensureClient();
    const { data, error } = await client.from('lessons').insert([{ ...lesson, created_by: userId }]).select().single();
    if (error) throw error;
    return data;
  },

  async deleteLesson(id: string): Promise<void> {
    const client = ensureClient();
    const { error } = await client.from('lessons').delete().eq('id', id);
    if (error) throw error;
  }
};
