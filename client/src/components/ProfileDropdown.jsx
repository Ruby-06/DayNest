import React, { useEffect } from "react";
import { User, Settings, Sliders, Sun, Moon, LogOut, ArrowRight } from "lucide-react";
import UserAvatar from "./UserAvatar.jsx";

export default function ProfileDropdown({
  user,
  onClose,
  onLogout,
  onNavigate,
  darkMode,
  onToggleDarkMode
}) {
  // Listen for Escape key press to close dropdown
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const displayName = user?.name || "Rithika Sree U.";
  const displayEmail = user?.email || "rithika@example.com";

  return (
    <div
      className="profile-dropdown glass"
      role="menu"
      aria-label="Profile Menu"
    >
      <div className="profile-dropdown-header">
        <div className="profile-photo-wrapper">
          <UserAvatar user={user} className="profile-photo-img" />
        </div>
        <div className="profile-info">
          <strong className="profile-name">{displayName}</strong>
          <span className="profile-email">{displayEmail}</span>
          <button
            className="view-profile-btn"
            onClick={() => onNavigate("/profile")}
          >
            <span>View Profile</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      <div className="dropdown-divider" />

      <div className="profile-dropdown-menu">
        <button
          className="menu-item"
          onClick={() => onNavigate("/edit-profile")}
          role="menuitem"
        >
          <User size={17} className="menu-icon" />
          <span>Edit Profile</span>
        </button>

        <button
          className="menu-item"
          onClick={() => onNavigate("/settings")}
          role="menuitem"
        >
          <Settings size={17} className="menu-icon" />
          <span>Account Settings</span>
        </button>

        <button
          className="menu-item"
          onClick={() => onNavigate("/settings")}
          role="menuitem"
        >
          <Sliders size={17} className="menu-icon" />
          <span>Preferences</span>
        </button>

        <button
          className="menu-item"
          onClick={onToggleDarkMode}
          role="menuitem"
        >
          {darkMode ? <Sun size={17} className="menu-icon" /> : <Moon size={17} className="menu-icon" />}
          <span>{darkMode ? "Light Mode" : "Dark / Light Mode"}</span>
        </button>
      </div>

      <div className="dropdown-divider" />

      <div className="profile-dropdown-footer">
        <button
          className="menu-item danger-item"
          onClick={onLogout}
          role="menuitem"
        >
          <LogOut size={17} className="menu-icon danger-icon" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
