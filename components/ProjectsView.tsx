
import React, { useState, useEffect } from 'react';
import { Project, Grade } from '../types';
import { dataService } from '../services/dataService';
import { Icons } from '../constants';

const ProjectsView: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedGrade, setExpandedGrade] = useState<Grade | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const data = await dataService.getProjects();
        setProjects(data);
        if (data.length > 0) setExpandedGrade(data[0].grade);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const grades: Grade[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center">
        <div className="loader !w-10 !h-10"></div>
        <span className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Projects...</span>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 border-b-2 theme-border pb-4">
        <h2 className="text-3xl font-black theme-text-main">Student Projects</h2>
        <p className="text-slate-500 font-medium">Practical application of learning across all grades.</p>
      </div>

      <div className="space-y-4">
        {grades.map(grade => {
          const gradeProjects = projects.filter(p => p.grade === grade);
          const isExpanded = expandedGrade === grade;

          return (
            <div key={grade} className="theme-bg-surface border theme-border rounded-2xl overflow-hidden transition-all duration-300">
              <button 
                onClick={() => setExpandedGrade(isExpanded ? null : grade)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-500/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl theme-bg-surface border theme-border flex items-center justify-center font-black theme-text-primary">
                    {grade}
                  </div>
                  <span className="font-black text-lg theme-text-main">Grade {grade} Projects</span>
                </div>
                <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                  <Icons.ChevronRight />
                </div>
              </button>

              {isExpanded && (
                <div className="p-6 bg-slate-500/5 border-t theme-border animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gradeProjects.map(project => (
                      <div key={project.id} className="theme-bg-surface p-5 rounded-xl border theme-border shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="font-black text-lg theme-text-main mb-2">{project.title}</h4>
                        <p className="text-sm theme-text-main opacity-70 mb-4 leading-relaxed line-clamp-3">
                          {project.description}
                        </p>
                        {project.link && (
                          <a 
                            href={project.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-black theme-text-primary hover:opacity-80"
                          >
                            Explore Project
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    ))}
                    {gradeProjects.length === 0 && (
                      <div className="col-span-full py-8 text-center">
                        <p className="text-slate-400 italic font-bold">No projects uploaded for Grade {grade} yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectsView;
