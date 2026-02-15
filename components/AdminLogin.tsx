
import React, { useState } from 'react';
import { ShieldCheck, Lock, User } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Fetch custom credentials from localStorage, fallback to default if not set
    const savedCredsRaw = localStorage.getItem('edu_remind_admin_creds');
    const creds = savedCredsRaw ? JSON.parse(savedCredsRaw) : { username: 'admin', password: 'admin123' };

    if (username === creds.username && password === creds.password) {
      onLogin();
    } else {
      setError('Invalid credentials. Please check your username and password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900">
      <div className="w-full max-w-md bg-white rounded-[40px] p-12 shadow-2xl space-y-10 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-5 bg-indigo-500 rounded-3xl shadow-2xl shadow-indigo-500/40">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">EduRemind<span className="text-indigo-600">Pro</span></h1>
            <p className="text-slate-400 font-semibold text-sm">Control Panel Authentication</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold border border-rose-100 animate-shake">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Username" 
                className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-semibold"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="password" 
                placeholder="Password" 
                className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-semibold"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full py-6 bg-indigo-600 text-white rounded-3xl font-black text-lg hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/30 active:scale-[0.98]"
          >
            Enter Dashboard
          </button>
        </form>
        
        <div className="text-center">
          <p className="text-xs text-slate-300 font-bold uppercase tracking-widest">Enterprise Security v2.5</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
