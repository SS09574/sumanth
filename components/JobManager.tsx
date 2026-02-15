
import React, { useState } from 'react';
import { Briefcase, Calendar, Link, Plus, Trash2, ExternalLink } from 'lucide-react';
import { Job } from '../types';

interface JobManagerProps {
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
}

const JobManager: React.FC<JobManagerProps> = ({ jobs, setJobs }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newJob, setNewJob] = useState<Partial<Job>>({
    title: '',
    company: '',
    deadline: '',
    link: '',
    description: '',
  });

  const handleAddJob = () => {
    if (newJob.title && newJob.company) {
      setJobs([{ ...newJob, id: `job-${Date.now()}` } as Job, ...jobs]);
      setNewJob({ title: '', company: '', deadline: '', link: '', description: '' });
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900">Job Catalog</h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {isAdding ? 'Cancel' : 'Post New Job'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl border-2 border-indigo-100 shadow-xl space-y-4 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Job Title</label>
              <input 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Software Engineer Intern"
                value={newJob.title}
                onChange={e => setNewJob({...newJob, title: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Company Name</label>
              <input 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Google, Microsoft, etc."
                value={newJob.company}
                onChange={e => setNewJob({...newJob, company: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Application Deadline</label>
              <input 
                type="date"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newJob.deadline}
                onChange={e => setNewJob({...newJob, deadline: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Application Link</label>
              <input 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="https://..."
                value={newJob.link}
                onChange={e => setNewJob({...newJob, link: e.target.value})}
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Short Description / Eligibility</label>
              <textarea 
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Final year students with CGPA > 7.5..."
                value={newJob.description}
                onChange={e => setNewJob({...newJob, description: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button 
              onClick={() => setIsAdding(false)}
              className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddJob}
              className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              Save Job Details
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group">
            <button 
              onClick={() => setJobs(jobs.filter(j => j.id !== job.id))}
              className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="bg-indigo-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <Briefcase className="w-6 h-6 text-indigo-600" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-1">{job.title}</h4>
            <p className="text-sm font-semibold text-slate-500 mb-4">{job.company}</p>
            
            <p className="text-sm text-slate-600 line-clamp-2 mb-4">
              {job.description || 'No description provided.'}
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-medium">Deadline: <b className="text-slate-800">{job.deadline}</b></span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Link className="w-4 h-4" />
                <a href={job.link} target="_blank" rel="noreferrer" className="text-xs font-medium text-indigo-600 hover:underline truncate">
                  {job.link}
                </a>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">ID: {job.id}</span>
              <button className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800">
                Details <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobManager;
