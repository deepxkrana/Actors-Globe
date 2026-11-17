import React, { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { api } from "../services/api";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const NotificationBell: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.getUnreadNotificationCount();
      if (res.success && res.data) {
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch {
      // Ignore background notification fetch errors
    }
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications(1, 10);
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch {
      // Ignore errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 45000); // 45s poll
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // Ignore errors
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      setUnreadCount((c) => Math.max(0, c - 1));
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // Ignore errors
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-white/4 hover:bg-white/8 border border-white/10 flex items-center justify-center text-[#B9B9BE] hover:text-white transition-colors relative cursor-pointer"
        aria-label="View notifications"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 px-1.5 min-w-4 h-4 rounded-full bg-[#F7FFB8] text-black font-semibold text-[10px] flex items-center justify-center shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Card */}
      {isOpen && (
        <div
          role="region"
          aria-label="Notifications panel"
          className="absolute right-0 mt-3 w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-3xl bg-[#0D0D0E] border border-white/14 shadow-2xl p-4 z-50 glass overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F7FFB8]/15 text-[#F7FFB8] font-semibold border border-[#F7FFB8]/20">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-[#8A8A90] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto flex flex-col gap-2 divide-y divide-white/5">
            {loading ? (
              <div className="py-8 text-center text-xs text-[#8A8A90]">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center gap-2 text-xs text-[#8A8A90]">
                <Bell className="w-6 h-6 opacity-40 text-[#8A8A90]" />
                <span>No notifications right now</span>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkSingleRead(n.id)}
                  className={`pt-2 pb-2 px-2 rounded-xl transition-colors cursor-pointer ${
                    !n.isRead ? "bg-white/4 hover:bg-white/8" : "hover:bg-white/2 opacity-75"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-medium text-white">{n.title}</span>
                    <span className="text-[10px] text-[#8A8A90] shrink-0">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#B9B9BE] mt-0.5 line-clamp-2">
                    {n.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
