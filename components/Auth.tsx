
import React, { useState } from 'react';
import { dataService } from '../services/dataService';
import { Profile } from '../types';

interface AuthProps {
  onAuthSuccess: (profile: Profile) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      let profile: Profile;
      if (isLogin) {
        profile = await dataService.login(username, password);
      } else {
        profile = await dataService.register(username, password, role);
      }
      onAuthSuccess(profile);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4efe6] flex items-center justify-center p-0 sm:p-4 transition-colors">
      <div className="w-full max-w-xl min-h-screen sm:min-h-0 bg-white sm:rounded-[2.5rem] shadow-2xl overflow-hidden border-none sm:border sm:border-slate-200">
        <div className="bg-slate-900 p-8 sm:p-10 text-white text-center">
          <h1 className="text-3xl sm:text-4xl font-black mb-2">CBC Portal</h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs">
            {isLogin ? "Welcome Back to Learning" : "Join the educational journey"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-12 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-lg animate-in shake duration-300">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600 bg-slate-50 transition-all font-bold"
                placeholder="Choose a unique username"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600 bg-slate-50 transition-all font-bold"
                placeholder="••••••••"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="animate-in slide-in-from-bottom-4 duration-300">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">I am a...</label>
              <div className="grid grid-cols-1 xs:grid-cols-3 gap-3">
                {[
                  { id: 'student', label: 'Student', icon: '🎓' },
                  { id: 'teacher', label: 'Teacher', icon: '👨‍🏫' },
                  { id: 'admin', label: 'Admin', icon: '⚙️' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id as any)}
                    className={`flex flex-row xs:flex-col items-center justify-center gap-3 xs:gap-2 p-4 rounded-2xl font-black text-xs transition-all border-2 ${role === item.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md ring-2 ring-indigo-100' : 'border-slate-100 bg-slate-50 text-slate-400 opacity-60 hover:opacity-100'}`}
                  >
                    <span className="text-xl sm:text-2xl">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-50 active:scale-95 shadow-xl hover:shadow-indigo-200 uppercase tracking-widest text-sm"
          >
            {isLoading ? "Checking Records..." : (isLogin ? "LOG IN" : "CREATE ACCOUNT")}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-xs sm:text-sm font-black text-slate-400 hover:text-indigo-600 transition-colors"
            >
              {isLogin ? "New here? Create a free account" : "Already have an account? Sign in here"}
            </button>
          </div>
        </form>

        <div className="bg-slate-50 p-6 border-t border-slate-100 text-center opacity-60">
          <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-widest">Safe & Secure CBC Learning Environment</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
