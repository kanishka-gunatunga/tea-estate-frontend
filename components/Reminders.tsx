import { useState } from "react";
import { Estate } from "./EstateManagement";

import { useEventsQuery, useEstatesQuery, useCreateEventMutation, useUpdateEventMutation, useDeleteEventMutation } from "@/hooks/hooks";

// --- Types ---
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  recurrence: "none" | "daily" | "weekly" | "monthly" | "yearly";
  color: string;
  category: string;
  estateId?: string;
}

const eventColors = ["#16a34a", "#2563eb", "#9333ea", "#dc2626", "#ea580c", "#0891b2", "#d97706"];
const eventCategories = ["Meeting", "Cultivation", "Maintenance", "Review", "Finance", "Training", "Other"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function Reminders() {
  const { data: serverEvents } = useEventsQuery();
  const { data: serverEstates } = useEstatesQuery();

  const events = (serverEvents as CalendarEvent[]) || [];
  const estates = (serverEstates as Estate[]) || [];

  const createEvent = useCreateEventMutation();
  const updateEvent = useUpdateEventMutation();
  const deleteEvent = useDeleteEventMutation();
  // Navigation month state (June 2026 default)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1));
  const [selectedDay, setSelectedDay] = useState<number | null>(18);

  // Modal Visibility states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Form input states
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventRecurrence, setEventRecurrence] = useState<"none" | "daily" | "weekly" | "monthly" | "yearly">("none");
  const [eventColor, setEventColor] = useState("#16a34a");
  const [eventCategory, setEventCategory] = useState("Meeting");
  const [eventEstateId, setEventEstateId] = useState("");
  const [formError, setFormError] = useState("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();

  // Navigation handlers
  const prevMonth = () => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    setSelectedDay(null);
  };
  const nextMonth = () => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  // Helper: Retrieve events for a specific day cell of current month
  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const targetDate = new Date(dateStr);

    return events.filter((e) => {
      const eventStartDateObj = new Date(e.startDate);
      // Event cannot appear before its start date
      if (targetDate < eventStartDateObj) return false;

      if (e.recurrence === "none") {
        return e.startDate === dateStr;
      }
      if (e.recurrence === "daily") {
        return true;
      }
      if (e.recurrence === "weekly") {
        return targetDate.getDay() === eventStartDateObj.getDay();
      }
      if (e.recurrence === "monthly") {
        return targetDate.getDate() === eventStartDateObj.getDate();
      }
      if (e.recurrence === "yearly") {
        return (
          targetDate.getDate() === eventStartDateObj.getDate() &&
          targetDate.getMonth() === eventStartDateObj.getMonth()
        );
      }
      return false;
    });
  };

  // Open Add/Edit Modal
  const openModal = (evt: CalendarEvent | null = null, prefilledDay: number | null = null) => {
    if (evt) {
      setEditingEvent(evt);
      setEventTitle(evt.title);
      setEventDesc(evt.description);
      setEventStartDate(evt.startDate);
      setEventEndDate(evt.endDate || "");
      setEventRecurrence(evt.recurrence);
      setEventColor(evt.color);
      setEventCategory(evt.category);
      setEventEstateId(evt.estateId || "");
    } else {
      setEditingEvent(null);
      setEventTitle("");
      setEventDesc("");
      const initialDate = prefilledDay
        ? `${year}-${String(month + 1).padStart(2, "0")}-${String(prefilledDay).padStart(2, "0")}`
        : `${year}-${String(month + 1).padStart(2, "0")}-18`; // default match June 18
      setEventStartDate(initialDate);
      setEventEndDate("");
      setEventRecurrence("none");
      setEventColor("#16a34a");
      setEventCategory("Meeting");
      setEventEstateId("");
    }
    setFormError("");
    setIsModalOpen(true);
  };

  // Save Event handler
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventStartDate) {
      setFormError("Event Title and Start Date are required.");
      return;
    }

    if (editingEvent) {
      // Edit
      updateEvent.mutate({
        id: editingEvent.id,
        payload: {
          title: eventTitle,
          description: eventDesc,
          startDate: eventStartDate,
          endDate: eventEndDate || undefined,
          recurrence: eventRecurrence,
          color: eventColor,
          category: eventCategory,
          estateId: eventEstateId || undefined,
        }
      });
    } else {
      // Add
      const newEvent = {
        title: eventTitle,
        description: eventDesc,
        startDate: eventStartDate,
        endDate: eventEndDate || undefined,
        recurrence: eventRecurrence,
        color: eventColor,
        category: eventCategory,
        estateId: eventEstateId || undefined,
      };
      createEvent.mutate(newEvent);
    }

    setIsModalOpen(false);
  };

  // Delete Event
  const handleDeleteEvent = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete the event: "${title}"?`)) {
      deleteEvent.mutate(id);
    }
  };

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-[#F9FAFB]">
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
        
        {/* Page Banner Header */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-[24px] font-medium text-[#101828] leading-[36px] font-sans">Reminders & Calendar</h1>
            <p className="text-[14px] font-normal text-[#6A7282] leading-[20px] mt-0.5 font-sans">
              {events.length} events · Schedule and track recurring tasks
            </p>
          </div>
          <button
            onClick={() => openModal(null, selectedDay)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#00A63E] hover:bg-[#009966] text-white font-medium text-[14px] rounded-[14px] shadow-sm hover:shadow active:scale-[0.98] transition-all cursor-pointer font-sans"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Add Event</span>
          </button>
        </div>

        {/* Two-Column Workpane */}
        <div className="flex gap-5 flex-1 min-h-[580px] shrink-0 items-start">
          
          {/* Left Column: Calendar Component Card */}
          <div className="flex-1 bg-white border border-[#F3F4F6] rounded-[16px] shadow-sm overflow-hidden flex flex-col">
            {/* Calendar Controls */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4F6] shrink-0">
              <button
                onClick={prevMonth}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors border border-gray-200 shadow-xs cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <h3 className="text-[18px] font-medium text-[#1E2939] leading-[27px] font-sans">
                {monthNames[month]} {year}
              </h3>
              <button
                onClick={nextMonth}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors border border-gray-200 shadow-xs cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>

            {/* Day Column Headers */}
            <div className="grid grid-cols-7 border-b border-[#F3F4F6] bg-white select-none shrink-0 font-sans">
              {dayNames.map((d) => (
                <div key={d} className="text-center py-2 text-[12px] text-[#99A1AF] font-medium uppercase tracking-[0.3px]">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid Cells */}
            <div className="grid grid-cols-7 bg-white select-none">
              {/* Pre-month empty days */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-24 border-b border-r border-[#F9FAFB] bg-gray-50/20" />
              ))}
              {/* Actual Month Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                const isToday =
                  today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
                const isSelected = selectedDay === day;

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    className={`h-24 border-b border-r border-[#F3F4F6] p-1.5 cursor-pointer transition-all flex flex-col overflow-hidden relative ${
                      isSelected ? "bg-[#F0FDF4]" : "hover:bg-gray-50/40"
                    }`}
                  >
                    {/* Day number circle badge */}
                    <div className="flex items-center mb-1">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-medium font-sans ${
                          isToday
                            ? "bg-[#00A63E] text-white"
                            : isSelected
                            ? "text-[#008236] font-bold"
                            : "text-[#364153]"
                        }`}
                      >
                        {day}
                      </div>
                    </div>
                    {/* Event tags list */}
                    <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className="text-[10px] px-1.5 py-0.5 rounded-[4px] text-white truncate font-normal font-sans leading-tight shrink-0 select-none"
                          style={{ backgroundColor: event.color }}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <p className="text-[10px] text-gray-400 font-medium pl-1 font-sans mt-0.5">
                          +{dayEvents.length - 2} more
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Cards Sidebar */}
          <div className="w-[423.67px] flex flex-col gap-4 shrink-0">
            {/* Selected Day Details Panel */}
            {selectedDay && (
              <div className="bg-white border border-[#F3F4F6] rounded-[16px] shadow-sm p-4">
                <div className="flex items-center justify-between border-b border-gray-50 pb-2.5 mb-3">
                  <h4 className="text-[14px] font-semibold text-[#1E2939] font-sans">
                    {monthNames[month]} {selectedDay}
                  </h4>
                  <button
                    onClick={() => openModal(null, selectedDay)}
                    className="text-[#00A63E] hover:text-[#009966] text-xs font-semibold flex items-center gap-1 cursor-pointer font-sans"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span>Add</span>
                  </button>
                </div>
                {selectedDayEvents.length === 0 ? (
                  <p className="text-gray-400 text-xs py-4 text-center font-normal font-sans">
                    No events this day
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {selectedDayEvents.map((event) => (
                      <div key={event.id} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-gray-50">
                        <div
                          className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                          style={{ backgroundColor: event.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[#364153] text-xs font-medium truncate font-sans">{event.title}</p>
                          <p className="text-gray-400 text-[10px] mt-0.5 font-sans">{event.category}</p>
                        </div>
                        <div className="flex gap-1 bg-white border border-gray-100 rounded-lg p-0.5 shadow-xs">
                          <button
                            onClick={() => openModal(event)}
                            className="p-1 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                            title="Edit Event"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id, event.title)}
                            className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                            title="Delete Event"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* All Events Chronological Card */}
            <div className="bg-white border border-[#F3F4F6] rounded-[16px] shadow-sm p-4 flex flex-col flex-1">
              <h4 className="text-[16px] font-semibold text-[#1E2939] mb-3 font-sans">All Events</h4>
              <div className="flex-1 overflow-y-auto pr-0.5 flex flex-col gap-2 max-h-[380px]">
                {events
                  .slice()
                  .sort((a, b) => a.startDate.localeCompare(b.startDate))
                  .map((event) => {
                    const estate = estates.find((e) => e.id === event.estateId);

                    return (
                      <div
                        key={event.id}
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50/70 group transition-all border border-transparent hover:border-gray-100"
                      >
                        {/* Event Color Dot */}
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                          style={{ backgroundColor: event.color }}
                        />
                        {/* Event details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-medium text-[#1E2939] truncate font-sans">
                            {event.title}
                          </p>
                          <p className="text-[12px] font-normal text-gray-500 font-mono mt-0.5 leading-none">
                            {event.startDate}
                          </p>
                          {event.description && (
                            <p className="text-[12px] font-normal text-gray-400 mt-1 truncate font-sans">
                              {event.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 select-none leading-none">
                            <span className="text-[11px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-[4px] font-sans">
                              {event.category}
                            </span>
                            {estate && (
                              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-[4px] font-sans">
                                {estate.name.split(" ")[0]}
                              </span>
                            )}
                            {event.recurrence !== "none" && (
                              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-[4px] font-sans capitalize">
                                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M17 1l4 4-4 4" />
                                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                                  <path d="M7 23l-4-4 4-4" />
                                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                                </svg>
                                <span>{event.recurrence}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Event actions showing on card hover */}
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-all border border-gray-100 bg-white rounded-lg p-0.5 shadow-xs">
                          <button
                            onClick={() => openModal(event)}
                            className="p-1 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                            title="Edit Event"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id, event.title)}
                            className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                            title="Delete Event"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Dialog Modal: Add / Edit Event --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[488px] overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 select-none">
              <h3 className="text-lg font-bold text-gray-900 font-sans">
                {editingEvent ? "Edit Event" : "Add New Event"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveEvent} className="p-6 flex flex-col gap-4">
              {formError && (
                <div className="text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 text-center font-sans animate-pulse">
                  {formError}
                </div>
              )}

              {/* Event Title */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1 font-sans">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Event name"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-3.5 text-sm outline-none transition-all placeholder-gray-400 text-gray-800 font-sans"
                  required
                />
              </div>

              {/* Description */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1 font-sans">
                  Description
                </label>
                <textarea
                  placeholder="Event details..."
                  rows={2}
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  className="w-full border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg p-3 text-sm outline-none transition-all placeholder-gray-400 resize-none text-gray-800 font-sans"
                />
              </div>

              {/* Start Date & Related Estate */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 mb-1 font-sans">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 rounded-lg px-3 text-sm outline-none transition-all text-gray-800 font-sans"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 mb-1 font-sans">
                    Related Estate
                  </label>
                  <select
                    value={eventEstateId}
                    onChange={(e) => setEventEstateId(e.target.value)}
                    className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 bg-white rounded-lg px-3 text-sm outline-none transition-all cursor-pointer text-gray-800 font-sans font-medium"
                  >
                    <option value="">Select Estate</option>
                    {estates.map((est) => (
                      <option key={est.id} value={est.id}>
                        {est.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Recurrence Selector Buttons */}
              <div className="flex flex-col select-none">
                <label className="text-xs font-semibold text-gray-600 mb-1.5 font-sans">
                  Recurrence
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    {
                      value: "none",
                      label: "One-time",
                      icon: (
                        <span className="text-[14px] font-bold h-5 flex items-center justify-center font-sans">1</span>
                      ),
                    },
                    {
                      value: "daily",
                      label: "Daily",
                      icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      ),
                    },
                    {
                      value: "weekly",
                      label: "Weekly",
                      icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                          <line x1="3" y1="15" x2="21" y2="15" />
                        </svg>
                      ),
                    },
                    {
                      value: "monthly",
                      label: "Monthly",
                      icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="3" y="6" width="18" height="15" rx="2" />
                          <path d="M8 3v4M16 3v4M3 11h18" />
                        </svg>
                      ),
                    },
                    {
                      value: "yearly",
                      label: "Yearly",
                      icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3" />
                        </svg>
                      ),
                    },
                  ].map((opt) => {
                    const isSel = eventRecurrence === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setEventRecurrence(opt.value as "none" | "daily" | "weekly" | "monthly" | "yearly")}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                          isSel
                            ? "border-[#00A63E] bg-[#E6F7ED] text-[#00A63E] font-semibold"
                            : "border-gray-200 text-gray-500 hover:border-emerald-200"
                        }`}
                      >
                        {opt.icon}
                        <span className="text-[10px] mt-1 font-sans">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category & Color Picker */}
              <div className="grid grid-cols-2 gap-4 select-none">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 mb-1 font-sans">
                    Category
                  </label>
                  <select
                    value={eventCategory}
                    onChange={(e) => setEventCategory(e.target.value)}
                    className="w-full h-10 border border-gray-300 focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100 bg-white rounded-lg px-3 text-sm outline-none transition-all cursor-pointer text-gray-800 font-sans font-medium"
                  >
                    {eventCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col justify-center">
                  <label className="text-xs font-semibold text-gray-600 mb-2 font-sans">
                    Event Color
                  </label>
                  <div className="flex gap-2">
                    {eventColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setEventColor(color)}
                        className={`w-6.5 h-6.5 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                          eventColor === color ? "scale-110 ring-2 ring-offset-1 ring-gray-400" : ""
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#00A63E] hover:bg-[#009966] text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-colors cursor-pointer font-sans"
                >
                  {editingEvent ? "Save Changes" : "Add Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
