
import React, { useState, useEffect } from 'react';
import { ThemeConfig } from '../types';

interface ThemeSettingsProps {
  currentTheme: ThemeConfig;
  onThemeChange: (theme: ThemeConfig) => void;
}

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ currentTheme, onThemeChange }) => {
  const [localTheme, setLocalTheme] = useState<ThemeConfig>(currentTheme);

  const presets = [
    { name: 'Indigo Dream', primary: '#4f46e5', secondary: '#6366f1', accent: '#10b981' },
    { name: 'Sunset Orange', primary: '#f97316', secondary: '#fb923c', accent: '#3b82f6' },
    { name: 'Forest Green', primary: '#059669', secondary: '#10b981', accent: '#f59e0b' },
    { name: 'Midnight Berry', primary: '#7c3aed', secondary: '#a855f7', accent: '#ec4899' },
  ];

  const updateField = (field: keyof ThemeConfig, value: string) => {
    const next = { ...localTheme, [field]: value };
    setLocalTheme(next);
    onThemeChange(next);
  };

  const applyPreset = (preset: typeof presets[0]) => {
    const next = { ...localTheme, ...preset };
    setLocalTheme(next);
    onThemeChange(next);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b-2 border-slate-200 pb-4">
        <h2 className="text-3xl font-black theme-text-main">App Theme</h2>
        <p className="text-slate-500 font-medium">Personalize your learning environment.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mode Selection */}
        <section className="space-y-4">
          <h3 className="text-lg font-black uppercase tracking-widest text-slate-400 text-xs">Display Mode</h3>
          <div className="flex gap-4">
            <button 
              onClick={() => updateField('mode', 'light')}
              className={`flex-1 p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${localTheme.mode === 'light' ? 'border-indigo-600 bg-white shadow-lg ring-2 ring-indigo-100' : 'bg-slate-100 border-transparent text-slate-400'}`}
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
              <span className="font-black text-sm uppercase">Light</span>
            </button>
            <button 
              onClick={() => updateField('mode', 'dark')}
              className={`flex-1 p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${localTheme.mode === 'dark' ? 'border-indigo-600 bg-slate-800 text-white shadow-lg ring-2 ring-indigo-900/50' : 'bg-slate-100 border-transparent text-slate-400'}`}
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              <span className="font-black text-sm uppercase">Dark</span>
            </button>
          </div>
        </section>

        {/* Color Selection */}
        <section className="space-y-4">
          <h3 className="text-lg font-black uppercase tracking-widest text-slate-400 text-xs">Custom Colors</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="font-black text-slate-800 text-sm">Primary Color</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Buttons & Headers</p>
              </div>
              <input 
                type="color" 
                value={localTheme.primary} 
                onChange={(e) => updateField('primary', e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer border-none p-0 overflow-hidden"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="font-black text-slate-800 text-sm">Secondary Color</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Cards & Icons</p>
              </div>
              <input 
                type="color" 
                value={localTheme.secondary} 
                onChange={(e) => updateField('secondary', e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer border-none p-0 overflow-hidden"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="font-black text-slate-800 text-sm">Accent Color</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Feedback & Success</p>
              </div>
              <input 
                type="color" 
                value={localTheme.accent} 
                onChange={(e) => updateField('accent', e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer border-none p-0 overflow-hidden"
              />
            </div>
          </div>
        </section>

        {/* Presets */}
        <section className="md:col-span-2 space-y-4">
          <h3 className="text-lg font-black uppercase tracking-widest text-slate-400 text-xs">Color Presets</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {presets.map((p, idx) => (
              <button 
                key={idx}
                onClick={() => applyPreset(p)}
                className="p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-500 transition-all flex flex-col items-center gap-3 active:scale-95 bg-white"
              >
                <div className="flex gap-1">
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: p.primary }}></div>
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: p.secondary }}></div>
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: p.accent }}></div>
                </div>
                <span className="font-bold text-xs text-slate-600">{p.name}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ThemeSettings;
