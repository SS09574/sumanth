
import React, { useState } from 'react';
import { Calendar, Users, Bell, Plus, Search, ChevronRight, X, Trash2 } from 'lucide-react';
import { Event } from '../types';

interface EventManagerProps {
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  onEventClick: (id: string) => void;
}

const EventManager: React.FC<EventManagerProps> = ({ events, setEvents, onEventClick }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newEvent, setNewEvent] = useState({
    name: '',
    registrationDate: '',
    defaultMessage: 'Hi {name}, don\'t forget to register for {event_name}!'
  });

  const handleCreateEvent = () => {
    if (newEvent.name && newEvent.registrationDate) {
      const event: Event = {
        id: `e-${Date.now()}`,
        name: newEvent.name,
        registrationDate: newEvent.registrationDate,
        defaultMessage: newEvent.defaultMessage,
        participants: [],
        reminders: [],
        status: 'ACTIVE'
      };
      setEvents([event, ...events]);
      setNewEvent({ name: '', registrationDate: '', defaultMessage: 'Hi {name}, don\'t forget to register for {event_name}!' });
      setIsModalOpen(false);
    }
  };

  const deleteEvent = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this entire event and all its participants? This action cannot be undone.')) {
      setEvents(prev => prev.filter(event => event.id !== id));
    }
  };

  const filteredEvents = events.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search events..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          Create New Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <div 
            key={event.id}
            onClick={() => onEventClick(event.id)}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group relative"
          >
            <button 
              onClick={(e) => deleteEvent(e, event.id)}
              className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              title="Delete Event"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="px-3 py-1 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest mr-8">
                ID: {event.id.slice(-4)}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
              {event.name}
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                <Calendar className="w-4 h-4 text-slate-300" />
                Register by: <span className="text-slate-800 font-bold">{event.registrationDate}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                  <Users className="w-4 h-4" />
                  {event.participants.length} Users
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                  <Bell className="w-4 h-4" />
                  {event.reminders.length} Reminders
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <span className="text-indigo-600 text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                Manage Event <ChevronRight className="w-3 h-3" />
              </span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <div className="col-span-full py-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-bold">No events found matching your search.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Create Event Card</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900"><X /></button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Event Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Amazon Placement Drive" 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800"
                  value={newEvent.name}
                  onChange={e => setNewEvent({...newEvent, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Registration Date</label>
                <input 
                  type="date" 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800"
                  value={newEvent.registrationDate}
                  onChange={e => setNewEvent({...newEvent, registrationDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Default Reminder Message</label>
                <textarea 
                  rows={3}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                  value={newEvent.defaultMessage}
                  onChange={e => setNewEvent({...newEvent, defaultMessage: e.target.value})}
                />
                <p className="text-[10px] text-slate-400 font-medium">Use {"{name}"} and {"{event_name}"} as placeholders.</p>
              </div>

              <button 
                onClick={handleCreateEvent}
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98]"
              >
                Create Event Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManager;
