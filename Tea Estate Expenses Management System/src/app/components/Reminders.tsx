import { useState } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, Bell, Repeat, Pencil, Trash2 } from 'lucide-react';
import { calendarEvents as initialEvents, CalendarEvent, estates } from '../data/mockData';

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

const recurrenceOptions = [
  { value: 'none', label: 'One-time', icon: '1' },
  { value: 'daily', label: 'Daily', icon: '📅' },
  { value: 'weekly', label: 'Weekly', icon: '📆' },
  { value: 'monthly', label: 'Monthly', icon: '🗓️' },
  { value: 'yearly', label: 'Yearly', icon: '🔁' },
];

const eventColors = ['#16a34a', '#2563eb', '#9333ea', '#dc2626', '#ea580c', '#0891b2', '#d97706'];

const eventCategories = ['Cultivation', 'Maintenance', 'Meeting', 'Finance', 'Review', 'Training', 'Other'];

function getRecurrenceLabel(recurrence: string) {
  return recurrenceOptions.find(r => r.value === recurrence)?.label || recurrence;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function Reminders() {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1)); // June 2026
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', startDate: '', endDate: '', recurrence: 'none',
    color: '#16a34a', category: 'Cultivation', estateId: ''
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();

  const prevMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => {
      if (e.startDate === dateStr) return true;
      if (e.recurrence === 'daily') return true;
      if (e.recurrence === 'weekly') {
        const eventDay = new Date(e.startDate).getDay();
        return new Date(dateStr).getDay() === eventDay;
      }
      if (e.recurrence === 'monthly') {
        return new Date(e.startDate).getDate() === day;
      }
      return false;
    });
  };

  const openAdd = (day?: number) => {
    setEditing(null);
    const dateStr = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
    setForm({ title: '', description: '', startDate: dateStr, endDate: '', recurrence: 'none', color: '#16a34a', category: 'Cultivation', estateId: '' });
    setShowModal(true);
  };

  const openEdit = (e: CalendarEvent) => {
    setEditing(e);
    setForm({ title: e.title, description: e.description, startDate: e.startDate, endDate: e.endDate || '', recurrence: e.recurrence, color: e.color, category: e.category, estateId: e.estateId || '' });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title || !form.startDate) return;
    if (editing) {
      setEvents(es => es.map(e => e.id === editing.id ? { ...e, ...form } : e));
    } else {
      setEvents(es => [...es, { id: `ev${Date.now()}`, ...form }]);
    }
    setShowModal(false);
  };

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Reminders & Calendar</h1>
          <p className="text-gray-500 text-sm mt-0.5">{events.length} events · Schedule and track recurring tasks</p>
        </div>
        <button onClick={() => openAdd()} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add Event</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
            <h3 className="text-gray-800">{monthNames[month]} {year}</h3>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {dayNames.map(d => (
              <div key={d} className="text-center py-2 text-xs text-gray-400 font-medium">{d}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 border-b border-r border-gray-50 bg-gray-50/30" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
              const isSelected = selectedDay === day;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={`h-24 border-b border-r border-gray-50 p-1.5 cursor-pointer transition-colors overflow-hidden
                    ${isSelected ? 'bg-green-50' : 'hover:bg-gray-50'}
                  `}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mb-1 font-medium
                    ${isToday ? 'bg-green-600 text-white' : isSelected ? 'text-green-700' : 'text-gray-700'}
                  `}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        className="text-xs px-1.5 py-0.5 rounded text-white truncate"
                        style={{ backgroundColor: event.color }}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <p className="text-xs text-gray-400 pl-1">+{dayEvents.length - 2} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Events Sidebar */}
        <div className="space-y-4">
          {/* Selected Day Events */}
          {selectedDay && (
            <div className="bg-white rounded-2xl border border-green-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-gray-800 text-sm">{monthNames[month]} {selectedDay}</h4>
                <button onClick={() => openAdd(selectedDay)} className="text-green-600 hover:text-green-700 text-xs flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />Add
                </button>
              </div>
              {selectedDayEvents.length === 0 ? (
                <p className="text-gray-400 text-xs py-2">No events this day</p>
              ) : (
                <div className="space-y-2">
                  {selectedDayEvents.map(event => (
                    <div key={event.id} className="flex items-start gap-2 p-2 rounded-xl bg-gray-50">
                      <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: event.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 text-xs font-medium truncate">{event.title}</p>
                        <p className="text-gray-400 text-xs">{event.category}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(event)} className="text-gray-300 hover:text-blue-500 transition-colors">
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button onClick={() => setEvents(es => es.filter(e => e.id !== event.id))} className="text-gray-300 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All Events List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h4 className="text-gray-800 mb-3">All Events</h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {events.sort((a, b) => a.startDate.localeCompare(b.startDate)).map(event => (
                <div key={event.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 group transition-colors">
                  <div className="w-3 h-3 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: event.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 text-sm font-medium truncate">{event.title}</p>
                    <p className="text-gray-500 text-xs">{event.startDate}</p>
                    {event.description && <p className="text-gray-400 text-xs mt-0.5 truncate">{event.description}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{event.category}</span>
                      {event.recurrence !== 'none' && (
                        <span className="flex items-center gap-0.5 text-xs text-blue-500">
                          <Repeat className="w-2.5 h-2.5" />
                          {getRecurrenceLabel(event.recurrence)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(event)} className="p-1 hover:bg-blue-50 rounded text-gray-300 hover:text-blue-500 transition-colors">
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button onClick={() => setEvents(es => es.filter(e => e.id !== event.id))} className="p-1 hover:bg-red-50 rounded text-gray-300 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <Modal title={editing ? 'Edit Event' : 'Add New Event'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Event Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Event name" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" placeholder="Event details..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Start Date *</label>
                <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">End Date</label>
                <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Recurrence</label>
              <div className="grid grid-cols-5 gap-2">
                {recurrenceOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setForm(f => ({ ...f, recurrence: opt.value }))}
                    className={`p-2 rounded-xl border text-center transition-all ${form.recurrence === opt.value ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-green-200'}`}
                  >
                    <p className="text-lg">{opt.icon}</p>
                    <p className="text-xs mt-0.5">{opt.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                  {eventCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Related Estate</label>
                <select value={form.estateId} onChange={e => setForm(f => ({ ...f, estateId: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                  <option value="">All estates</option>
                  {estates.map(e => <option key={e.id} value={e.id}>{e.name.split(' ')[0]}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Event Color</label>
              <div className="flex gap-2">
                {eventColors.map(color => (
                  <button
                    key={color}
                    onClick={() => setForm(f => ({ ...f, color }))}
                    className={`w-7 h-7 rounded-full transition-transform ${form.color === color ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm">{editing ? 'Save Changes' : 'Add Event'}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
