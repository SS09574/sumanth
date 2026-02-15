
import React, { useState } from 'react';
import { ChevronLeft, UserPlus, Bell, Send, Trash2, Clock, ShieldCheck, User, MessageSquare } from 'lucide-react';
import { Event, EventUser, ScheduledReminder, MessageLog } from '../types';

interface EventDetailProps {
  event: Event;
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  onBack: () => void;
  setLogs: React.Dispatch<React.SetStateAction<MessageLog[]>>;
}

const EventDetail: React.FC<EventDetailProps> = ({ event, setEvents, onBack, setLogs }) => {
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  
  const [newUser, setNewUser] = useState({ name: '', phone: '' });
  const [newReminder, setNewReminder] = useState({ message: event.defaultMessage, scheduledAt: '', isAdminReminder: true });

  const addUser = () => {
    if (newUser.name && newUser.phone) {
      const user: EventUser = { id: `u-${Date.now()}`, ...newUser };
      setEvents(prev => prev.map(e => e.id === event.id ? { ...e, participants: [...e.participants, user] } : e));
      setNewUser({ name: '', phone: '' });
      setIsAddingUser(false);
    }
  };

  const removeUser = (userId: string, userName: string) => {
    if (confirm(`Remove ${userName} from this event?`)) {
      setEvents(prev => prev.map(e => 
        e.id === event.id 
          ? { ...e, participants: e.participants.filter(u => u.id !== userId) } 
          : e
      ));
    }
  };

  const deleteEntireEvent = () => {
    if (confirm('Delete this entire event card? This cannot be undone.')) {
      setEvents(prev => prev.filter(e => e.id !== event.id));
      onBack();
    }
  };

  const addReminder = () => {
    if (newReminder.message && newReminder.scheduledAt) {
      const reminder: ScheduledReminder = { id: `r-${Date.now()}`, ...newReminder, status: 'PENDING' };
      setEvents(prev => prev.map(e => e.id === event.id ? { ...e, reminders: [...e.reminders, reminder] } : e));
      setNewReminder({ message: event.defaultMessage, scheduledAt: '', isAdminReminder: true });
      setIsAddingReminder(false);
    }
  };

  const handleBroadcast = (reminder: ScheduledReminder) => {
    const logs: MessageLog[] = event.participants.map(user => ({
      id: `log-${Date.now()}-${user.id}`,
      eventId: event.id,
      eventName: event.name,
      recipientName: user.name,
      phone: user.phone,
      content: reminder.message.replace('{name}', user.name).replace('{event_name}', event.name),
      status: 'DELIVERED',
      sentAt: new Date().toISOString()
    }));

    setLogs(prev => [...prev, ...logs]);
    
    setEvents(prev => prev.map(e => e.id === event.id ? {
      ...e,
      reminders: e.reminders.map(r => r.id === reminder.id ? { ...r, status: 'SENT' } : r)
    } : e));

    alert(`Broadcast sent to ${event.participants.length} users!`);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-900 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">{event.name}</h3>
            <p className="text-sm text-slate-500 font-medium">Registration Deadline: {event.registrationDate}</p>
          </div>
        </div>
        <button 
          onClick={deleteEntireEvent}
          className="flex items-center gap-2 px-4 py-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all border border-rose-100"
        >
          <Trash2 className="w-4 h-4" />
          Delete Event Card
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Management */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-fit">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500" />
              Event Registrants ({event.participants.length})
            </h4>
            <button 
              onClick={() => setIsAddingUser(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md"
            >
              Register User
            </button>
          </div>
          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {event.participants.map(user => (
              <div key={user.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold border border-slate-200">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{user.name}</div>
                    <div className="text-xs font-mono text-slate-400">+{user.phone}</div>
                  </div>
                </div>
                <button 
                  onClick={() => removeUser(user.id, user.name)}
                  className="p-3 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
                  title="Remove from registration"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            {event.participants.length === 0 && (
              <div className="p-16 text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-slate-400 text-sm font-medium italic">No users registered for this event yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Multi-Reminder Scheduling */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-500" />
              Campaign Schedule
            </h4>
            <button 
              onClick={() => setIsAddingReminder(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-md"
            >
              Add Reminder
            </button>
          </div>
          <div className="p-6 space-y-4">
            {event.reminders.map(rem => (
              <div key={rem.id} className={`p-5 rounded-2xl border ${rem.status === 'SENT' ? 'bg-slate-50 border-slate-100 opacity-70' : 'bg-white border-slate-200 shadow-sm'} relative`}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 px-2 py-1 rounded">
                    <Clock className="w-3 h-3" /> {rem.scheduledAt.replace('T', ' ')}
                  </div>
                  {rem.status === 'SENT' ? (
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-600">
                      <ShieldCheck className="w-3 h-3" /> Dispatched
                    </span>
                  ) : (
                    <button 
                      onClick={() => handleBroadcast(rem)}
                      className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                      title="Send Broadcast Now"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
                  "{rem.message.replace('{name}', '[Name]').replace('{event_name}', event.name)}"
                </p>
              </div>
            ))}
            {event.reminders.length === 0 && (
              <div className="p-16 text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-slate-400 text-sm font-medium italic">Schedule multiple reminders for different intervals.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals remain the same but use updated terminology */}
      {isAddingUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 space-y-6">
              <h3 className="text-xl font-bold text-slate-900">Event Registration</h3>
              <div className="space-y-4">
                <input 
                  placeholder="Full Name" 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                />
                <input 
                  placeholder="Phone (Digits Only)" 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-mono focus:ring-2 focus:ring-indigo-500 transition-all" 
                  value={newUser.phone}
                  onChange={e => setNewUser({...newUser, phone: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsAddingUser(false)} className="flex-1 py-4 font-bold text-slate-500">Cancel</button>
                <button onClick={addUser} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200">Register</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAddingReminder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 space-y-6">
              <h3 className="text-xl font-bold text-slate-900">Schedule Campaign</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Message Body</label>
                  <textarea 
                    rows={3}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={newReminder.message}
                    onChange={e => setNewReminder({...newReminder, message: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Dispatch Time</label>
                  <input 
                    type="datetime-local"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={newReminder.scheduledAt}
                    onChange={e => setNewReminder({...newReminder, scheduledAt: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsAddingReminder(false)} className="flex-1 py-4 font-bold text-slate-500">Discard</button>
                <button onClick={addReminder} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-200">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;
