import React from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Calendar, Edit3, CheckCircle, BookOpen, Flame } from "lucide-react";
import UserAvatar from "../components/UserAvatar.jsx";

export default function Profile({ user }) {
  const navigate = useNavigate();

  const displayName = user?.name || "Rithika Sree U.";
  const displayEmail = user?.email || "rithika@example.com";
  const bio = user?.bio || "Passionate about mindful daily reflection, habit building, and personal growth.";

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">PERSONAL SPACE</span>
          <h1>User Profile</h1>
        </div>
        <button
          className="soft-button glass"
          onClick={() => navigate("/edit-profile")}
        >
          <Edit3 size={16} />
          <span>Edit Profile</span>
        </button>
      </div>

      <div className="profile-page-grid">
        <div className="glass panel profile-card-hero">
          <div className="profile-hero-top">
            <div className="profile-large-avatar">
              <UserAvatar user={user} />
            </div>
            <div className="profile-hero-info">
              <h2>{displayName}</h2>
              <p className="profile-email-badge">
                <Mail size={14} />
                <span>{displayEmail}</span>
              </p>
              <p className="profile-bio">{bio}</p>
            </div>
          </div>
        </div>

        <div className="glass panel profile-stats-card">
          <div className="panel-top">
            <strong>Activity Overview</strong>
          </div>
          <div className="profile-stats-row">
            <div className="stat-box">
              <CheckCircle size={20} className="stat-box-icon habit-stat" />
              <div>
                <strong>3/3</strong>
                <small>Habits Today</small>
              </div>
            </div>
            <div className="stat-box">
              <BookOpen size={20} className="stat-box-icon journal-stat" />
              <div>
                <strong>12</strong>
                <small>Journal Entries</small>
              </div>
            </div>
            <div className="stat-box">
              <Flame size={20} className="stat-box-icon streak-stat" />
              <div>
                <strong>5 Days</strong>
                <small>Active Streak</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
