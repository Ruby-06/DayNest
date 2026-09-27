import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCheck, Bell, Filter } from "lucide-react";
import NotificationItem from "../components/NotificationItem.jsx";

export default function Notifications({ notifications = [], onMarkRead, onMarkAllRead }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all"); // "all" | "unread"

  const filteredNotifications = notifications.filter((item) => {
    if (filter === "unread") return !item.read;
    return true;
  });

  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  const todayItems = [];
  const earlierItems = [];

  filteredNotifications.forEach((item) => {
    const itemTime = new Date(item.createdAt).getTime();
    if (now - itemTime < ONE_DAY_MS) {
      todayItems.push(item);
    } else {
      earlierItems.push(item);
    }
  });

  const handleItemClick = (notification, targetPath) => {
    if (!notification.read && onMarkRead) {
      onMarkRead(notification._id);
    }
    if (targetPath) {
      navigate(targetPath);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">PERSONAL SPACE</span>
          <h1>Notifications</h1>
        </div>
        <div className="heading-actions">
          {unreadCount > 0 && (
            <button className="soft-button glass" onClick={onMarkAllRead}>
              <CheckCheck size={16} />
              <span>Mark all as read</span>
            </button>
          )}
        </div>
      </div>

      <div className="glass panel notifications-page-panel">
        <div className="notifications-page-toolbar">
          <div className="filter-tabs glass">
            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              <span>All ({notifications.length})</span>
            </button>
            <button
              className={`filter-btn ${filter === "unread" ? "active" : ""}`}
              onClick={() => setFilter("unread")}
            >
              <span>Unread ({unreadCount})</span>
            </button>
          </div>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="no-entry-state empty-memories-state">
            <Bell size={32} opacity={0.4} />
            <p>No {filter === "unread" ? "unread " : ""}notifications right now.</p>
          </div>
        ) : (
          <div className="notifications-page-list">
            {todayItems.length > 0 && (
              <div className="notification-section">
                <div className="notification-group-header">
                  <span>Today</span>
                  <span className="count-pill">{todayItems.length}</span>
                </div>
                <div className="notification-list">
                  {todayItems.map((item) => (
                    <NotificationItem
                      key={item._id}
                      notification={item}
                      onClick={handleItemClick}
                    />
                  ))}
                </div>
              </div>
            )}

            {earlierItems.length > 0 && (
              <div className="notification-section">
                <div className="notification-group-header">
                  <span>Earlier</span>
                  <span className="count-pill">{earlierItems.length}</span>
                </div>
                <div className="notification-list">
                  {earlierItems.map((item) => (
                    <NotificationItem
                      key={item._id}
                      notification={item}
                      onClick={handleItemClick}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
