
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  History, 
  Settings as SettingsIcon,
  ShieldCheck,
  Plus,
  LayoutGrid,
  Users,
  UserCircle
} from 'lucide-react';
import { Event, MessageLog, View, Student } from './types';
import EventManager from './components/EventManager';
import EventDetail from './components/EventDetail';
import LogViewer from './components/LogViewer';
import SettingsView from './components/SettingsView';
import StudentManager from './components/StudentManager';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('events');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  // App State
  const [events, setEvents] = useState<Event[]>([
    { 
      id: 'e1', 
      name: 'Google Internship 2025', 
      registrationDate: '2024-12-15', 
      defaultMessage: 'Hi {name}, last chance to register for {event_name}!',
      participants: [
        { id: 'u1', name: 'Rahul Kumar', phone: '919876543210' },
        { id: 'u2', name: 'Priya Singh', phone: '919123456789' }
      ],
      reminders: [
        { id: 'r1', message: 'Hurry up {name}!', scheduledAt: '2024-12-10T10:00', isAdminReminder: true, status: 'SENT' }
      ],
      status: 'ACTIVE'
    }
  ]);

  const [students, setStudents] = useState<Student[]>([
    { id: 'u1', name: 'Rahul Kumar', phone: '919876543210', email: 'rahul@example.com', isValidPhone: true, hasOptedIn: true },
    { id: 'u2', name: 'Priya Singh', phone: '919123456789', email: 'priya@example.com', isValidPhone: true, hasOptedIn: true }
  ]);

  const [logs, setLogs] = useState<MessageLog[]>([]);

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setActiveView('event-detail');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'events':
        return <EventManager events={events} setEvents={setEvents} onEventClick={handleEventClick} />;
      case 'event-detail':
        const event = events.find(e => e.id === selectedEventId);
        if (!event) { setActiveView('events'); return null; }
        return <EventDetail 
          event={event} 
          setEvents={setEvents} 
          onBack={() => setActiveView('events')} 
          setLogs={setLogs}
        />;
      case 'students':
        return <StudentManager students={students} setStudents={setStudents} />;
      case 'logs':
        return <LogViewer logs={logs} setLogs={setLogs} />;
      case 'settings':
        return <SettingsView />;
      default:
        return <EventManager events={events} setEvents={setEvents} onEventClick={handleEventClick} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar - Always visible */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2 bg-indigo-500 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">EduRemind<span className="text-indigo-400">Pro</span></h1>
          </div>
          
          <nav className="space-y-1 flex-1">
            <NavItem 
              icon={<LayoutGrid className="w-5 h-5" />} 
              label="Events Dashboard" 
              active={activeView === 'events' || activeView === 'event-detail'} 
              onClick={() => setActiveView('events')} 
            />
            <NavItem 
              icon={<Users className="w-5 h-5" />} 
              label="Student Registry" 
              active={activeView === 'students'} 
              onClick={() => setActiveView('students')} 
            />
            <NavItem 
              icon={<History className="w-5 h-5" />} 
              label="Message Logs" 
              active={activeView === 'logs'} 
              onClick={() => setActiveView('logs')} 
            />
            <NavItem 
              icon={<SettingsIcon className="w-5 h-5" />} 
              label="Settings" 
              active={activeView === 'settings'} 
              onClick={() => setActiveView('settings')} 
            />
          </nav>

          <div className="pt-6 border-t border-slate-800">
            <div className="px-4 py-3 flex items-center gap-3 text-slate-500 text-sm font-medium">
               <UserCircle className="w-5 h-5" />
               Administrator
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm z-10">
          <h2 className="text-lg font-bold text-slate-800 capitalize tracking-tight">
            {activeView.replace('-', ' ')}
          </h2>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase border border-emerald-100">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
               System Active
             </div>
             <UserCircle className="w-8 h-8 text-slate-300" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<any> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default App;
