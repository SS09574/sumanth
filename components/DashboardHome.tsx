
import React from 'react';
import { 
  Users, 
  Briefcase, 
  Bell, 
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Student, Job, Reminder, MessageLog } from '../types';

interface DashboardHomeProps {
  students: Student[];
  jobs: Job[];
  reminders: Reminder[];
  logs: MessageLog[];
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ students, jobs, reminders, logs }) => {
  const stats = [
    { label: 'Total Students', value: students.length, icon: <Users className="w-5 h-5" />, color: 'bg-blue-500' },
    { label: 'Active Jobs', value: jobs.length, icon: <Briefcase className="w-5 h-5" />, color: 'bg-indigo-500' },
    { label: 'Reminders Sent', value: reminders.filter(r => r.status === 'SENT').length, icon: <Bell className="w-5 h-5" />, color: 'bg-emerald-500' },
    { label: 'Delivery Rate', value: `${logs.length ? Math.round((logs.filter(l => l.status === 'DELIVERED').length / logs.length) * 100) : 0}%`, icon: <CheckCircle className="w-5 h-5" />, color: 'bg-amber-500' },
  ];

  const chartData = [
    { name: 'Mon', sent: 120, delivered: 110 },
    { name: 'Tue', sent: 450, delivered: 420 },
    { name: 'Wed', sent: 300, delivered: 290 },
    { name: 'Thu', sent: 600, delivered: 580 },
    { name: 'Fri', sent: 200, delivered: 195 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-lg text-white ${stat.color}`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Message Delivery Activity</h3>
            <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-medium">
              <TrendingUp className="w-3 h-3" />
              +12% vs last week
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="sent" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="delivered" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Upcoming Deadlines</h3>
          <div className="space-y-4">
            {jobs.slice(0, 3).map((job) => (
              <div key={job.id} className="flex gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200">
                <div className="bg-indigo-50 p-3 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{job.title}</p>
                  <p className="text-xs text-slate-500">{job.company}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full font-bold">
                      {job.deadline}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition-colors">
            View All Jobs
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">Recent Logs</h3>
          <button className="text-sm text-indigo-600 font-medium hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Message Snippet</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.slice(-5).reverse().map((log) => (
                <tr key={log.id} className="text-sm hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{log.studentName}</td>
                  <td className="px-6 py-4 text-slate-500">{log.phone}</td>
                  <td className="px-6 py-4 text-slate-500 truncate max-w-[200px]">{log.content}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      log.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' : 
                      log.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">
                    {new Date(log.sentAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
