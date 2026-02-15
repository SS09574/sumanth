
import React, { useState } from 'react';
import { Bell, Send, Clock, CheckCircle2, Loader2, Sparkles, Smartphone, ShieldCheck, X, Users, MessageCircle } from 'lucide-react';
import { Reminder, Job, Student, ReminderType, MessageLog } from '../types';
import { generateWhatsAppTemplateParams } from '../services/geminiService';

interface ReminderManagerProps {
  reminders: Reminder[];
  setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>;
  jobs: Job[];
  students: Student[];
  setLogs: React.Dispatch<React.SetStateAction<MessageLog[]>>;
}

const templates = [
  { id: 'job_alert_v1', name: 'New Opportunity Alert', body: 'Hi {{1}}, Exciting news! 🚀 A new role: {{2}} at {{3}} has just been posted. Deadline: {{4}}. Apply now: {{5}}' },
  { id: 'deadline_alert_v2', name: 'Deadline Reminder', body: 'Attention {{1}}! ⏰ Only 24 hours left to apply for {{2}} at {{3}}. Don\'t miss out: {{4}}' },
  { id: 'interview_update_v1', name: 'Interview Update', body: 'Hello {{1}}, an update on your {{2}} interview at {{3}}. Please check your portal for time slots: {{4}}. Good luck! {{5}}' }
];

