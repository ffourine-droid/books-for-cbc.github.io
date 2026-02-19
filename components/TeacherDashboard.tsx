
import React, { useState, useEffect } from 'react';
import { Grade, Topic, Lesson, Subject, Profile, LessonType } from '../types';
import { dataService } from '../services/dataService';

interface TeacherDashboardProps {
  user: Profile;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'lessons' | 'assignments' | 'notes' | 'quizzes' | 'topics'>('lessons');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teacherLessons, setTeacherLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [content, setContent] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [explanation, setExplanation] = useState('');
  const [feedback, setFeedback] = useState({ msg: '', type: '' });

  // Topic Form State
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicGrade, setNewTopicGrade] = useState<Grade>(1);
  const [newTopicSubjectId, setNewTopicSubjectId] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [subList, topicList] = await Promise.all([
        dataService.getAllSubjects(),
        // Isolation: Only fetch topics created by THIS teacher
        Promise.all([1,2,3,4,5,6,7,8,9].map(g => dataService.getTopicsByGrade(g as Grade, user.id))).then(res => res.flat())
      ]);
      setSubjects(subList);
      setTopics(topicList);
      
      // Isolation: Only fetch lessons created by THIS teacher for the selected topic
      if (selectedTopicId) {
        const lessons = await dataService.getLessonsByTopic(selectedTopicId, user.id);
        setTeacherLessons(lessons);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedTopicId) {
      dataService.getLessonsByTopic(selectedTopicId, user.id).then(setTeacherLessons);
    } else {
      setTeacherLessons([]);
    }
  }, [selectedTopicId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopicId || !content) return;

    let type: LessonType = 'explanation';
    if (activeTab === 'assignments') type = 'assignment';
    if (activeTab === 'notes') type = 'note';
    if (activeTab === 'quizzes') type = 'question';

    try {
      await dataService.addLesson({
        topic_id: selectedTopicId,
        type,
        content,
        correct_answer: type === 'question' ? correctAnswer : undefined,
        due_date: type === 'assignment' ? dueDate : undefined,
        explanation: type === 'question' ? explanation : undefined,
        question_type: type === 'question' ? 'input' : undefined
      }, user.id);
      
      setContent(''); setCorrectAnswer(''); setDueDate(''); setExplanation('');
      setFeedback({ msg: 'Successfully posted to your workspace!', type: 'success' });
      
      // Refresh lessons
      const lessons = await dataService.getLessonsByTopic(selectedTopicId, user.id);
      setTeacherLessons(lessons);
      
      setTimeout(() => setFeedback({ msg: '', type: '' }), 3000);
    } catch (err: any) {
      setFeedback({ msg: err.message, type: 'error' });
    }
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle || !newTopicSubjectId) return;

    try {
      await dataService.addTopic({
        title: newTopicTitle,
        grade: newTopicGrade,
        subject_id: newTopicSubjectId,
        order_number: topics.filter(t => t.grade === newTopicGrade).length + 1
      }, user.id);
      
      setNewTopicTitle('');
      setFeedback({ msg: 'Topic created successfully!', type: 'success' });
      
      // Refresh topics with isolation
      const topicList = await Promise.all([1,2,3,4,5,6,7,8,9].map(g => dataService.getTopicsByGrade(g as Grade, user.id))).then(res => res.flat());
      setTopics(topicList);
      
      setTimeout(() => setFeedback({ msg: '', type: '' }), 3000);
    } catch (err: any) {
      setFeedback({ msg: err.message, type: 'error' });
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await dataService.deleteLesson(id);
      setTeacherLessons(prev => prev.filter(l => l.id !== id));
      setFeedback({ msg: 'Lesson deleted.', type: 'success' });
      setTimeout(() => setFeedback({ msg: '', type: '' }), 3000);
    } catch (err: any) {
      setFeedback({ msg: err.message, type: 'error' });
    }
  };

  if (isLoading) return <div className="p-20 text-center font-bold">Initializing Secure Workspace...</div>;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <div className="border-b-4 border-indigo-600 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black theme-text-main">Teacher Workspace</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1 sm:mt-2">Private Workspace for {user.username}</p>
        </div>
        <div>
           <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase border border-indigo-100">Verified Educator</span>
        </div>
      </div>

      <div className="flex flex-row gap-2 overflow-x-auto pb-2 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        {(['lessons', 'assignments', 'notes', 'quizzes', 'topics'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); }}
            className={`px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
          >
            {tab === 'topics' ? 'Manage Topics' : `Create ${tab === 'quizzes' ? 'Quiz' : tab.slice(0, -1)}`}
          </button>
        ))}
      </div>

      {activeTab === 'topics' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border-2 border-slate-100 shadow-sm">
            <h3 className="text-lg font-black theme-text-main mb-6 flex items-center gap-2">
              <span className="p-2 bg-indigo-100 text-indigo-600 rounded-lg text-sm">📚</span> 
              Create New Topic
            </h3>
            <form onSubmit={handleAddTopic} className="space-y-6">
              {feedback.msg && (
                <div className={`p-4 rounded-xl font-bold text-xs sm:text-sm text-center animate-in slide-in-from-top-2 ${feedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {feedback.msg}
                </div>
              )}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Topic Title</label>
                <input 
                  type="text"
                  value={newTopicTitle}
                  onChange={e => setNewTopicTitle(e.target.value)}
                  className="w-full p-4 border-2 border-slate-50 rounded-xl bg-slate-50 font-bold outline-none focus:border-indigo-600 transition-colors text-sm"
                  placeholder="e.g. Introduction to Algebra"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Grade</label>
                  <select 
                    value={newTopicGrade}
                    onChange={e => setNewTopicGrade(parseInt(e.target.value) as Grade)}
                    className="w-full p-4 border-2 border-slate-50 rounded-xl bg-slate-50 font-bold outline-none focus:border-indigo-600 transition-colors text-sm"
                  >
                    {[1,2,3,4,5,6,7,8,9].map(g => <option key={g} value={g}>Grade {g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject</label>
                  <select 
                    value={newTopicSubjectId}
                    onChange={e => setNewTopicSubjectId(e.target.value)}
                    className="w-full p-4 border-2 border-slate-50 rounded-xl bg-slate-50 font-bold outline-none focus:border-indigo-600 transition-colors text-sm"
                    required
                  >
                    <option value="">-- Select Subject --</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-700 transition-all active:scale-95 text-xs sm:text-sm">
                Create Topic
              </button>
            </form>
          </div>
          <div className="bg-slate-50 p-6 rounded-[1.5rem] border-2 border-slate-100">
            <h4 className="font-black text-slate-800 mb-4 uppercase tracking-widest text-[10px]">Topic Guidelines</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-bold">
              Topics are the containers for your lessons. Create a topic first, then you can add lessons, assignments, and quizzes to it.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border-2 border-slate-100 shadow-sm">
            <h3 className="text-lg font-black theme-text-main mb-6 flex items-center gap-2">
              <span className="p-2 bg-indigo-100 text-indigo-600 rounded-lg text-sm">✍️</span> 
              New {activeTab === 'quizzes' ? 'Quiz' : activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(1, -1)}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              {feedback.msg && (
                <div className={`p-4 rounded-xl font-bold text-xs sm:text-sm text-center animate-in slide-in-from-top-2 ${feedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {feedback.msg}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Learning Module (Topic)</label>
                <select 
                  value={selectedTopicId} 
                  onChange={e => setSelectedTopicId(e.target.value)}
                  className="w-full p-4 border-2 border-slate-50 rounded-xl bg-slate-50 font-bold outline-none focus:border-indigo-600 transition-colors text-sm"
                >
                  <option value="">-- Select a topic --</option>
                  {[1,2,3,4,5,6,7,8,9].map(g => (
                    <optgroup key={g} label={`Grade ${g}`}>
                      {topics.filter(t => t.grade === g).map(t => (
                        <option key={t.id} value={t.id}>{t.title} ({subjects.find(s => s.id === t.subject_id)?.name || 'Unknown Subject'})</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {activeTab === 'lessons' ? 'Lesson Narrative' : activeTab === 'assignments' ? 'Assignment Details' : activeTab === 'notes' ? 'Notes Content' : 'Quiz Question'}
                </label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={4}
                  className="w-full p-4 sm:p-6 border-2 border-slate-50 rounded-xl bg-slate-50 font-bold outline-none focus:border-indigo-600 text-sm sm:text-base"
                  placeholder="Type your content here..."
                />
              </div>

              {activeTab === 'quizzes' && (
                <div className="space-y-4 animate-in slide-in-from-top-2">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Expected Answer</label>
                    <input
                      type="text"
                      value={correctAnswer}
                      onChange={e => setCorrectAnswer(e.target.value)}
                      className="w-full p-4 border-2 border-slate-50 rounded-xl bg-slate-50 font-bold text-sm"
                      placeholder="The student must type this exactly"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Explanation (Shown after answer)</label>
                    <textarea
                      value={explanation}
                      onChange={e => setExplanation(e.target.value)}
                      rows={2}
                      className="w-full p-4 border-2 border-slate-50 rounded-xl bg-slate-50 font-bold text-sm"
                      placeholder="Why is this the correct answer?"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'assignments' && (
                <div className="animate-in slide-in-from-top-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full p-4 border-2 border-slate-50 rounded-xl bg-slate-50 font-bold text-sm"
                  />
                </div>
              )}

              <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 transition-all active:scale-95 text-xs sm:text-sm">
                Publish to Class
              </button>
            </form>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="bg-indigo-900 p-6 rounded-[1.5rem] sm:rounded-[2rem] text-white shadow-xl">
              <h4 className="font-black text-base sm:text-lg mb-2">Your Published Content</h4>
              <p className="text-indigo-200 text-[10px] sm:text-xs leading-relaxed font-bold mb-4">
                Manage the lessons you've created for the selected topic.
              </p>
              
              <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                {teacherLessons.length > 0 ? (
                  teacherLessons.map(lesson => (
                    <div key={lesson.id} className="p-3 bg-white/10 rounded-xl border border-white/10 flex justify-between items-start gap-2 group">
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">{lesson.type}</p>
                        <p className="text-xs font-bold truncate">{lesson.content}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="p-1 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-indigo-300 italic text-[10px]">No lessons created for this topic yet.</p>
                )}
              </div>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-[1.5rem] sm:rounded-[2rem] border-2 border-slate-100">
              <h4 className="font-black text-slate-800 mb-4 uppercase tracking-widest text-[10px]">Your Stats</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Your Lessons</span>
                  <span className="font-black text-sm text-indigo-600">{teacherLessons.length} in Topic</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
