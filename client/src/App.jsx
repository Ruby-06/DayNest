import React, { useEffect, useMemo, useState, useRef } from "react";
import { Routes, Route, Navigate, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Home, CalendarDays, CheckSquare, BookOpen, Images, BarChart3,
  Settings as SettingsIcon, HelpCircle, Search, Bell, Plus, Sun, Moon, X, Trash2
} from "lucide-react";
import Dashboard from "./pages/Dashboard.jsx";
import Calendar from "./pages/Calendar.jsx";
import Habits from "./pages/Habits.jsx";
import Journal from "./pages/Journal.jsx";
import Memories from "./pages/Memories.jsx";
import Analytics from "./pages/Analytics.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Notifications from "./pages/Notifications.jsx";
import NotificationPanel from "./components/NotificationPanel.jsx";
import ProfileDropdown from "./components/ProfileDropdown.jsx";
import Profile from "./pages/Profile.jsx";
import EditProfile from "./pages/EditProfile.jsx";
import SettingsPage from "./pages/Settings.jsx";
import UserAvatar from "./components/UserAvatar.jsx";
import SearchDropdown from "./components/SearchDropdown.jsx";
import Help from "./pages/Help.jsx";
import DayNestLogo from "./components/DayNestLogo.jsx";
import { initPushNotifications } from "./utils/pushNotifications.js";


export const SERVER_URL = import.meta.env?.VITE_SERVER_URL || "http://localhost:5000";
export const API = `${SERVER_URL}/api`;

export const clearAuthSession = () => {
  localStorage.removeItem("daynest_token");
  localStorage.removeItem("daynest_user");
  window.dispatchEvent(new Event("storage"));
};

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("daynest_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearAuthSession();
    }
    return Promise.reject(error);
  }
);

export const getMediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("blob:") || url.startsWith("data:")) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const cleanPath = url.startsWith("/uploads/") ? url : `/uploads/${url.replace(/^\/+/, "")}`;
  return `${SERVER_URL}${cleanPath}`;
};

export const moodMeta = {
  awful: { label: "Awful", emoji: "😣" },
  low: { label: "Low", emoji: "😕" },
  okay: { label: "Okay", emoji: "😐" },
  good: { label: "Good", emoji: "🙂" },
  great: { label: "Great", emoji: "😊" }
};

