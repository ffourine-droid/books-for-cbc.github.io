
import React, { useState, useEffect } from 'react';
import { Book } from '../types';
import { dataService } from '../services/dataService';
import { Icons } from '../constants';

interface BooksViewProps {
  type: 'ebook' | 'audiobook';
}

const BooksView: React.FC<BooksViewProps> = ({ type }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        const data = await dataService.getBooks(type);
        setBooks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooks();
  }, [type]);

  if (selectedBook && type === 'ebook') {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col">
        <div className="bg-slate-800 p-4 flex justify-between items-center text-white">
          <h2 className="font-bold truncate pr-4">{selectedBook.title}</h2>
          <button onClick={() => setSelectedBook(null)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-bold transition">
            Close Reader
          </button>
        </div>
        <div className="flex-1 bg-slate-700 overflow-hidden">
          <iframe 
            src={`${selectedBook.url}#toolbar=0&navpanes=0`}
            className="w-full h-full border-none"
            title={selectedBook.title}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 border-b-2 border-slate-200 pb-4">
        <h2 className="text-3xl font-black text-slate-800 capitalize">{type} Library</h2>
        <p className="text-slate-500 font-medium">Explore our collection of digital resources.</p>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center">
          <div className="loader !w-10 !h-10"></div>
          <span className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Library...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {books.map(book => (
            <div 
              key={book.id} 
              onClick={() => setSelectedBook(book)}
              className="group cursor-pointer"
            >
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-200 shadow-md group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300 relative">
                {book.cover_url ? (
                  <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-200">
                    {type === 'ebook' ? <Icons.Book /> : <Icons.Audio />}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <span className="px-4 py-2 bg-white text-slate-900 rounded-full font-bold text-xs uppercase tracking-widest">
                    {type === 'ebook' ? 'Read Now' : 'Listen Now'}
                   </span>
                </div>
              </div>
              <h3 className="mt-3 font-black text-slate-800 text-sm line-clamp-2 leading-tight">{book.title}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{book.author || 'Unknown Author'}</p>
              
              {type === 'audiobook' && selectedBook?.id === book.id && (
                <div className="mt-4 p-2 bg-indigo-50 rounded-lg animate-in slide-in-from-top-2 duration-300">
                  <audio controls src={book.url} className="w-full h-8" autoPlay />
                </div>
              )}
            </div>
          ))}
          {books.length === 0 && (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold italic">No {type}s found in the collection.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BooksView;
