
import React, { useState, useEffect, useRef } from 'react';
import { Grade, Topic, Lesson, Subject, Profile, ThemeConfig } from './types';
import { Icons } from './constants';
import { dataService } from './services/dataService';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import Auth from './components/Auth';
import BooksView from './components/BooksView';
import ProjectsView from './components/ProjectsView';
import ThemeSettings from './components/ThemeSettings';
import FlashcardsView from './components/FlashcardsView';

type ViewState = 'grades' | 'subjects' | 'topics' | 'lesson' | 'admin' | 'teacher' | 'ebooks' | 'audiobooks' | 'theme' | 'projects' | 'cards';

const DEFAULT_THEME: ThemeConfig = {
  mode: 'light',
  primary: '#4f46e5',
  secondary: '#6366f1',
  accent: '#10b981'
};

const App: React.FC = () => {
  const [user, setUser] = useState<Profile | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('grades');
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Theme State
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('cbc_theme');
    return saved ? JSON.parse(saved) : DEFAULT_THEME;
  });

  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, { correct: boolean; message: string; explanation?: string }>>({});

  // Menu Dropdown State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Apply Theme to Document
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme.mode);
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--accent', theme.accent);
    localStorage.setItem('cbc_theme', JSON.stringify(theme));
  }, [theme]);

  // Persistence: Load user and redirect based on role
  useEffect(() => {
    const savedUser = localStorage.getItem('cbc_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      
      // Auto-redirect based on role
      if (parsedUser.role === 'admin') setCurrentView('admin');
      else if (parsedUser.role === 'teacher') setCurrentView('teacher');
      else setCurrentView('grades');
    }
  }, []);

  // Handle clicks outside menu to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAuthSuccess = (profile: Profile) => {
    setUser(profile);
    localStorage.setItem('cbc_user', JSON.stringify(profile));
    
    // Redirect logic immediately after auth
    if (profile.role === 'admin') setCurrentView('admin');
    else if (profile.role === 'teacher') setCurrentView('teacher');
    else setCurrentView('grades');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cbc_user');
    setCurrentView('grades');
    setIsMenuOpen(false);
  };

  // Fetch subjects for the platform
  useEffect(() => {
    if (currentView === 'subjects' || currentView === 'grades') {
      const fetchSubjects = async () => {
        setIsLoading(true);
        try {
          const data = await dataService.getAllSubjects();
          setSubjects(data);
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchSubjects();
    }
  }, [currentView]);

  // Fetch topics for grade + subject
  useEffect(() => {
    if (selectedGrade && selectedSubject && currentView === 'topics') {
      const fetchTopics = async () => {
        setIsLoading(true);
        try {
          const data = await dataService.getTopicsByGradeAndSubject(selectedGrade, selectedSubject.id);
          setTopics(data);
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchTopics();
    }
  }, [selectedGrade, selectedSubject, currentView]);

  const handleGradeSelect = (grade: Grade) => {
    setSelectedGrade(grade);
    setCurrentView('subjects');
  };

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    setCurrentView('topics');
  };

  const handleTopicSelect = async (topic: Topic) => {
    setSelectedTopic(topic);
    setIsLoading(true);
    setCurrentView('lesson');
    try {
      const data = await dataService.getLessonsByTopic(topic.id);
      setLessons(data);
      setUserAnswers({});
      setFeedback({});
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAnswer = async (lesson: Lesson) => {
    const input = userAnswers[lesson.id]?.trim().toLowerCase();
    const isCorrect = input === lesson.correct_answer?.toLowerCase();
    
    setFeedback(prev => ({
      ...prev,
      [lesson.id]: {
        correct: isCorrect,
        message: isCorrect ? "✅ Correct!" : "❌ Incorrect. Try again!",
        explanation: lesson.explanation
      }
    }));
  };

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen theme-text-main pb-10 transition-colors duration-300">
      <header className="theme-bg-surface border-b border-slate-300/20 py-4 px-4 shadow-sm sticky top-0 z-40 transition-colors">
        <div className="max-w-[1000px] mx-auto flex flex-row justify-between items-center gap-2">
          <h1 
            className="text-xl sm:text-2xl md:text-3xl font-black theme-text-main cursor-pointer hover:opacity-80 transition truncate mr-2"
            onClick={() => {
              if (user.role === 'admin') setCurrentView('admin');
              else if (user.role === 'teacher') setCurrentView('teacher');
              else setCurrentView('grades');
            }}
          >
            CBC Portal
          </h1>
          
          <div className="flex items-center gap-1 relative" ref={menuRef}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-3 px-3 py-2 bg-slate-800 text-white rounded-full font-bold transition hover:bg-slate-700 active:scale-95 shadow-md"
              style={{ backgroundColor: theme.mode === 'dark' ? 'var(--primary)' : '#1e293b' }}
            >
              <Icons.Menu />
              <div className="w-6 h-6 theme-bg-surface rounded-full flex items-center justify-center theme-text-primary text-[10px] flex-shrink-0 shadow-inner font-black">
                {user.username.charAt(0).toUpperCase()}
              </div>
            </button>

            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 theme-bg-surface rounded-2xl shadow-2xl border border-slate-200/20 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 bg-slate-50/5 border-b border-slate-200/10">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.role} Account</p>
                  <p className="font-black theme-text-main truncate">{user.username}</p>
                </div>
                
                <div className="py-2">
                  <button onClick={() => { setCurrentView('grades'); setIsMenuOpen(false); }} className="w-full px-6 py-3 text-left hover:bg-slate-500/5 flex items-center gap-3 text-sm font-bold theme-text-main">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100/10 text-indigo-500 flex items-center justify-center"><Icons.Tutor /></div>
                    Curriculum
                  </button>

                  {user.role === 'admin' && (
                    <button onClick={() => { setCurrentView('admin'); setIsMenuOpen(false); }} className="w-full px-6 py-3 text-left hover:bg-slate-500/5 flex items-center gap-3 text-sm font-bold theme-text-main">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">⚙️</div>
                      Admin Panel
                    </button>
                  )}

                  {user.role === 'teacher' && (
                    <button onClick={() => { setCurrentView('teacher'); setIsMenuOpen(false); }} className="w-full px-6 py-3 text-left hover:bg-slate-500/5 flex items-center gap-3 text-sm font-bold theme-text-main">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">👨‍🏫</div>
                      Management
                    </button>
                  )}

                  <button onClick={() => { setCurrentView('theme'); setIsMenuOpen(false); }} className="w-full px-6 py-3 text-left hover:bg-slate-500/5 flex items-center gap-3 text-sm font-bold theme-text-main">
                    <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-500 flex items-center justify-center">🎨</div>
                    Appearance
                  </button>
                </div>

                <div className="p-4 bg-red-50/5">
                  <button onClick={handleLogout} className="w-full py-2 bg-red-600 text-white rounded-lg font-black text-xs uppercase tracking-widest hover:bg-red-700 transition">Logout</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1000px] mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {currentView === 'theme' && <div className="theme-bg-surface p-10 rounded-xl shadow-md border theme-border"><ThemeSettings currentTheme={theme} onThemeChange={setTheme} /></div>}
        {currentView === 'admin' && <div className="theme-bg-surface p-10 rounded-xl shadow-md border theme-border"><AdminDashboard user={user} /></div>}
        {currentView === 'teacher' && <div className="theme-bg-surface p-10 rounded-xl shadow-md border theme-border"><TeacherDashboard user={user} /></div>}
        
        {currentView === 'grades' && (
          <div className="theme-bg-surface p-5 sm:p-10 rounded-xl shadow-md border theme-border">
            <h2 className="text-2xl font-black mb-8 theme-text-main border-l-4 border-indigo-600 pl-4">Curriculum Explorer</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => (
                <button key={g} onClick={() => handleGradeSelect(g as Grade)} className="group p-6 border-2 theme-border theme-bg-surface rounded-xl hover:shadow-lg transition-all text-center relative overflow-hidden active:scale-95">
                  <div className="text-3xl font-black theme-text-main absolute -right-2 -bottom-2 opacity-5">G{g}</div>
                  <div className="relative z-10">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Standard</div>
                    <div className="text-xl font-black theme-text-main">Grade {g}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentView === 'subjects' && selectedGrade && (
          <div className="theme-bg-surface p-5 sm:p-10 rounded-xl shadow-md border theme-border">
            <div className="flex items-center gap-4 mb-8">
               <button onClick={() => setCurrentView('grades')} className="p-2 hover:bg-slate-500/10 rounded-full transition theme-text-main"><Icons.Back /></button>
               <h2 className="text-2xl font-black theme-text-main">Grade {selectedGrade} Subjects</h2>
            </div>
            {isLoading ? <p className="text-slate-500 italic">Loading subjects...</p> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subjects.map(sub => (
                  <div key={sub.id} onClick={() => handleSubjectSelect(sub)} className="p-6 border-2 theme-border rounded-xl bg-slate-50/5 cursor-pointer hover:bg-slate-500/10 hover:shadow-md transition-all flex justify-between items-center group active:scale-95">
                    <span className="text-lg font-bold theme-text-main">{sub.name}</span>
                    <Icons.ChevronRight />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'topics' && selectedGrade && selectedSubject && (
          <div className="theme-bg-surface p-5 sm:p-10 rounded-xl shadow-md border theme-border">
            <div className="flex items-center gap-4 mb-8">
               <button onClick={() => setCurrentView('subjects')} className="p-2 hover:bg-slate-500/10 rounded-full transition theme-text-main"><Icons.Back /></button>
               <h2 className="text-2xl font-black theme-text-main">Learning Topics</h2>
            </div>
            <div className="space-y-3">
              {topics.map(topic => (
                <div key={topic.id} onClick={() => handleTopicSelect(topic)} className="p-5 border theme-border rounded-xl bg-slate-50/5 cursor-pointer hover:bg-slate-500/10 hover:shadow-md transition-all flex justify-between items-center group active:scale-95">
                  <span className="text-lg font-bold theme-text-main">{topic.title}</span>
                  <Icons.ChevronRight />
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'lesson' && selectedTopic && (
          <div className="theme-bg-surface p-10 rounded-xl shadow-md border theme-border">
            <div className="flex items-center gap-4 mb-8 border-b border-slate-200/10 pb-6">
              <button onClick={() => setCurrentView('topics')} className="p-2 hover:bg-slate-500/10 rounded-full transition theme-text-main"><Icons.Back /></button>
              <h2 className="text-3xl font-black theme-text-main">{selectedTopic.title}</h2>
            </div>

            <div className="space-y-8">
              {lessons.map((lesson, idx) => (
                <div key={lesson.id} className="relative pl-6 border-l-2 theme-border last:border-0 pb-12">
                  <div className={`text-[10px] font-black uppercase tracking-widest mb-4 px-3 py-1 rounded-full inline-block ${lesson.type === 'assignment' ? 'bg-orange-100 text-orange-600' : lesson.type === 'note' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                    {lesson.type}
                  </div>
                  
                  <div className="text-xl leading-relaxed theme-text-main bg-slate-500/5 p-8 rounded-2xl border theme-border whitespace-pre-wrap">
                    {lesson.content}
                    {lesson.due_date && <div className="mt-4 pt-4 border-t border-slate-200 text-sm font-black text-orange-600">Due Date: {lesson.due_date}</div>}
                  </div>

                  {lesson.type === 'question' && (
                    <div className="mt-6 space-y-4">
                      <input 
                        type="text"
                        value={userAnswers[lesson.id] || ''}
                        onChange={(e) => setUserAnswers(p => ({...p, [lesson.id]: e.target.value}))}
                        className="w-full px-5 py-4 border-2 theme-border rounded-xl outline-none focus:border-indigo-600 font-bold"
                        placeholder="Type answer here..."
                      />
                      <button onClick={() => checkAnswer(lesson)} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 transition shadow-lg">Submit</button>
                      {feedback[lesson.id] && <div className={`mt-4 p-4 rounded-xl font-bold ${feedback[lesson.id].correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{feedback[lesson.id].message}</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