const ReminderManager: React.FC<ReminderManagerProps> = ({ reminders, setReminders, jobs, students, setLogs }) => {
  const [isScheduling, setIsScheduling] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  
  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({
    jobId: '',
    type: ReminderType.NEW_JOB,
    templateId: templates[0].id,
    scheduledAt: new Date().toISOString().slice(0, 16),
    targetGroup: students.filter(s => s.isValidPhone && s.hasOptedIn).map(s => s.id),
  });

  const [generatedValues, setGeneratedValues] = useState<string[]>([]);

  const handleGenerateTemplateValues = async () => {
    if (!newReminder.jobId) return alert("Select a job first!");
    setIsGenerating(true);
    const job = jobs.find(j => j.id === newReminder.jobId)!;
    
    try {
        const params = await generateWhatsAppTemplateParams(job, students[0], newReminder.type as ReminderType);
        setGeneratedValues(params);
        setActiveStep(2);
    } catch (e) {
        console.error(e);
        setGeneratedValues(["[Student Name]", job.title, job.company, job.deadline, job.link]);
        setActiveStep(2);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSchedule = async () => {
    const reminderId = `rem-${Date.now()}`;
    const finalizedReminder: Reminder = {
      ...newReminder as Reminder,
      id: reminderId,
      status: 'SENT',
    };

    setReminders([finalizedReminder, ...reminders]);

    const template = templates.find(t => t.id === newReminder.templateId)!;
    
    const newLogs: MessageLog[] = students
      .filter(s => newReminder.targetGroup?.includes(s.id))
      .map(s => {
        let content = template.body;
        // Keep name dynamic per student, rest are from job data
        const vals = [s.name, generatedValues[1], generatedValues[2], generatedValues[3], generatedValues[4]];
        vals.forEach((val, i) => content = content.replace(`{{${i+1}}}`, val));

        return {
          id: `log-${Date.now()}-${s.id}`,
          reminderId,
          studentId: s.id,
          studentName: s.name,
          phone: s.phone,
          content: content,
          templateParams: vals,
          status: 'QUEUED',
          sentAt: new Date().toISOString()
        };
      });

    setLogs(prev => [...prev, ...newLogs]);
    setIsScheduling(false);
    setActiveStep(1);
    alert("Campaign Queued! Go to 'Delivery Logs' to execute the broadcast.");
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">WhatsApp Campaigns</h3>
          <p className="text-sm text-slate-500 font-medium">Schedule professional, compliant student alerts.</p>
        </div>
        {!isScheduling && (
          <button 
            onClick={() => setIsScheduling(true)}
            className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20"
          >
            <Bell className="w-4 h-4" />
            Launch Broadcast
          </button>
        )}
      </div>

      {isScheduling ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
           <div className="bg-slate-900 px-8 py-6 flex items-center justify-between">
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center text-white font-bold">
                 {activeStep}
               </div>
               <div>
                 <h4 className="text-white font-bold text-lg">Campaign Creator</h4>
                 <p className="text-slate-400 text-xs font-medium">Step {activeStep} of 3</p>
               </div>
             </div>
             <button onClick={() => setIsScheduling(false)} className="p-2 text-slate-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
           </div>

           <div className="p-10 space-y-10">
             {activeStep === 1 && (
               <div className="space-y-8 animate-in fade-in">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Job Opportunity</label>
                     <select 
                       className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800"
                       value={newReminder.jobId}
                       onChange={e => setNewReminder({...newReminder, jobId: e.target.value})}
                     >
                       <option value="">Select a job...</option>
                       {jobs.map(j => <option key={j.id} value={j.id}>{j.title} @ {j.company}</option>)}
                     </select>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">WhatsApp Template</label>
                     <select 
                       className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800"
                       value={newReminder.templateId}
                       onChange={e => setNewReminder({...newReminder, templateId: e.target.value})}
                     >
                       {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                     </select>
                   </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                      Target Audience (Valid & Opted-In Only)
                      <span className="text-indigo-600 font-bold">{newReminder.targetGroup?.length} Selected</span>
                    </label>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-h-52 overflow-y-auto space-y-1 custom-scrollbar">
                      {students.filter(s => s.isValidPhone && s.hasOptedIn).map(s => (
                        <label key={s.id} className="flex items-center gap-4 p-3 hover:bg-white rounded-xl cursor-pointer transition-all border border-transparent hover:border-slate-100 group">
                          <input 
                            type="checkbox" 
                            checked={newReminder.targetGroup?.includes(s.id)} 
                            onChange={() => {
                              const current = newReminder.targetGroup || [];
                              setNewReminder({
                                ...newReminder,
                                targetGroup: current.includes(s.id) ? current.filter(id => id !== s.id) : [...current, s.id]
                              });
                            }}
                            className="w-5 h-5 rounded-lg text-indigo-600 focus:ring-indigo-500 border-slate-300" 
                          />
                          <div className="flex-1 flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-700">{s.name}</span>
                            <span className="text-xs font-mono text-slate-400 group-hover:text-slate-600">+{s.phone}</span>
                          </div>
                        </label>
                      ))}
                      {students.filter(s => s.isValidPhone && s.hasOptedIn).length === 0 && (
                          <div className="p-4 text-center text-slate-400 text-sm italic">No students are currently "API Ready". Please verify phone numbers and opt-in status.</div>
                      )}
                    </div>
                 </div>

                 <button 
                   onClick={handleGenerateTemplateValues}
                   disabled={!newReminder.jobId || isGenerating || !newReminder.targetGroup?.length}
                   className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-2xl"
                 >
                   {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-indigo-400" />}
                   Map Template Parameters (AI)
                 </button>
               </div>
             )}

             {activeStep === 2 && (
               <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                 <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200 relative">
                    <div className="absolute top-4 right-4 flex items-center gap-2 text-[10px] font-black uppercase text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                        <ShieldCheck className="w-3 h-3" /> Parameter Mapping Success
                    </div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Compliance Preview</label>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm font-mono text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {(() => {
                        const t = templates.find(t => t.id === newReminder.templateId);
                        let b = t?.body || '';
                        generatedValues.forEach((v, i) => b = b.replace(`{{${i+1}}}`, `[${v}]`));
                        return b;
                      })()}
                    </div>
                    <div className="mt-6 p-4 bg-indigo-50 rounded-xl flex items-start gap-3">
                        <MessageCircle className="w-5 h-5 text-indigo-500 mt-0.5" />
                        <p className="text-[11px] text-indigo-700 font-medium leading-relaxed">
                            This preview uses AI-mapped values from your Job Catalog. The final message for each student will swap <b>[Student Name]</b> with their actual name.
                        </p>
                    </div>
                 </div>

                 <div className="flex gap-4">
                   <button onClick={() => setActiveStep(1)} className="flex-1 py-4 border-2 border-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-50">Adjust Job</button>
                   <button onClick={() => setActiveStep(3)} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20">Set Dispatch Time</button>
                 </div>
               </div>
             )}

             {activeStep === 3 && (
               <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                 <div className="space-y-8">
                   <div className="space-y-3">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Execution Window</label>
                     <input 
                       type="datetime-local"
                       className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800"
                       value={newReminder.scheduledAt}
                       onChange={e => setNewReminder({...newReminder, scheduledAt: e.target.value})}
                     />
                   </div>

                   <div className="bg-indigo-600 rounded-3xl p-8 text-white space-y-6 shadow-2xl shadow-indigo-600/30">
                     <div className="flex items-center justify-between">
                        <h5 className="text-xl font-bold">Campaign Distribution Summary</h5>
                        <Send className="w-6 h-6 opacity-40" />
                     </div>
                     <div className="grid grid-cols-2 gap-6 bg-white/10 p-5 rounded-2xl text-xs">
                        <div>Target: <b className="text-white ml-1">{newReminder.targetGroup?.length} Active Students</b></div>
                        <div>Protocol: <b className="text-white ml-1">Meta Cloud API</b></div>
                        <div className="col-span-2 border-t border-white/10 pt-4">
                            Job Context: <b className="text-white ml-1">{jobs.find(j => j.id === newReminder.jobId)?.title}</b>
                        </div>
                     </div>
                   </div>
                 </div>

                 <div className="flex gap-4">
                    <button onClick={() => setActiveStep(2)} className="flex-1 py-5 border-2 border-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-50">Back to Preview</button>
                    <button 
                      onClick={handleSchedule}
                      className="flex-[2] py-5 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-xl"
                    >
                      <Send className="w-5 h-5" />
                      Queue Broadcast
                    </button>
                 </div>
               </div>
             )}
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reminders.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-400 bg-white border border-slate-200 rounded-3xl border-dashed">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                <Bell className="w-8 h-8 opacity-20" />
              </div>
              <p className="font-bold text-slate-500">No campaigns queued.</p>
              <button onClick={() => setIsScheduling(true)} className="mt-8 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all">Start Campaign</button>
            </div>
          ) : (
            reminders.map((rem) => (
              <div key={rem.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl ring-4 ring-emerald-50/50">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-lg">
                      {jobs.find(j => j.id === rem.jobId)?.title}
                    </h5>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                        <Users className="w-3.5 h-3.5" /> {rem.targetGroup.length} Students
                      </span>
                      <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5" /> {new Date(rem.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Active Batch
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ReminderManager;
