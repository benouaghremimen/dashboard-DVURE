
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Bell, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications"; // Assuming this path

interface Notification {
  id: string;
  read: boolean;
  reservationId?: string;
  type: string;
  title: string;
  message: string;
  createdAt?: string | Date;
}

export function NotificationDropdown() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refresh
  } = useNotifications(user?.id ? String(user.id) : undefined);

  useEffect(() => {
    if (isOpen) {
      refresh();
    }
  }, [isOpen, refresh]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.reservationId) {
      if (String(user?.role || "").toUpperCase() === "ADMIN") {
        navigate("/admin/reservations");
      } else {
        navigate("/club/requests");
      }
    }

    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "reservation_approved":
        return "✅";
      case "reservation_rejected":
        return "❌";
      case "reservation_partial":
        return "⚠️";
      case "new_request":
        return "📋";
      default:
        return "🔔";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-900 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-red-900 to-red-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Notifications
              </h3>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-sm text-white hover:text-red-100 transition-colors"
                >
                  <CheckCheck size={16} />
                  Tout marquer lu
                </button>
              )}
            </div>

            {unreadCount > 0 && (
              <p className="text-sm text-red-100 mt-1">
                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {!notifications || notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell
                  className="mx-auto text-gray-400 mb-2"
                  size={48}
                />
                <p className="text-gray-500">
                  Aucune notification
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification: any) => (
                  <button
                    key={notification.id}
                    onClick={() =>
                      handleNotificationClick(notification)
                    }
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-red-50' : ''
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {notification.title}
                          </h4>

                          {!notification.read && (
                            <div className="w-2 h-2 bg-red-900 rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>

                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
