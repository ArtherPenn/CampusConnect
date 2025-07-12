import { useState, useEffect } from "react";
import { X, Calendar, Plus, Trash2, Clock } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const CalendarModal = ({ group, onClose }) => {
  const { authUser } = useAuthStore();
  const { createEvent, getGroupEvents, deleteEvent } = useChatStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    time: "09:00"
  });
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = group.admin._id === authUser._id;

  useEffect(() => {
    loadEvents();
  }, [group._id]);

  const loadEvents = async () => {
    try {
      const groupEvents = await getGroupEvents(group._id);
      setEvents(groupEvents);
    } catch (error) {
      console.error("Error loading events:", error);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter(event => {
      const eventDate = new Date(event.eventDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const handleDateClick = (date) => {
    if (!date || !isAdmin) return;
    setSelectedDate(date);
    setShowEventForm(true);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    
    if (!eventForm.title.trim()) {
      toast.error("Event title is required");
      return;
    }

    setIsLoading(true);
    try {
      const eventDateTime = new Date(selectedDate);
      const [hours, minutes] = eventForm.time.split(':');
      eventDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      await createEvent({
        title: eventForm.title.trim(),
        description: eventForm.description.trim(),
        eventDate: eventDateTime.toISOString(),
        groupId: group._id
      });

      toast.success("Event created successfully!");
      setEventForm({ title: "", description: "", time: "09:00" });
      setShowEventForm(false);
      setSelectedDate(null);
      await loadEvents();
    } catch (error) {
      toast.error("Failed to create event");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteEvent(eventId);
      toast.success("Event deleted successfully!");
      await loadEvents();
    } catch (error) {
      toast.error("Failed to delete event");
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const days = getDaysInMonth(currentDate);
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Group Events - {group.name}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-base-200 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {!isAdmin && (
            <div className="mb-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-sm text-warning-content">
                Only group admins can create events. You can view existing events below.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <div className="space-y-4">
              {/* Calendar Navigation */}
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => navigateMonth(-1)}
                  className="btn btn-sm btn-ghost"
                >
                  ←
                </button>
                <h3 className="text-lg font-medium">{monthYear}</h3>
                <button 
                  onClick={() => navigateMonth(1)}
                  className="btn btn-sm btn-ghost"
                >
                  →
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="bg-base-200 rounded-lg p-4">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium p-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {days.map((date, index) => {
                    const dayEvents = getEventsForDate(date);
                    const hasEvents = dayEvents.length > 0;
                    const canClick = date && isAdmin && !isPastDate(date);

                    return (
                      <button
                        key={index}
                        onClick={() => canClick && handleDateClick(date)}
                        disabled={!canClick}
                        className={`
                          aspect-square p-1 text-sm rounded-lg relative transition-colors
                          ${!date ? 'invisible' : ''}
                          ${isToday(date) ? 'bg-primary text-primary-content font-bold' : ''}
                          ${hasEvents ? 'bg-success/20 border border-success/40' : ''}
                          ${canClick ? 'hover:bg-base-300 cursor-pointer' : ''}
                          ${isPastDate(date) ? 'text-base-content/40' : ''}
                          ${!canClick && !isPastDate(date) ? 'cursor-not-allowed' : ''}
                        `}
                      >
                        {date && (
                          <>
                            <span>{date.getDate()}</span>
                            {hasEvents && (
                              <div className="absolute bottom-0 right-0 w-2 h-2 bg-success rounded-full"></div>
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {isAdmin && (
                <div className="text-sm text-base-content/60">
                  <p>• Click on a future date to create an event</p>
                  <p>• Green dots indicate days with events</p>
                  <p>• Today is highlighted in blue</p>
                </div>
              )}
            </div>

            {/* Events List */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Upcoming Events</h3>
              
              {events.length === 0 ? (
                <div className="text-center py-8 text-base-content/60">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No events scheduled</p>
                  {isAdmin && <p className="text-sm">Click on a date to create your first event</p>}
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {events.map(event => (
                    <div key={event._id} className="bg-base-200 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{event.title}</h4>
                          {event.description && (
                            <p className="text-sm text-base-content/70 mt-1">
                              {event.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-sm text-base-content/60">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(event.eventDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-base-content/50 mt-1">
                            Created by {event.createdBy.name}
                          </p>
                        </div>
                        
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteEvent(event._id)}
                            className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Event Creation Form Modal */}
        {showEventForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
            <div className="bg-base-100 rounded-lg w-full max-w-md mx-4">
              <div className="flex items-center justify-between p-4 border-b border-base-300">
                <h3 className="text-lg font-semibold">Create Event</h3>
                <button 
                  onClick={() => {
                    setShowEventForm(false);
                    setSelectedDate(null);
                    setEventForm({ title: "", description: "", time: "09:00" });
                  }}
                  className="p-1 hover:bg-base-200 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="p-4 space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Date</span>
                  </label>
                  <input
                    type="text"
                    value={selectedDate ? formatDate(selectedDate) : ''}
                    className="input input-bordered w-full"
                    disabled
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Time</span>
                  </label>
                  <input
                    type="time"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Event Title *</span>
                  </label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className="input input-bordered w-full"
                    placeholder="Enter event title"
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Description (Optional)</span>
                  </label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    className="textarea textarea-bordered w-full"
                    placeholder="Enter event description"
                    rows="3"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEventForm(false);
                      setSelectedDate(null);
                      setEventForm({ title: "", description: "", time: "09:00" });
                    }}
                    className="btn btn-ghost flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !eventForm.title.trim()}
                    className="btn btn-primary flex-1"
                  >
                    {isLoading ? "Creating..." : "Create Event"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarModal;