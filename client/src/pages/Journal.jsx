import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Save, Camera, Video, Tag, X, Upload, Plus, ChevronLeft, ChevronRight,
  Calendar as CalendarIcon, Sparkles, BookOpen, Images
} from "lucide-react";
import { api, moodMeta, getMediaUrl } from "../App.jsx";
import { localDateISO, formatLocalDate } from "../dateUtils.js";

export default function Journal() {
  const [searchParams] = useSearchParams();
  const initialDate = searchParams.get("date") || localDateISO();

  const [date, setDate] = useState(initialDate);
  const [mood, setMood] = useState("good");
  const [text, setText] = useState("");
  const [tagList, setTagList] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [saved, setSaved] = useState(false);
  const [entryId, setEntryId] = useState(null);
  const [media, setMedia] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [status, setStatus] = useState("");
  const [allEntries, setAllEntries] = useState([]);

  const load = async (targetDate) => {
    try {
      setStatus("");
      const { data } = await api.get("/entries");
      const list = data || [];
      setAllEntries(list);

      const e = list.find((x) => x.date === targetDate);
      setText(e?.journalText || "");
      setMood(e?.mood || "good");
      setTagList(e?.tags || []);
      setEntryId(e?._id || null);
      setMedia(e?.media || []);
      setPendingFiles([]);
    } catch (err) {
      console.error("Failed to load journal entry:", err);
      setStatus(err.response?.data?.message || "Could not load this journal entry.");
    }
  };

  useEffect(() => {
    load(date);
  }, [date]);

  const changeDate = (days) => {
    const [y, m, d] = date.split("-").map(Number);
    const currentObj = new Date(y, m - 1, d);
    currentObj.setDate(currentObj.getDate() + days);
    setDate(localDateISO(currentObj));
  };

  const addTag = (rawTag) => {
    const trimmed = rawTag.trim().replace(/^#/, "");
    if (trimmed && !tagList.includes(trimmed)) {
      setTagList((prev) => [...prev, trimmed]);
    }
    setTagInput("");
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const removeTag = (indexToRemove) => {
    setTagList((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleFileSelect = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const newPending = files.map((file) => {
      const isVideo = file.type.startsWith("video") || /\.(mp4|webm|ogg|mov|m4v)$/i.test(file.name);
      return {
        id: `${Date.now()}-${Math.random()}`,
        file,
        type: isVideo ? "video" : "image",
        previewUrl: URL.createObjectURL(file)
      };
    });

    setPendingFiles((prev) => [...prev, ...newPending]);
    setStatus("Media selected. Save entry to complete upload.");
  };

  const removePendingFile = (idToRemove) => {
    setPendingFiles((prev) => {
      const target = prev.find((p) => p.id === idToRemove);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== idToRemove);
    });
  };

  const uploadMediaFiles = async (filesToUpload, targetEntryId) => {
    if (!filesToUpload.length || !targetEntryId) return;

    setStatus("Uploading media files...");
    const formData = new FormData();
    filesToUpload.forEach((item) => formData.append("media", item.file));

    const { data } = await api.post(`/entries/${targetEntryId}/media`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    filesToUpload.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });

    setMedia(data.media || []);
    setPendingFiles([]);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      setStatus("Saving journal entry...");

      let finalTags = [...tagList];
      if (tagInput.trim() && !finalTags.includes(tagInput.trim())) {
        finalTags.push(tagInput.trim().replace(/^#/, ""));
        setTagList(finalTags);
        setTagInput("");
      }

      const payload = {
        date,
        mood,
        journalText: text,
        tags: finalTags
      };

      const { data } = await api.post("/entries", payload);
      setEntryId(data._id);
      setMedia(data.media || []);

      if (pendingFiles.length > 0) {
        await uploadMediaFiles(pendingFiles, data._id);
      }

      setSaved(true);
      setStatus("Journal entry saved successfully ✓");
      window.dispatchEvent(new Event("notifications_updated"));
      load(date);
      setTimeout(() => setSaved(false), 2400);
    } catch (err) {
      console.error("Failed to save journal entry:", err);
      setStatus(err.response?.data?.message || "Could not save the entry. Please try again.");
    }
  };

  const deleteUploadedMedia = async (mediaItem) => {
    if (!entryId) return;
    try {
      setStatus("Deleting media item...");
      let endpoint = `/entries/${entryId}/media`;
      if (mediaItem._id) {
        endpoint += `/${mediaItem._id}`;
      } else {
        endpoint += `?url=${encodeURIComponent(mediaItem.url)}`;
      }
      const { data } = await api.delete(endpoint);
      setMedia(data.media || []);
      setStatus("Media deleted successfully ✓");
      setTimeout(() => setStatus(""), 2000);
    } catch (err) {
      console.error("Failed to delete media:", err);
      setStatus(err.response?.data?.message || "Could not delete media item.");
    }
  };

  // Computations
  const wordCount = useMemo(() => {
    const trimmed = text.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [text]);

  const photoCount = useMemo(() => {
    const uploadedPhotos = media.filter((m) => m.type !== "video").length;
    const pendingPhotos = pendingFiles.filter((p) => p.type !== "video").length;
    return uploadedPhotos + pendingPhotos;
  }, [media, pendingFiles]);

  const videoCount = useMemo(() => {
    const uploadedVideos = media.filter((m) => m.type === "video").length;
    const pendingVideos = pendingFiles.filter((p) => p.type === "video").length;
    return uploadedVideos + pendingVideos;
  }, [media, pendingFiles]);

  const recentEntries = useMemo(() => {
    return allEntries
      .filter((x) => (x.journalText && x.journalText.trim()) || x.media?.length > 0)
      .slice(0, 6);
  }, [allEntries]);

  return (
    <section className="page journal-page-redesign">
      {/* 1. Header with Date Navigation */}
      <div className="page-heading journal-header-row">
        <div>
          <span className="eyebrow">YOUR STORY</span>
          <h1>Daily Journal</h1>
          <p>Write it down. Keep the moment.</p>
        </div>

        <div className="date-nav-group glass">
          <button
            type="button"
            className="icon-button date-arrow-btn"
            onClick={() => changeDate(-1)}
            title="Previous day"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="date-picker-box">
            <CalendarIcon size={15} className="calendar-icon-accent" />
            <span className="date-display-label">{formatLocalDate(date)}</span>
            <input
              type="date"
              className="hidden-date-picker"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="icon-button date-arrow-btn"
            onClick={() => changeDate(1)}
            title="Next day"
          >
            <ChevronRight size={18} />
          </button>

          <button
            type="button"
            className={`today-shortcut-btn ${date === localDateISO() ? "active" : ""}`}
            onClick={() => setDate(localDateISO())}
          >
            Today
          </button>
        </div>
      </div>

      {/* 2 & 7. Journal Writing Editor + Today at a glance Panel */}
      <div className="journal-main-layout">
        {/* Main Journal Editor Card */}
        <form className="glass panel journal-editor-card" onSubmit={save}>
          <div className="editor-card-header">
            <h2>How was your day?</h2>
            <p>Express your thoughts, feelings, and moments...</p>
          </div>

          {/* 3. Mood Selection */}
          <div className="mood-selection-section">
            <span className="section-sublabel">Select Mood</span>
            <div className="mood-choice-grid">
              {Object.entries(moodMeta).map(([k, m]) => (
                <button
                  type="button"
                  className={`mood-card-choice ${mood === k ? "selected" : ""}`}
                  key={k}
                  onClick={() => setMood(k)}
                >
                  <span className="mood-emoji">{m.emoji}</span>
                  <small className="mood-text">{m.label}</small>
                </button>
              ))}
            </div>
          </div>

          {/* Large Journal Text Area with Live Word Count */}
          <div className="textarea-container">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Dear diary, today..."
            />
            <span className="live-word-count-badge">{wordCount} words</span>
          </div>

          {/* 4. Tags Section */}
          <div className="tag-section">
            <div className="tag-input">
              <Tag size={16} />
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add tags (e.g. college, coding, friends) and press Enter"
              />
              <button
                type="button"
                className="soft-button tag-add-btn"
                onClick={() => addTag(tagInput)}
              >
                <Plus size={15} /> Add
              </button>
            </div>

            {tagList.length > 0 && (
              <div className="tag-list">
                {tagList.map((tag, i) => (
                  <span className="tag-chip" key={`${tag}-${i}`}>
                    #{tag}
                    <button
                      type="button"
                      className="tag-remove-btn"
                      onClick={() => removeTag(i)}
                      title="Remove tag"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 5. Photo & Video Upload Actions */}
          <div className="media-actions">
            <label className="soft-button media-btn">
              <Camera size={17} /> Add Photos
              <input
                hidden
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </label>
            <label className="soft-button media-btn">
              <Video size={17} /> Add Videos
              <input
                hidden
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </label>
          </div>

          {/* Pending files preview */}
          {pendingFiles.length > 0 && (
            <div className="pending-media-container">
              <div className="pending-media-header">
                <Upload size={16} />
                <span>{pendingFiles.length} file{pendingFiles.length > 1 ? "s" : ""} ready to upload upon saving</span>
              </div>
              <div className="journal-media-grid">
                {pendingFiles.map((item) => (
                  <div key={item.id} className={`media-preview-tile ${item.type === "video" ? "is-video" : ""}`}>
                    {item.type === "video" ? (
                      <video controls preload="auto" playsInline crossOrigin="anonymous">
                        <source src={item.previewUrl} />
                      </video>
                    ) : (
                      <img src={item.previewUrl} alt="Pending preview" />
                    )}
                    <button
                      type="button"
                      className="media-remove-badge"
                      onClick={() => removePendingFile(item.id)}
                      title="Remove media"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uploaded media files */}
          {media.length > 0 && (
            <div className="uploaded-media-container">
              <span className="eyebrow">ATTACHED MEMORIES</span>
              <div className="journal-media-grid">
                {media.map((m, i) => (
                  <div key={m._id || i} className={`media-tile ${m.type === "video" ? "is-video" : ""}`}>
                    {m.type === "video" ? (
                      <video controls preload="auto" playsInline crossOrigin="anonymous">
                        <source src={getMediaUrl(m.url)} type={m.url?.toLowerCase().endsWith(".mov") ? "video/mp4" : undefined} />
                        <source src={getMediaUrl(m.url)} />
                      </video>
                    ) : (
                      <img src={getMediaUrl(m.url)} alt={m.name || "Journal memory"} />
                    )}
                    <button
                      type="button"
                      className="media-remove-badge"
                      onClick={() => deleteUploadedMedia(m)}
                      title="Delete this photo/video"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {status && <div className="form-status">{status}</div>}

          {/* 6. Save Entry Button */}
          <button className="primary-button save-button-prominent" type="submit">
            <Save size={18} /> {saved ? "Journal entry saved ✓" : "Save Entry"}
          </button>
        </form>

        {/* 7 & 8. Today at a glance Panel */}
        <div className="glass panel glance-side-panel">
          <div className="glance-head">
            <Sparkles size={18} />
            <h3>Today at a glance</h3>
          </div>

          <div className="glance-stats-group">
            <div className="glance-row">
              <span className="glance-label">Selected mood</span>
              <strong className="glance-value">
                {moodMeta[mood]?.emoji} {moodMeta[mood]?.label || mood}
              </strong>
            </div>

            <div className="glance-row">
              <span className="glance-label">Word count</span>
              <strong className="glance-value">{wordCount} words</strong>
            </div>

            <div className="glance-row">
              <span className="glance-label">Attached moments</span>
              <strong className="glance-value">
                {photoCount} photo{photoCount === 1 ? "" : "s"} / {videoCount} video{videoCount === 1 ? "" : "s"}
              </strong>
            </div>

            <div className="glance-row">
              <span className="glance-label">Journal status</span>
              <span className={`status-pill ${saved || entryId ? "saved" : "unsaved"}`}>
                {saved || entryId ? "✓ Entry saved" : "Not saved yet"}
              </span>
            </div>
          </div>

          {/* 8. Motivational Quote */}
          <div className="glance-quote-box">
            <p>"Small moments today,<br />big memories tomorrow."</p>
          </div>
        </div>
      </div>

      {/* 9 & 10. Recent Journal Entries Section */}
      <div className="recent-entries-container">
        <div className="recent-section-head">
          <div>
            <h2>Recent Entries</h2>
            <p>A glimpse of your recent reflections.</p>
          </div>
        </div>

        {recentEntries.length > 0 ? (
          <div className="recent-entries-grid">
            {recentEntries.map((e) => (
              <div
                key={e._id || e.date}
                className={`glass panel recent-entry-card ${e.date === date ? "is-selected-date" : ""}`}
                onClick={() => setDate(e.date)}
              >
                <div className="recent-card-header">
                  <span className="recent-date-text">{formatLocalDate(e.date)}</span>
                  <span className="recent-mood-emoji">{moodMeta[e.mood]?.emoji || "😐"}</span>
                </div>

                <p className="recent-card-text">
                  {e.journalText ? e.journalText.slice(0, 110) + (e.journalText.length > 110 ? "..." : "") : "No journal text written."}
                </p>

                <div className="recent-card-bottom">
                  <span className="mood-pill">{moodMeta[e.mood]?.label || e.mood}</span>
                  {e.media?.length > 0 && (
                    <span className="media-count-badge">
                      <Images size={12} /> {e.media.length}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass panel empty-recent-card">
            <BookOpen size={36} opacity={0.4} />
            <h3>No journal entries yet</h3>
            <p>Start writing today and your reflections will appear here.</p>
          </div>
        )}
      </div>
    </section>
  );
}
