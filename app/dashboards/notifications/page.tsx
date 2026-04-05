"use client";

import { useEffect, useState, useCallback } from "react";
import { useSidebarState } from "@/hooks/useSidebarState";
import Sidebar from "../Sidebar";
import AdminHeader from "../AdminHeader";

interface Notification {
  id: string;
  type: "success" | "warning" | "error" | "info";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    href?: string;
  };
}

const NotificationsPage = () => {
  const { sidebarSlim, setSidebarSlim } = useSidebarState();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "success",
      title: "Monthly Plan Created",
      message: "Your monthly content plan for May has been successfully created with 20 posts.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      action: { label: "View Plan", href: "/dashboards/calendar" },
    },
    {
      id: "2",
      type: "info",
      title: "New Account Connection",
      message: "Your Instagram account has been connected successfully.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
    },
    {
      id: "3",
      type: "warning",
      title: "Token Expiring Soon",
      message: "Your authentication token will expire in 24 hours. Please re-authenticate.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
      read: false,
      action: { label: "Re-authenticate", href: "/sign-in" },
    },
    {
      id: "4",
      type: "success",
      title: "Post Published",
      message: "Your post 'Summer Collection Launch' has been published to Instagram.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      read: true,
    },
    {
      id: "5",
      type: "info",
      title: "Analytics Available",
      message: "Weekly analytics report for your posts is now available.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      read: true,
    },
  ]);

  const [filterType, setFilterType] = useState<"all" | "unread" | Notification["type"]>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredNotifications = notifications.filter((notif) => {
    const matchesFilter = filterType === "all" || notif.type === filterType || (filterType === "unread" && !notif.read);
    const matchesSearch = notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const deleteAllRead = useCallback(() => {
    setNotifications((prev) => prev.filter((n) => !n.read));
  }, []);

  const getTypeIcon = (type: Notification["type"]) => {
    const icons = {
      success: "fa-circle-check",
      warning: "fa-triangle-exclamation",
      error: "fa-circle-xmark",
      info: "fa-circle-info",
    };
    return icons[type];
  };

  const getTypeColor = (type: Notification["type"]) => {
    const colors = {
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      info: "#3B82F6",
    };
    return colors[type];
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#F0F1F9" }}>
      <Sidebar slim={sidebarSlim} onToggle={() => setSidebarSlim((s) => !s)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <AdminHeader
          pageTitle="Notifications"
          slim={sidebarSlim}
          onToggle={() => setSidebarSlim((s) => !s)}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search notifications…"
        />

        {/* Main Content */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Toolbar */}
            <div style={{ background: "#fff", borderBottom: "1px solid #E2E4F0", padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  {[
                    { key: "all", label: "All" },
                    { key: "unread", label: "Unread" },
                    { key: "success", label: "Success" },
                    { key: "warning", label: "Warnings" },
                    { key: "error", label: "Errors" },
                    { key: "info", label: "Info" },
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => setFilterType(filter.key as any)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid #E2E4F0",
                        background: filterType === filter.key ? "#5B5BD6" : "#fff",
                        color: filterType === filter.key ? "#fff" : "#3D3F60",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "Sora,sans-serif",
                      }}
                    >
                      {filter.label}
                      {filter.key === "unread" && unreadCount > 0 && (
                        <span style={{ marginLeft: 6, background: "#EF4444", color: "#fff", padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      style={{
                        padding: "7px 14px",
                        borderRadius: 6,
                        border: "1px solid #E2E4F0",
                        background: "#fff",
                        color: "#3D3F60",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "Sora,sans-serif",
                      }}
                    >
                      Mark all as read
                    </button>
                  )}
                  {notifications.some((n) => n.read) && (
                    <button
                      onClick={deleteAllRead}
                      style={{
                        padding: "7px 14px",
                        borderRadius: 6,
                        border: "1px solid #E2E4F0",
                        background: "#FEF2F2",
                        color: "#EF4444",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "Sora,sans-serif",
                      }}
                    >
                      Clear read
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0 20px", paddingTop: 16 }}>
              {filteredNotifications.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#8486AB" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No notifications</div>
                  <div style={{ fontSize: 12 }}>
                    {filterType === "all" ? "You're all caught up!" : `No ${filterType} notifications`}
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {filteredNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      style={{
                        background: notif.read ? "#fff" : "#F0F1F9",
                        border: `1px solid ${notif.read ? "#E2E4F0" : "#DDDDFB"}`,
                        borderRadius: 10,
                        padding: 14,
                        display: "flex",
                        gap: 12,
                        alignItems: "flex-start",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onClick={() => !notif.read && markAsRead(notif.id)}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background = notif.read ? "#F9F9FB" : "#EEEEFF";
                        (e.currentTarget as HTMLDivElement).style.borderColor = notif.read ? "#DDDDFB" : "#C7C7F0";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background = notif.read ? "#fff" : "#F0F1F9";
                        (e.currentTarget as HTMLDivElement).style.borderColor = notif.read ? "#E2E4F0" : "#DDDDFB";
                      }}
                    >
                      {/* Icon */}
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          background: `${getTypeColor(notif.type)}20`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: getTypeColor(notif.type),
                          fontSize: 18,
                          flexShrink: 0,
                        }}
                      >
                        <i className={`fa-solid ${getTypeIcon(notif.type)}`} />
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#0B0C1A", fontFamily: "Sora,sans-serif" }}>
                            {notif.title}
                          </div>
                          {!notif.read && (
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: "#5B5BD6",
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </div>
                        <div style={{ fontSize: 12.5, color: "#3D3F60", lineHeight: 1.5, marginBottom: 8 }}>
                          {notif.message}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ fontSize: 11, color: "#8486AB", fontFamily: "JetBrains Mono,monospace" }}>
                            {formatTime(notif.timestamp)}
                          </div>
                          {notif.action && (
                            <a
                              href={notif.action.href || "#"}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                fontSize: 11,
                                color: "#5B5BD6",
                                fontWeight: 600,
                                textDecoration: "none",
                                padding: "4px 8px",
                                borderRadius: 4,
                                background: "#EEEEFF",
                                transition: "all 0.2s",
                                cursor: "pointer",
                              }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLAnchorElement).style.background = "#DDDDFB";
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLAnchorElement).style.background = "#EEEEFF";
                              }}
                            >
                              {notif.action.label} →
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#BFC1D9",
                          fontSize: 14,
                          cursor: "pointer",
                          padding: 4,
                          transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = "#EF4444";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = "#BFC1D9";
                        }}
                      >
                        <i className="fa-solid fa-xmark" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E2E4F0; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #BFC1D9; }
      `}</style>

      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
    </div>
  );
};

export default NotificationsPage;
