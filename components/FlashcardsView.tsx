
import React, { useState, useEffect } from 'react';
import { Grade, Topic, Subject } from '../types';
import { dataService } from '../services/dataService';
import { Icons } from '../constants';

const FlashcardsView: React.FC = () => {
  const [grade, setGrade] = useState<Grade>(1);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [cards, setCards] = useState<{ front: string; back: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const fetchTopics = async () => {
      const data = await dataService.getTopicsByGrade(grade);
      setTopics(data);
    };
    fetchTopics();
  }, [grade]);

  const handleTopicSelect = async (topic: Topic) => {
    setSelectedTopic(topic);
    const lessons = await dataService.getLessonsByTopic(topic.id);
    // Transform questions into cards
    const newCards = lessons
      .filter(l => l.type === 'question')
      .map(l => ({
        front: l.content,
        back: l.correct_answer || 'Check your lesson content for details.'
      }));
    setCards(newCards);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (!selectedTopic) {
    return (
      <div className="animate-in fade-in duration-500">
        <h2 className="text-3xl font-black theme-text-main mb-6">Study Cards</h2>
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {[1,2,3,4,5,6,7,8,9].map(g => (
            <button 
              key={g} 
              onClick={() => setGrade(g as Grade)}
              className={`px-4 py-2 rounded-full font-bold text-xs sm:text-sm transition whitespace-nowrap ${grade === g ? 'bg-indigo-600 text-white shadow-md' : 'theme-bg-surface theme-border border theme-text-main'}`}
              style={grade === g ? { backgroundColor: 'var(--primary)' } : {}}
            >
              Grade {g}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {topics.map(t => (
            <button 
              key={t.id} 
              onClick={() => handleTopicSelect(t)}
              className="p-5 sm:p-6 text-left theme-bg-surface border theme-border rounded-2xl hover:shadow-lg transition-all active:scale-95"
            >
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Select Topic</p>
              <h4 className="font-black theme-text-main text-base sm:text-lg leading-tight">{t.title}</h4>
            </button>
          ))}
          {topics.length === 0 && <p className="col-span-2 text-center py-10 text-slate-400 italic text-sm">No topics found for Grade {grade}.</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in zoom-in-95 duration-300">
      <button onClick={() => setSelectedTopic(null)} className="flex items-center gap-2 mb-6 text-xs sm:text-sm font-black theme-text-primary hover:opacity-70">
        <Icons.Back /> Back to Topics
      </button>

      <div className="max-w-md mx-auto">
        <div className="mb-4 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase">
          <span>Card {currentIndex + 1} of {cards.length}</span>
          <span>{Math.round(((currentIndex + 1) / cards.length) * 100)}%</span>
        </div>

        {cards.length > 0 ? (
          <>
            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              className="relative h-64 sm:h-80 w-full perspective-1000 cursor-pointer group"
            >
              <div className={`relative h-full w-full transition-transform duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* Front */}
                <div className="absolute inset-0 backface-hidden theme-bg-surface border-4 theme-border rounded-3xl p-6 sm:p-10 flex flex-col items-center justify-center text-center shadow-xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Question</p>
                  <p className="text-lg sm:text-2xl font-black theme-text-main leading-tight">{cards[currentIndex].front}</p>
                  <p className="absolute bottom-6 text-[9px] font-bold text-indigo-500 uppercase">Reveal Answer</p>
                </div>
                {/* Back */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-indigo-600 text-white rounded-3xl p-6 sm:p-10 flex flex-col items-center justify-center text-center shadow-xl" style={{ backgroundColor: 'var(--primary)' }}>
                  <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-4 text-white">Answer</p>
                  <p className="text-lg sm:text-2xl font-black leading-tight text-white">{cards[currentIndex].back}</p>
                  <p className="absolute bottom-6 text-[9px] font-bold opacity-60 uppercase text-white">Click to Hide</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button 
                disabled={currentIndex === 0}
                onClick={() => { setCurrentIndex(i => i - 1); setIsFlipped(false); }}
                className="flex-1 py-4 theme-bg-surface border theme-border rounded-xl font-black theme-text-main hover:bg-slate-50 disabled:opacity-30 transition text-xs uppercase"
              >
                Previous
              </button>
              <button 
                disabled={currentIndex === cards.length - 1}
                onClick={() => { setCurrentIndex(i => i + 1); setIsFlipped(false); }}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-black hover:opacity-90 disabled:opacity-30 shadow-lg transition text-xs uppercase"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                Next Card
              </button>
            </div>
          </>
        ) : (
          <div className="py-20 text-center theme-bg-surface border-2 border-dashed theme-border rounded-3xl">
            <p className="text-slate-400 font-bold italic text-sm">No cards available.</p>
          </div>
        )}
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default FlashcardsView;
