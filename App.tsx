
import React, { useState, useEffect } from 'react';
import { Grade, Topic, Lesson, Subject } from './types';
import { Icons } from './constants';
import { dataService } from './services/dataService';
import GradeSelection from './components/GradeSelection';
import AITutor from './components/AITutor';
import AdminDashboard from './components/AdminDashboard';

type ViewState = 'grades' | 'subjects' | 'topics' | 'lesson' | 'admin';
type UserRole = 'student' | 'admin';

const ADMIN_PASSWORD = "admin123";

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>('student');
  const [currentView, setCurrentView] = useState<ViewState>('grades');
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, { correct: boolean; message: string; explanation?: string }>>({});
  const [isTutorOpen, setIsTutorOpen] = useState(false);

  // Admin Auth State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  // Fetch subjects for grade
  useEffect(() => {
    if (selectedGrade && currentView === 'subjects') {
      const fetchSubjects = async () => {
        setIsLoading(true);
        try {
          const data = await dataService.getSubjectsByGrade(selectedGrade);
          setSubjects(data);
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchSubjects();
    }
  }, [selectedGrade, currentView]);

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

  const handleBack = () => {
    if (currentView === 'lesson') setCurrentView('topics');
    else if (currentView === 'topics') setCurrentView('subjects');
    else if (currentView === 'subjects') setCurrentView('grades');
    else if (currentView === 'admin') setCurrentView('grades');
  };

  const handleAdminToggle = () => {
    if (role === 'admin') {
      setRole('student');
      setCurrentView('grades');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuthSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (authPassword === ADMIN_PASSWORD) {
      setRole('admin');
      setCurrentView('admin');
      setShowAuthModal(false);
      setAuthPassword('');
      setAuthError(false);
    } else {
      setAuthError(true);
      setAuthPassword('');
    }
  };

  const checkAnswer = (lesson: Lesson) => {
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

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${role === 'admin' ? 'bg-slate-50' : 'bg-[#fdfcf9]'}`}>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { if(role !== 'admin') setCurrentView('grades'); }}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md transition-all ${role === 'admin' ? 'bg-emerald-600' : 'math-gradient'}`}>
              <span className="font-bold text-lg">{role === 'admin' ? 'A' : 'M+'}</span>
            </div>
            <h1 className="font-bold text-xl text-slate-900 hidden sm:block">
              MathMaster {role === 'admin' ? <span className="text-emerald-600">Admin</span> : <span className="text-indigo-600">AI</span>}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={handleAdminToggle}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border-2 transition-all ${
                role === 'admin' ? 'border-emerald-600 text-emerald-600 bg-emerald-50' : 'border-slate-200 text-slate-400 hover:border-indigo-600'
              }`}
            >
              {role === 'admin' ? 'Exit Admin' : 'Admin'}
            </button>

            {currentView !== 'grades' && currentView !== 'admin' && (
              <button onClick={handleBack} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                <Icons.Back />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}
            
            {selectedTopic && currentView === 'lesson' && (
              <button onClick={() => setIsTutorOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-700 transition shadow-lg">
                <Icons.Tutor />
                <span>Ask AI</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-x-hidden">
        {currentView === 'admin' && role === 'admin' && <AdminDashboard />}

        {currentView === 'grades' && <GradeSelection onSelect={handleGradeSelect} />}

        {currentView === 'subjects' && selectedGrade && (
          <div className="max-w-4xl mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Grade {selectedGrade} Subjects</h2>
            {isLoading ? <div className="flex justify-center"><div className="loader"></div></div> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subjects.map(sub => (
                  <button key={sub.id} onClick={() => handleSubjectSelect(sub)} className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 hover:shadow-md transition text-left group">
                    <span className="text-xs font-bold text-indigo-500 uppercase">{sub.code || 'SUB'}</span>
                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition">{sub.name}</h3>
                  </button>
                ))}
                {subjects.length === 0 && <p className="text-slate-500">No subjects found for this grade yet.</p>}
              </div>
            )}
          </div>
        )}

        {currentView === 'topics' && selectedGrade && selectedSubject && (
          <div className="max-w-4xl mx-auto px-4 py-12">
            <header className="mb-8">
              <span className="text-indigo-600 font-bold uppercase text-xs tracking-widest">Grade {selectedGrade} &bull; {selectedSubject.name}</span>
              <h2 className="text-3xl font-bold text-slate-900 mt-1">Available Topics</h2>
            </header>
            {isLoading ? <div className="flex justify-center"><div className="loader"></div></div> : (
              <div className="grid gap-4">
                {topics.map(topic => (
                  <button key={topic.id} onClick={() => handleTopicSelect(topic)} className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 hover:shadow-md transition text-left group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">{topic.order_number}</div>
                      <h3 className="text-lg font-bold text-slate-800">{topic.title}</h3>
                    </div>
                    <div className="rotate-180"><Icons.Back /></div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'lesson' && selectedTopic && (
          <div className="max-w-3xl mx-auto px-4 py-12">
            {isLoading ? <div className="flex justify-center"><div className="loader"></div></div> : (
              <>
                <header className="mb-10 text-center">
                   <h2 className="text-3xl font-black text-slate-900">{selectedTopic.title}</h2>
                   <p className="text-slate-500 mt-2">Study the material and test your knowledge</p>
                </header>
                <div className="space-y-8">
                  {lessons.map((lesson) => (
                    <div key={lesson.id} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                      {lesson.type === 'explanation' ? (
                        <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-wrap">{lesson.content}</p>
                      ) : (
                        <div className="space-y-6">
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shrink-0 font-bold">?</div>
                            <p className="text-lg font-semibold text-slate-800">{lesson.content}</p>
                          </div>
                          
                          {lesson.question_type === 'mcq' ? (
                            <div className="grid gap-2 pl-12">
                              {JSON.parse(lesson.options || '[]').map((opt: string, i: number) => (
                                <button 
                                  key={i}
                                  onClick={() => setUserAnswers(p => ({...p, [lesson.id]: opt}))}
                                  className={`p-4 rounded-xl border-2 text-left font-medium transition ${
                                    userAnswers[lesson.id] === opt ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-300'
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                              <button 
                                onClick={() => checkAnswer(lesson)}
                                className="mt-2 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
                              >
                                Submit Answer
                              </button>
                            </div>
                          ) : (
                            <div className="pl-12 flex gap-3">
                              <input 
                                type="text"
                                value={userAnswers[lesson.id] || ''}
                                onChange={(e) => setUserAnswers(p => ({...p, [lesson.id]: e.target.value}))}
                                className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:bg-white transition-all outline-none"
                                placeholder="Type answer here..."
                              />
                              <button onClick={() => checkAnswer(lesson)} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl">Check</button>
                            </div>
                          )}

                          {feedback[lesson.id] && (
                            <div className={`ml-12 p-4 rounded-2xl animate-in slide-in-from-top-2 ${
                              feedback[lesson.id].correct ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                            }`}>
                              <p className="font-bold">{feedback[lesson.id].message}</p>
                              {feedback[lesson.id].explanation && (
                                <p className="mt-2 text-sm opacity-90 border-t border-black/5 pt-2 italic">{feedback[lesson.id].explanation}</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Admin Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-emerald-600 p-6 text-white text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold">Admin Authentication</h2>
              <p className="text-emerald-100 text-sm">Enter password to manage curriculum</p>
            </div>
            <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
              <div>
                <input
                  autoFocus
                  type="password"
                  value={authPassword}
                  onChange={(e) => { setAuthPassword(e.target.value); setAuthError(false); }}
                  placeholder="Password"
                  className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${
                    authError ? 'border-rose-300 bg-rose-50' : 'border-slate-100 focus:border-emerald-500'
                  }`}
                />
                {authError && <p className="text-rose-600 text-xs mt-1 font-medium">Incorrect password. Please try again.</p>}
              </div>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => { setShowAuthModal(false); setAuthPassword(''); setAuthError(false); }}
                  className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isTutorOpen && selectedTopic && (
        <AITutor 
          grade={selectedGrade as Grade}
          topic={selectedTopic.title}
          isOpen={isTutorOpen}
          onClose={() => setIsTutorOpen(false)}
          currentLessonContent={lessons.map(l => l.content).join('\n')}
        />
      )}
    </div>
  );
};

export default App;
