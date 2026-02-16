
import React from 'react';
import { Grade } from '../types';

interface GradeSelectionProps {
  onSelect: (grade: Grade) => void;
}

const GradeSelection: React.FC<GradeSelectionProps> = ({ onSelect }) => {
  const grades: Grade[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Welcome to Your Math Journey</h2>
        <p className="text-slate-600">Choose your grade level to start exploring interactive lessons and AI-powered tutoring.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {grades.map((grade) => (
          <button
            key={grade}
            onClick={() => onSelect(grade)}
            className="group relative overflow-hidden bg-white rounded-2xl border-2 border-slate-100 p-8 text-center transition-all hover:border-indigo-500 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-6xl font-black">{grade}</span>
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 math-gradient rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl shadow-lg">
                G{grade}
              </div>
              <h3 className="text-xl font-bold text-slate-800">Grade {grade}</h3>
              <p className="text-sm text-slate-500 mt-2">Explore {grade > 6 ? 'Advanced' : 'Core'} Math</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GradeSelection;