function Shell() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("daynest_user") || "null"));
  const [search, setSearch] = useState("");

  // Theme mode state: "light" | "dark" | "system"
  const [themeMode, setThemeMode] = useState(() => {
    const saved = localStorage.getItem("daynest_theme_mode");
    if (saved) return saved;
    return user?.settings?.theme || "system";
  });

  const [systemIsDark, setSystemIsDark] = useState(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const isDarkMode = useMemo(() => {
    if (themeMode === "dark") return true;
    if (themeMode === "light") return false;
    return systemIsDark;
  }, [themeMode, systemIsDark]);

  const handleChangeThemeMode = (mode) => {
    setThemeMode(mode);
    localStorage.setItem("daynest_theme_mode", mode);
    // Sync with backend if available
    try {
      api.put("/settings", {
        settings: {
          ...user?.settings,
          theme: mode
        }
      });
    } catch (e) {
      // ignore
    }
  };

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef(null);

  // Profile dropdown state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const onStorage = () => setUser(JSON.parse(localStorage.getItem("daynest_user") || "null"));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    initPushNotifications();

    const handleCustomEvent = () => fetchNotifications();
    window.addEventListener("notifications_updated", handleCustomEvent);

    const interval = setInterval(fetchNotifications, 20000);
    return () => {
      window.removeEventListener("notifications_updated", handleCustomEvent);
      clearInterval(interval);
    };
  }, []);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);

  // Debounced backend search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setIsSearchOpen(true);

    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setSearchResults(res.data);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults({ journals: [], memories: [], habits: [], dates: [] });
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle Outside Click for Search, Notifications & Profile Dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setIsNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle Escape Key for Search, Notifications & Profile Dropdowns
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsNotificationOpen(false);
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);


  const handleUpdateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem("daynest_user", JSON.stringify(updatedUserData));
    window.dispatchEvent(new Event("storage"));
  };

  const handleUpdateProfile = async (updatedFields) => {
    try {
      let updatedUser = { ...user, ...updatedFields };
      try {
        const res = await api.put("/auth/profile", updatedFields);
        if (res.data) updatedUser = { ...updatedUser, ...res.data };
      } catch (err) {
        console.warn("Backend update error, saving locally:", err);
      }
      handleUpdateUser(updatedUser);
    } catch (err) {
      console.error("Failed to update profile:", err);
      throw err;
    }
  };

  const handleMarkRead = async (id) => {
    try {
      const res = await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      if (typeof res.data.unreadCount === "number") {
        setUnreadCount(res.data.unreadCount);
      } else {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await api.patch("/notifications/read-all");
      setNotifications(res.data.notifications || []);
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  const logout = () => {
    clearAuthSession();
    navigate("/login");
  };

  const links = [
    ["/", "Home", Home],
    ["/calendar", "Calendar", CalendarDays],
    ["/habits", "Habits", CheckSquare],
    ["/journal", "Journal", BookOpen],
    ["/memories", "Memories", Images],
    ["/analytics", "Analytics", BarChart3]
  ];

  return (
    <div className={`app ${isDarkMode ? "dark-theme" : ""}`}>
      <div className="background-overlay" />
      <aside className="sidebar glass">
        <div className="brand">
          <DayNestLogo size="medium" />
        </div>

        <div className="side-search-container" ref={searchRef}>
          <div className="side-search">
            <Search size={18}/>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim()) setIsSearchOpen(true);
              }}
              placeholder="Search DayNest..."
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults(null);
                  setIsSearchOpen(false);
                }}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {isSearchOpen && searchQuery.trim() && (
            <SearchDropdown
              results={searchResults}
              loading={isSearching}
              query={searchQuery}
              onSelectResult={(targetPath) => {
                setIsSearchOpen(false);
                navigate(targetPath);
              }}
            />
          )}
        </div>

        <nav>
          {links.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} end={to === "/"}>
              <Icon size={17}/><span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <NavLink to="/settings"><SettingsIcon size={17}/><span>Settings</span></NavLink>
          <NavLink to="/help"><HelpCircle size={17}/><span>Help</span></NavLink>
          <div className="profile-mini">
            <div className="avatar">
              <UserAvatar user={user} />
            </div>
            <div><strong>{user?.name || "Rithika Sree U."}</strong><small>Keep going</small></div>
            <button className="icon-button" onClick={logout} title="Logout">↪</button>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="mobile-brand">
            <DayNestLogo size="small" />
          </div>
          <div className="today-title">Today</div>
          <div className="top-actions">
            <button className="circle-button glass" onClick={() => navigate("/journal")} aria-label="Add Journal Entry"><Plus/></button>

            {/* Notification Bell */}
            <div className="notification-bell-wrapper" ref={notificationRef}>
              <button
                className={`circle-button glass bell-button ${isNotificationOpen ? "active" : ""}`}
                onClick={() => {
                  setIsNotificationOpen((prev) => !prev);
                  setIsProfileOpen(false);
                }}
                aria-label="Notifications"
                aria-expanded={isNotificationOpen}
              >
                <Bell size={20} />
                {unreadCount > 0 && <span className="bell-badge" title={`${unreadCount} unread`} />}
              </button>

              {isNotificationOpen && (
                <NotificationPanel
                  notifications={notifications}
                  onClose={() => setIsNotificationOpen(false)}
                  onMarkRead={handleMarkRead}
                  onMarkAllRead={handleMarkAllRead}
                  onNavigate={(path) => {
                    setIsNotificationOpen(false);
                    navigate(path);
                  }}
                />
              )}
            </div>

            {/* Profile Avatar Dropdown */}
            <div className="profile-dropdown-wrapper" ref={profileRef}>
              <button
                className={`circle-button glass profile-avatar-btn ${isProfileOpen ? "active" : ""}`}
                onClick={() => {
                  setIsProfileOpen((prev) => !prev);
                  setIsNotificationOpen(false);
                }}
                aria-label="User Profile Menu"
                aria-expanded={isProfileOpen}
              >
                <UserAvatar user={user} />
              </button>

              {isProfileOpen && (
                <ProfileDropdown
                  user={user}
                  onClose={() => setIsProfileOpen(false)}
                  onLogout={logout}
                  onNavigate={(path) => {
                    setIsProfileOpen(false);
                    navigate(path);
                  }}
                  darkMode={isDarkMode}
                  onToggleDarkMode={() => {
                    const nextMode = isDarkMode ? "light" : "dark";
                    handleChangeThemeMode(nextMode);
                  }}
                />
              )}
            </div>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/memories" element={<Memories />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route
            path="/notifications"
            element={
              <Notifications
                notifications={notifications}
                onMarkRead={handleMarkRead}
                onMarkAllRead={handleMarkAllRead}
              />
            }
          />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route
            path="/edit-profile"
            element={<EditProfile user={user} onUpdateProfile={handleUpdateProfile} />}
          />
          <Route
            path="/settings"
            element={
              <SettingsPage
                user={user}
                onUpdateUser={handleUpdateUser}
                themeMode={themeMode}
                onChangeThemeMode={handleChangeThemeMode}
                onLogout={logout}
              />
            }
          />
          <Route path="/help" element={<Help />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("daynest_token"));

  useEffect(() => {
    const handleStorage = () => {
      setToken(localStorage.getItem("daynest_token"));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (token) {
      api.get("/auth/me").then((res) => {
        if (res.data) {
          localStorage.setItem("daynest_user", JSON.stringify(res.data));
          window.dispatchEvent(new Event("storage"));
        }
      }).catch((err) => {
        if (err.response && err.response.status === 401) {
          clearAuthSession();
        }
      });
    }
  }, [token]);

  return token ? <Shell/> : (
    <Routes>
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="*" element={<Navigate to="/login" replace/>}/>
    </Routes>
  );
}
