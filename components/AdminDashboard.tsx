
import React, { useState, useEffect } from 'react';
import { Grade, Topic, Lesson, Subject, QuestionType, Book, Project, Profile } from '../types';
import { dataService } from '../services/dataService';

interface AdminDashboardProps {
  user: Profile;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Project Form State
  const [projGrade, setProjGrade] = useState<Grade>(1);
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projLink, setProjLink] = useState('');
  const [selectedProjToDelete, setSelectedProjToDelete] = useState('');

  // Book Form State
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookType, setBookType] = useState<'ebook' | 'audiobook'>('ebook');
  const [bookUrl, setBookUrl] = useState('');
  const [bookCoverUrl, setBookCoverUrl] = useState('');
  const [selectedBookToDelete, setSelectedBookToDelete] = useState('');

  // States for forms
  const [newSubName, setNewSubName] = useState('');
  const [selectedSubId, setSelectedSubId] = useState('');
  
  const [topicGrade, setTopicGrade] = useState<Grade>(1);
  const [topicSubjectId, setTopicSubjectId] = useState('');
  const [topicTitle, setTopicTitle] = useState('');
  const [topicOrder, setTopicOrder] = useState(0);
  const [selectedTopicIdToDelete, setSelectedTopicIdToDelete] = useState('');
  
  const [lessonTopicId, setLessonTopicId] = useState('');
  const [lessonType, setLessonType] = useState<'explanation' | 'question'>('explanation');
  const [lessonContent, setLessonContent] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('input');
  const [mcqOptionsRaw, setMcqOptionsRaw] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [selectedLessonIdToDelete, setSelectedLessonIdToDelete] = useState('');

  const [feedback, setFeedback] = useState<Record<string, { type: 'success' | 'error', msg: string }>>({});

  const refreshData = async () => {
    try {
      const subs = await dataService.getAllSubjects();
      setSubjects(subs);
      const allTopics = await Promise.all(
        [1,2,3,4,5,6,7,8,9].map(g => dataService.getTopicsByGrade(g as Grade))
      );
      const flattenedTopics = allTopics.flat();
      setTopics(flattenedTopics);
      const allBooks = await dataService.getBooks();
      setBooks(allBooks);
      const allProjs = await dataService.getProjects();
      setProjects(allProjs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { refreshData(); }, []);

  useEffect(() => {
    if (lessonTopicId) {
      dataService.getLessonsByTopic(lessonTopicId).then(setLessons);
    } else {
      setLessons([]);
    }
  }, [lessonTopicId]);

  const showFeedback = (key: string, type: 'success' | 'error', msg: string) => {
    setFeedback(prev => ({ ...prev, [key]: { type, msg } }));
    setTimeout(() => {
      setFeedback(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }, 4000);
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle || !projDesc) return;
    try {
      await dataService.addProject({
        grade: projGrade,
        title: projTitle,
        description: projDesc,
        link: projLink
      }, user.id);
      setProjTitle(''); setProjDesc(''); setProjLink('');
      showFeedback('project', 'success', 'Project added!');
      refreshData();
    } catch (err: any) {
      showFeedback('project', 'error', err.message);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProjToDelete) return;
    try {
      await dataService.deleteProject(selectedProjToDelete);
      showFeedback('project', 'success', 'Project removed.');
      refreshData();
    } catch (err: any) {
      showFeedback('project', 'error', err.message);
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle || !bookUrl) return;
    try {
      await dataService.addBook({
        title: bookTitle,
        author: bookAuthor,
        type: bookType,
        url: bookUrl,
        cover_url: bookCoverUrl
      }, user.id);
      setBookTitle(''); setBookAuthor(''); setBookUrl(''); setBookCoverUrl('');
      showFeedback('book', 'success', 'Book added to library!');
      refreshData();
    } catch (err: any) {
      showFeedback('book', 'error', err.message);
    }
  };

  const handleDeleteBook = async () => {
    if (!selectedBookToDelete) return;
    try {
      await dataService.deleteBook(selectedBookToDelete);
      showFeedback('book', 'success', 'Book removed.');
      refreshData();
    } catch (err: any) {
      showFeedback('book', 'error', err.message);
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName) return;
    try {
      await dataService.addSubject(newSubName);
      setNewSubName('');
      showFeedback('subject', 'success', 'Subject added successfully!');
      refreshData();
    } catch (err: any) {
      showFeedback('subject', 'error', err.message);
    }
  };

  const handleDeleteSubject = async () => {
    if (!selectedSubId) return;
    if (!confirm("Delete this subject and ALL content?")) return;
    try {
      await dataService.deleteSubject(selectedSubId);
      showFeedback('subject', 'success', 'Subject deleted.');
      refreshData();
    } catch (err: any) {
      showFeedback('subject', 'error', err.message);
    }
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicSubjectId || !topicTitle) return;
    try {
      await dataService.addTopic({
        subject_id: topicSubjectId,
        grade: topicGrade,
        title: topicTitle,
        order_number: topicOrder
      }, user.id);
      setTopicTitle('');
      showFeedback('topic', 'success', 'Topic added successfully!');
      refreshData();
    } catch (err: any) {
      showFeedback('topic', 'error', err.message);
    }
  };

  const handleDeleteTopic = async () => {
    if (!selectedTopicIdToDelete) return;
    if (!confirm("Delete topic and all its lessons?")) return;
    try {
      await dataService.deleteTopic(selectedTopicIdToDelete);
      showFeedback('topic', 'success', 'Topic deleted.');
      refreshData();
    } catch (err: any) {
      showFeedback('topic', 'error', err.message);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTopicId || !lessonContent) return;

    try {
      await dataService.addLesson({
        topic_id: lessonTopicId,
        type: lessonType,
        content: lessonContent,
        question_type: lessonType === 'question' ? questionType : undefined,
        correct_answer: lessonType === 'question' ? correctAnswer : undefined,
        explanation: lessonType === 'question' ? explanation : undefined
      }, user.id);
      
      setLessonContent(''); setCorrectAnswer(''); setExplanation('');
      showFeedback('lesson', 'success', 'Lesson saved!');
      
      const updatedLessons = await dataService.getLessonsByTopic(lessonTopicId);
      setLessons(updatedLessons);
    } catch (err: any) {
      showFeedback('lesson', 'error', err.message || 'Failed to save lesson.');
    }
  };

  const handleDeleteLesson = async () => {
    if (!selectedLessonIdToDelete) return;
    if (!confirm("Delete this lesson?")) return;
    try {
      await dataService.deleteLesson(selectedLessonIdToDelete);
      showFeedback('lesson', 'success', 'Lesson removed.');
      const updatedLessons = await dataService.getLessonsByTopic(lessonTopicId);
      setLessons(updatedLessons);
      setSelectedLessonIdToDelete('');
    } catch (err: any) {
      showFeedback('lesson', 'error', err.message);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-12">
      <div className="flex justify-between items-center border-b-2 border-slate-200 pb-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black">Admin Control</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Global System Control: {user.username}</p>
        </div>
        <button onClick={refreshData} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-bold uppercase">Refresh Global Data</button>
      </div>

      {/* Project Management Section */}
      <section className="bg-slate-50 p-4 sm:p-6 rounded-xl border border-slate-200">
        <h3 className="text-lg sm:text-xl font-black mb-4 border-b border-slate-200 pb-2">📂 Manage Student Projects</h3>
        <form onSubmit={handleAddProject} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Grade</label>
              <select value={projGrade} onChange={e => setProjGrade(parseInt(e.target.value) as Grade)} className="w-full p-3 border rounded-lg">
                {[1,2,3,4,5,6,7,8,9].map(g => <option key={g} value={g}>Grade {g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Project Title</label>
              <input type="text" value={projTitle} onChange={e => setProjTitle(e.target.value)} className="w-full p-3 border rounded-lg" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
              <textarea value={projDesc} onChange={e => setProjDesc(e.target.value)} rows={3} className="w-full p-3 border rounded-lg" required />
            </div>
          </div>
          <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold">Upload Project</button>
          
          <div className="pt-4 mt-4 border-t">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Existing Projects (Filter to Delete)</label>
            <div className="flex gap-2">
              <select value={selectedProjToDelete} onChange={e => setSelectedProjToDelete(e.target.value)} className="flex-1 p-3 border rounded-lg">
                <option value="">Select project to remove...</option>
                {projects.map(p => <option key={p.id} value={p.id}>[G{p.grade}] {p.title} - By ID: {p.created_by?.slice(0, 8)}</option>)}
              </select>
              <button type="button" onClick={handleDeleteProject} className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold">Delete</button>
            </div>
          </div>
          {feedback.project && <p className="text-green-600 font-bold">{feedback.project.msg}</p>}
        </form>
      </section>

      {/* Manual Topics Section */}
      <section className="bg-slate-50 p-4 sm:p-6 rounded-xl border border-slate-200">
        <h3 className="text-lg sm:text-xl font-black mb-4 border-b border-slate-200 pb-2">📚 Global Topics Control</h3>
        <form onSubmit={handleAddTopic} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject</label>
              <select value={topicSubjectId} onChange={e => setTopicSubjectId(e.target.value)} className="w-full p-3 border rounded-lg bg-white">
                <option value="">Select Subject...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Grade</label>
              <select value={topicGrade} onChange={e => setTopicGrade(parseInt(e.target.value) as Grade)} className="w-full p-3 border rounded-lg bg-white">
                {[1,2,3,4,5,6,7,8,9].map(g => <option key={g} value={g}>Grade {g}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Topic Title</label>
            <input type="text" value={topicTitle} onChange={e => setTopicTitle(e.target.value)} placeholder="e.g. Fractions" className="w-full p-3 border rounded-lg bg-white" />
          </div>
          <button type="submit" className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg font-bold">Add Topic</button>

          <div className="pt-4 mt-4 border-t border-slate-200">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Delete Global Topic</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <select value={selectedTopicIdToDelete} onChange={e => setSelectedTopicIdToDelete(e.target.value)} className="flex-1 p-3 border rounded-lg bg-white">
                <option value="">Select Topic to remove...</option>
                {topics.map(t => (
                  <option key={t.id} value={t.id}>[G{t.grade}] {t.title} - (By {t.created_by?.slice(0, 8)})</option>
                ))}
              </select>
              <button type="button" onClick={handleDeleteTopic} className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold">Delete</button>
            </div>
          </div>
          {feedback.topic && <p className="text-green-600 font-bold">{feedback.topic.msg}</p>}
        </form>
      </section>
    </div>
  );
};

export default AdminDashboard;
