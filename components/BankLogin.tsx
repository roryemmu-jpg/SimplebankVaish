import React, { useState } from 'react';

interface BankLoginProps {
  onLogin: (name: string, userId: string) => void;
}

export const BankLogin: React.FC<BankLoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && userId.trim()) {
      onLogin(name, userId);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl mb-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Simple Bank System</h1>
          <p className="text-slate-400 mt-2">Secure AI-Powered Banking</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder-slate-500"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Personal ID / SSN</label>
            <input
              type="text"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder-slate-500"
              placeholder="Enter your ID"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
          >
            Access Account
          </button>
        </form>
      </div>

      <div className="text-center text-slate-500 text-xs">
         <p className="mb-2 font-semibold text-slate-400">Developed By</p>
         <div className="flex gap-3 justify-center flex-wrap">
            <span>S Emmanuel</span>
            <span>•</span>
            <span>P Vaishnavi</span>
            <span>•</span>
            <span>Rishika Sagar</span>
            <span>•</span>
            <span>Syed Abrar</span>
         </div>
      </div>
    </div>
  );
};