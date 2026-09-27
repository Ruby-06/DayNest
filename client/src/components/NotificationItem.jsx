import React from "react";
import { BookOpen, CheckCircle2, Image, BarChart2, Star, Bell } from "lucide-react";

export function formatTimeAgo(dateInput) {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function getNotificationMeta(type) {
  switch (type) {
    case "journal":
      return {
        icon: BookOpen,
        colorClass: "icon-journal",
        targetPath: "/journal"
      };
    case "habit":
      return {
        icon: CheckCircle2,
        colorClass: "icon-habit",
        targetPath: "/habits"
      };
    case "memory":
      return {
        icon: Image,
        colorClass: "icon-memory",
        targetPath: "/memories"
      };
    case "mood":
      return {
        icon: BarChart2,
        colorClass: "icon-mood",
        targetPath: "/analytics"
      };
    case "streak":
      return {
        icon: Star,
        colorClass: "icon-streak",
        targetPath: "/habits"
      };
    case "reminder":
    default:
      return {
        icon: Star,
        colorClass: "icon-reminder",
        targetPath: "/journal"
      };
  }
}

export default function NotificationItem({ notification, onClick }) {
  const meta = getNotificationMeta(notification.type);
  const IconComponent = meta.icon;

  const handleClick = () => {
    if (onClick) {
      onClick(notification, meta.targetPath);
    }
  };

  return (
    <div
      className={`notification-item ${notification.read ? "read" : "unread"}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className={`notification-icon-box ${meta.colorClass}`}>
        <IconComponent size={18} />
      </div>

      <div className="notification-content">
        <div className="notification-title-row">
          <span className="notification-title">{notification.title}</span>
          {!notification.read && <span className="notification-unread-dot" title="Unread" />}
          <span className="notification-time">{formatTimeAgo(notification.createdAt)}</span>
        </div>
        <p className="notification-message">{notification.message}</p>
      </div>
    </div>
  );
}
