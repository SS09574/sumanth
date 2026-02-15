import React, { useState } from 'react';
import { CheckCircle2, Search, MessageSquare, Send } from 'lucide-react';
import { MessageLog } from '../types';

interface LogViewerProps {
  logs: MessageLog[];
  setLogs: React.Dispatch<React.SetStateAction<MessageLog[]>>;
}

const LogViewer: React.FC<LogViewerProps> = ({ logs, setLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fixed: Added optional chaining and default empty string to prevent crashes when recipientName or eventName is undefined
  const filteredLogs = logs.filter(log => 
    (log.recipientName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (log.eventName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search logs..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
           Total Records: <span className="text-indigo-600">{filteredLogs.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-6 py-5">Recipient</th>
              <th className="px-6 py-5">Event</th>
              <th className="px-6 py-5">Message Snippet</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.slice().reverse().map((log) => (
              <tr key={log.id} className="text-sm hover:bg-slate-50 transition-colors">
                <td className="px-6 py-5 font-bold text-slate-800">{log.recipientName}</td>
                <td className="px-6 py-5">
                   <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-bold">
                     {log.eventName}
                   </span>
                </td>
                <td className="px-6 py-5 text-slate-500 italic truncate max-w-[200px]">"{log.content}"</td>
                <td className="px-6 py-5">
                   <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase">
                     <CheckCircle2 className="w-3.5 h-3.5" /> {log.status}
                   </div>
                </td>
                <td className="px-6 py-5 text-right text-slate-400 tabular-nums">
                  {new Date(log.sentAt).toLocaleTimeString()}
                </td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={5} className="py-20 text-center text-slate-400 font-medium italic">
                  No message history found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogViewer;