import { useState, useEffect } from "react";
import { X, Calendar, Clock } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const EventNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const { socket } = useAuthStore();

  useEffect(() => {
    if (!socket) return;

    const handleEventNotification = (notification) => {
      const newNotification = {
        ...notification,
        id: Date.now(),
        timestamp: new Date(),
      };
      
      setNotifications(prev => [...prev, newNotification]);

      // Auto-remove notification after 10 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 10000);
    };

    socket.on("eventNotification", handleEventNotification);

    return () => {
      socket.off("eventNotification", handleEventNotification);
    };
  }, [socket]);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className="bg-primary text-primary-content rounded-lg shadow-lg p-4 max-w-sm animate-slide-in-right"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary-content/20 rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{notification.title}</h4>
                <p className="text-sm opacity-90 mt-1">{notification.message}</p>
                <div className="flex items-center gap-1 mt-2 text-xs opacity-75">
                  <Clock className="w-3 h-3" />
                  <span>Group: {notification.groupName}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="p-1 hover:bg-primary-content/20 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventNotification;