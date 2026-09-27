import React from "react";
import { Bell, CheckCheck, ArrowRight } from "lucide-react";
import NotificationItem from "./NotificationItem.jsx";

export default function NotificationPanel({
  notifications = [],
  onClose,
  onMarkRead,
  onMarkAllRead,
  onNavigate
}) {
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  const todayNotifications = [];
  const earlierNotifications = [];

  notifications.forEach((item) => {
    const itemTime = new Date(item.createdAt).getTime();
    if (now - itemTime < ONE_DAY_MS) {
      todayNotifications.push(item);
    } else {
      earlierNotifications.push(item);
    }
  });

  const handleItemClick = (notification, targetPath) => {
    if (!notification.read && onMarkRead) {
      onMarkRead(notification._id);
    }
    if (onNavigate) {
      onNavigate(targetPath);
    }
  };

  const handleViewAll = () => {
    if (onNavigate) {
      onNavigate("/notifications");
    }
  };

  return (
    <div className="notification-panel glass" role="dialog" aria-label="Notifications Panel">
      <div className="notification-panel-header">
        <div className="notification-panel-title">
          <Bell size={18} className="panel-bell-icon" />
          <span>Notifications</span>
        </div>
        <button
          className="mark-all-btn"
          onClick={onMarkAllRead}
          aria-label="Mark all notifications as read"
        >
          <CheckCheck size={15} />
          <span>Mark all as read</span>
        </button>
      </div>

      <div className="notification-panel-body">
        {notifications.length === 0 ? (
          <div className="notification-empty">
            <p>No notifications yet</p>
          </div>
        ) : (
          <>
            {todayNotifications.length > 0 && (
              <div className="notification-section">
                <div className="notification-group-header">
                  <span>Today</span>
                  <span className="count-pill">{todayNotifications.length}</span>
                </div>
                <div className="notification-list">
                  {todayNotifications.map((item) => (
                    <NotificationItem
                      key={item._id}
                      notification={item}
                      onClick={handleItemClick}
                    />
                  ))}
                </div>
              </div>
            )}

            {earlierNotifications.length > 0 && (
              <div className="notification-section">
                <div className="notification-group-header">
                  <span>Earlier</span>
                  <span className="count-pill">{earlierNotifications.length}</span>
                </div>
                <div className="notification-list">
                  {earlierNotifications.map((item) => (
                    <NotificationItem
                      key={item._id}
                      notification={item}
                      onClick={handleItemClick}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="notification-panel-footer">
        <button className="view-all-btn" onClick={handleViewAll}>
          <span>View all notifications</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
