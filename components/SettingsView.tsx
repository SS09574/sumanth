
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Database, Zap, Smartphone, Globe, CheckCircle, Lock, User as UserIcon } from 'lucide-react';
import { ApiConfig, AdminCredentials } from '../types';

const SettingsView: React.FC = () => {
  const [config, setConfig] = useState<ApiConfig>({
    phoneId: '',
    accessToken: '',
    isProduction: false,
    useFallback: true
  });
  
  const [creds, setCreds] = useState<AdminCredentials>({
    username: 'admin',
    password: ''
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isCredsSaved, setIsCredsSaved] = useState(false);

  useEffect(() => {
    const savedConfig = localStorage.getItem('edu_remind_api_config');
    if (savedConfig) setConfig(JSON.parse(savedConfig));

    const savedCreds = localStorage.getItem('edu_remind_admin_creds');
    if (savedCreds) {
      const parsed = JSON.parse(savedCreds);
      setCreds({ ...parsed, password: '' }); // Don't display password, just let them set a new one
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('edu_remind_api_config', JSON.stringify(config));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const saveCredentials = () => {
    if (!creds.username || !creds.password) {
      alert("Username and Password cannot be empty.");
      return;
    }
    localStorage.setItem('edu_remind_admin_creds', JSON.stringify(creds));
    setIsCredsSaved(true);
    setCreds(prev => ({ ...prev, password: '' })); // Clear password field after saving
    setTimeout(() => setIsCredsSaved(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Meta Cloud API Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
               <ShieldCheck className="w-6 h-6" />
             </div>
             <h3 className="text-lg font-bold text-slate-800">Meta Cloud API Setup</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phone Number ID</label>
              <input 
                type="text" 
                placeholder="e.g. 109312948123" 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm" 
                value={config.phoneId}
                onChange={e => setConfig({...config, phoneId: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Permanent Access Token</label>
              <input 
                type="password" 
                placeholder="EAABw..." 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm" 
                value={config.accessToken}
                onChange={e => setConfig({...config, accessToken: e.target.value})}
              />
            </div>
            <div className="pt-2">
              <button 
                onClick={saveSettings}
                className={`w-full py-4 rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center gap-2 ${
                    isSaved ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'
                }`}
              >
                {isSaved ? <CheckCircle className="w-5 h-5" /> : null}
                {isSaved ? 'API Config Saved' : 'Save API Settings'}
              </button>
            </div>
          </div>
        </div>

        {/* Security / Admin Login Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
               <Lock className="w-6 h-6" />
             </div>
             <h3 className="text-lg font-bold text-slate-800">Security & Access Control</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admin Username</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="admin" 
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 font-bold text-sm" 
                  value={creds.username}
                  onChange={e => setCreds({...creds, username: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">New Admin Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password" 
                  placeholder="Leave blank to keep current" 
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 font-mono text-sm" 
                  value={creds.password}
                  onChange={e => setCreds({...creds, password: e.target.value})}
                />
              </div>
            </div>
            <div className="pt-2">
              <button 
                onClick={saveCredentials}
                className={`w-full py-4 rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center gap-2 ${
                    isCredsSaved ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200'
                }`}
              >
                {isCredsSaved ? <CheckCircle className="w-5 h-5" /> : null}
                {isCredsSaved ? 'Credentials Updated' : 'Update Admin Access'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 md:col-span-2">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
               <Zap className="w-6 h-6" />
             </div>
             <h3 className="text-lg font-bold text-slate-800">Operational Policy</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <ConfigToggle 
                icon={<Globe className="w-4 h-4" />} 
                title="Production Protocol" 
                description="Route broadcasts via Meta Graph API." 
                checked={config.isProduction}
                onChange={(val: boolean) => setConfig({...config, isProduction: val})}
            />
            <ConfigToggle 
                icon={<Smartphone className="w-4 h-4" />} 
                title="Manual Deep Link Fallback" 
                description="Allow 'wa.me' links if API is disconnected." 
                checked={config.useFallback}
                onChange={(val: boolean) => setConfig({...config, useFallback: val})}
            />
            <ConfigToggle 
                icon={<Database className="w-4 h-4" />} 
                title="Data Privacy Compliance" 
                description="Auto-anonymize logs after delivery." 
            />
          </div>
        </div>
      </div>

      <div className="bg-amber-50 p-8 rounded-3xl border border-amber-100 flex items-start gap-4">
         <div className="p-3 bg-amber-200 rounded-2xl text-amber-700">
            <Smartphone className="w-6 h-6" />
         </div>
         <div>
            <h5 className="font-bold text-amber-800">Meta API & Custom Access</h5>
            <p className="text-sm text-amber-700 mt-1 leading-relaxed max-w-4xl">
                Manage your administrative credentials and API keys in this section. The **Security** card allows you to change the password used to access this dashboard.
                The **Meta Cloud API** settings are required for automated message delivery.
            </p>
         </div>
      </div>
    </div>
  );
};

const ConfigToggle: React.FC<any> = ({ icon, title, description, checked, onChange }) => (
  <div className="flex items-center justify-between group">
    <div className="flex items-center gap-4">
      <div className="p-2.5 bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600 rounded-xl transition-all">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800">{title}</p>
        <p className="text-[11px] text-slate-500">{description}</p>
      </div>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={e => onChange?.(e.target.checked)} />
      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
    </label>
  </div>
);

export default SettingsView;
