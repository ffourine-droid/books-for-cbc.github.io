
import React, { useState, useEffect } from 'react';
import { Grade, Topic, Lesson, Subject, QuestionType } from '../types';
import { dataService } from '../services/dataService';

const AdminDashboard: React.FC = () => {
  const [selectedGrade, setSelectedGrade] = useState<Grade>(1);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Forms
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicSubjectId, setNewTopicSubjectId] = useState('');
  
  const [lessonType, setLessonType] = useState<'explanation' | 'question'>('explanation');
  const [lessonContent, setLessonContent] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('input');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [mcqOptionsRaw, setMcqOptionsRaw] = useState('');
  const [explanationText, setExplanationText] = useState('');

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const subData = await dataService.getAllSubjects();
      setSubjects(subData);
      const topData = await dataService.getTopicsByGrade(selectedGrade); // Assuming this helper exists or fetch manually
      setTopics(topData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { refreshData(); }, [selectedGrade]);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName) return;
    try {
      await dataService.addSubject(newSubName, newSubCode);
      setNewSubName(''); setNewSubCode('');
      refreshData();
    } catch (err) { alert(err); }
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle || !newTopicSubjectId) return;
    try {
      await dataService.addTopic({
        title: newTopicTitle,
        grade: selectedGrade,
        subject_id: newTopicSubjectId,
        order_number: topics.length + 1
      });
      setNewTopicTitle('');
      refreshData();
    } catch (err) { alert(err); }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTopic || !lessonContent) return;
    try {
      await dataService.addLesson({
        topic_id: activeTopic.id,
        type: lessonType,
        content: lessonContent,
        question_type: lessonType === 'question' ? questionType : undefined,
        options: (lessonType === 'question' && questionType === 'mcq') ? mcqOptionsRaw : undefined,
        correct_answer: lessonType === 'question' ? correctAnswer : undefined,
        explanation: lessonType === 'question' ? explanationText : undefined
      });
      setLessonContent(''); setCorrectAnswer(''); setMcqOptionsRaw(''); setExplanationText('');
      alert("Lesson added successfully!");
    } catch (err) { alert(err); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar: Grade selection */}
      <div className="lg:col-span-2 space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Grade</h3>
        {[1,2,3,4,5,6,7,8,9].map(g => (
          <button 
            key={g} 
            onClick={() => {setSelectedGrade(g as Grade); setActiveTopic(null);}}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold transition ${selectedGrade === g ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white hover:bg-slate-100'}`}
          >
            Grade {g}
          </button>
        ))}
      </div>

      {/* Center: Subjects and Topics */}
      <div className="lg:col-span-5 space-y-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center justify-between">
            Subjects List
            {isLoading && <div className="loader"></div>}
          </h2>
          <form onSubmit={handleAddSubject} className="space-y-3 mb-6">
            <input value={newSubName} onChange={e => setNewSubName(e.target.value)} placeholder="Subject Name" className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
            <div className="flex gap-2">
              <input value={newSubCode} onChange={e => setNewSubCode(e.target.value)} placeholder="Code (e.g. MATH)" className="flex-1 px-4 py-2 border rounded-xl outline-none" />
              <button type="submit" className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition">Add</button>
            </div>
          </form>
          <div className="flex flex-wrap gap-2">
            {subjects.map(s => (
              <div key={s.id} className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                <span className="font-bold text-slate-700">{s.name}</span>
                <button onClick={() => dataService.deleteSubject(s.id).then(refreshData)} className="text-rose-400 hover:text-rose-600">×</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Topics in Grade {selectedGrade}</h2>
          <form onSubmit={handleAddTopic} className="space-y-3 mb-8">
            <select value={newTopicSubjectId} onChange={e => setNewTopicSubjectId(e.target.value)} className="w-full px-4 py-2 border rounded-xl outline-none bg-white">
              <option value="">Select Subject...</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <div className="flex gap-2">
              <input value={newTopicTitle} onChange={e => setNewTopicTitle(e.target.value)} placeholder="Topic Title" className="flex-1 px-4 py-2 border rounded-xl outline-none" />
              <button type="submit" className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl">Add Topic</button>
            </div>
          </form>
          <div className="space-y-2">
            {topics.map(t => (
              <button 
                key={t.id} 
                onClick={() => setActiveTopic(t)}
                className={`w-full p-4 border rounded-2xl text-left transition flex justify-between items-center ${activeTopic?.id === t.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-slate-300'}`}
              >
                <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                     {subjects.find(s => s.id === t.subject_id)?.name || 'No Subject'}
                   </p>
                   <p className="font-bold text-slate-700">{t.title}</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Lesson Editor */}
      <div className="lg:col-span-5">
        {activeTopic ? (
          <div className="bg-white p-8 rounded-3xl border-2 border-emerald-500 shadow-2xl sticky top-24">
            <h2 className="text-2xl font-black text-slate-800 mb-6">Add Lesson to {activeTopic.title}</h2>
            <form onSubmit={handleAddLesson} className="space-y-6">
              <div className="flex gap-2">
                <button type="button" onClick={() => setLessonType('explanation')} className={`flex-1 py-2 rounded-xl font-bold border-2 transition ${lessonType === 'explanation' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-100'}`}>Explanation</button>
                <button type="button" onClick={() => setLessonType('question')} className={`flex-1 py-2 rounded-xl font-bold border-2 transition ${lessonType === 'question' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-100'}`}>Question</button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Lesson Content</label>
                <textarea value={lessonContent} onChange={e => setLessonContent(e.target.value)} rows={4} className="w-full px-4 py-3 border rounded-xl outline-none" placeholder="Enter instructional text or the question itself..." />
              </div>

              {lessonType === 'question' && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setQuestionType('input')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${questionType === 'input' ? 'bg-slate-800 text-white' : 'bg-white text-slate-500'}`}>Text Input</button>
                    <button type="button" onClick={() => setQuestionType('mcq')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${questionType === 'mcq' ? 'bg-slate-800 text-white' : 'bg-white text-slate-500'}`}>MCQ</button>
                  </div>
                  
                  {questionType === 'mcq' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Options (JSON Array)</label>
                      <input value={mcqOptionsRaw} onChange={e => setMcqOptionsRaw(e.target.value)} placeholder='["Answer A", "Answer B", "Answer C"]' className="w-full px-4 py-2 border rounded-xl outline-none font-mono text-sm" />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Correct Answer</label>
                      <input value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} className="w-full px-4 py-2 border rounded-xl outline-none" placeholder="Must match exactly" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Explanation (Post-Answer)</label>
                      <textarea value={explanationText} onChange={e => setExplanationText(e.target.value)} rows={2} className="w-full px-4 py-2 border rounded-xl outline-none" placeholder="Explain why the answer is correct..." />
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-emerald-600 transition shadow-xl">
                SAVE TO SUPABASE
              </button>
            </form>
          </div>
        ) : (
          <div className="h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <svg className="w-12 h-12 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            <p className="font-bold">Select a topic from the list to manage its lessons</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
