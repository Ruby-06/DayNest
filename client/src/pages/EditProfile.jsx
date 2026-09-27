import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Save, X, User, Mail, FileText, Camera, UploadCloud } from "lucide-react";
import { getMediaUrl, api } from "../App.jsx";

export default function EditProfile({ user, onUpdateProfile }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.name || "Rithika Sree U.");
  const [email] = useState(user?.email || "rithika@example.com");
  const [bio, setBio] = useState(user?.bio || "Passionate about mindful daily reflection, habit building, and personal growth.");
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    // Validate File Type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const ext = file.name.split(".").pop().toLowerCase();
    const isAllowedExt = ["jpg", "jpeg", "png", "webp"].includes(ext);

    if (!allowedTypes.includes(file.mimetype) && !isAllowedExt) {
      setError("Please select a JPG, PNG, or WEBP image.");
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // Validate File Size (5 MB = 5 * 1024 * 1024 bytes)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("Saving...");

    try {
      let uploadedAvatarUrl = user?.avatar || "";

      // Upload file if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("avatar", selectedFile);

        const uploadRes = await api.post("/auth/profile-image", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        if (uploadRes.data?.avatar) {
          uploadedAvatarUrl = uploadRes.data.avatar;
        }
      }

      // Save name and bio
      if (onUpdateProfile) {
        await onUpdateProfile({
          name,
          bio,
          avatar: uploadedAvatarUrl
        });
      }

      setStatus("Profile updated successfully.");
      setTimeout(() => {
        navigate("/profile");
      }, 700);
    } catch (err) {
      console.error("Save profile error:", err);
      setStatus("");
      setError(err.response?.data?.message || "Failed to update profile. Please try again.");
    }
  };

  const currentPhoto = previewUrl || (user?.avatar ? getMediaUrl(user.avatar) : null);
  const avatarLetter = name ? name.slice(0, 1).toUpperCase() : "R";

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">PERSONAL SPACE</span>
          <h1>Edit Profile</h1>
        </div>
      </div>

      <div className="glass panel edit-profile-panel">
        <form onSubmit={handleSubmit} className="edit-profile-form">
          {error && <div className="error">{error}</div>}
          {status && <div className="form-status">{status}</div>}

          {/* Profile Photo Section */}
          <div className="profile-photo-section">
            <label className="photo-section-label">
              <Camera size={15} />
              <span>Profile Photo</span>
            </label>

            <div className="photo-preview-container">
              <div className="photo-preview-circle">
                {currentPhoto ? (
                  <img src={currentPhoto} alt="Profile Preview" className="photo-preview-img" />
                ) : (
                  <span className="photo-preview-letter">{avatarLetter}</span>
                )}
                <div className="camera-overlay-badge" onClick={() => fileInputRef.current?.click()} title="Change Photo">
                  <Camera size={14} />
                </div>
              </div>

              <div className="photo-actions">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  className="soft-button photo-choose-btn glass"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud size={16} />
                  <span>Choose Photo</span>
                </button>
                <small className="photo-hint">JPG, PNG, WEBP • Max 5 MB</small>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>
              <User size={15} />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <Mail size={15} />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="disabled-input"
            />
          </div>

          <div className="form-group">
            <label>
              <FileText size={15} />
              <span>Bio</span>
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a short bio about yourself"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="soft-button primary-btn glass">
              <Save size={16} />
              <span>Save Changes</span>
            </button>
            <button
              type="button"
              className="soft-button glass"
              onClick={() => navigate("/profile")}
            >
              <X size={16} />
              <span>Cancel</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
