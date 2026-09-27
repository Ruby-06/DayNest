import React, { useEffect, useMemo, useState } from "react";
import { Images, Video, Camera, Plus, Image as ImageIcon, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api, getMediaUrl } from "../App.jsx";
import { formatLocalDate } from "../dateUtils.js";

export default function Memories() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/entries");
      setEntries(data || []);
      setError("");
    } catch (err) {
      console.error("Failed to load memories:", err);
      setError(err.response?.data?.message || "Could not load memories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleDelete = async (item) => {
    if (!item.entryId) return;
    try {
      setStatus("Deleting media...");
      let endpoint = `/entries/${item.entryId}/media`;
      if (item._id) {
        endpoint += `/${item._id}`;
      } else {
        endpoint += `?url=${encodeURIComponent(item.url)}`;
      }
      await api.delete(endpoint);
      setStatus("Media deleted ✓");
      fetchMemories();
      setTimeout(() => setStatus(""), 2000);
    } catch (err) {
      console.error("Failed to delete memory:", err);
      setStatus(err.response?.data?.message || "Could not delete media.");
    }
  };

  const uploadedMedia = useMemo(() => {
    const list = [];
    entries.forEach((e) => {
      (e.media || []).forEach((m) => {
        if (m.url) {
          list.push({ ...m, date: e.date, entryId: e._id });
        }
      });
    });
    return list;
  }, [entries]);

  const filteredMedia = useMemo(() => {
    if (filter === "photos") return uploadedMedia.filter((x) => x.type === "image");
    if (filter === "videos") return uploadedMedia.filter((x) => x.type === "video");
    return uploadedMedia;
  }, [uploadedMedia, filter]);

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">MEMORY VAULT</span>
          <h1>Memories</h1>
          <p>Photos, videos and little moments worth keeping.</p>
        </div>

        <div className="filter-tabs glass">
          <button
            type="button"
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            <Images size={15} /> All ({uploadedMedia.length})
          </button>
          <button
            type="button"
            className={`filter-btn ${filter === "photos" ? "active" : ""}`}
            onClick={() => setFilter("photos")}
          >
            <Camera size={15} /> Photos ({uploadedMedia.filter((x) => x.type === "image").length})
          </button>
          <button
            type="button"
            className={`filter-btn ${filter === "videos" ? "active" : ""}`}
            onClick={() => setFilter("videos")}
          >
            <Video size={15} /> Videos ({uploadedMedia.filter((x) => x.type === "video").length})
          </button>
        </div>
      </div>

      {status && <div className="glass panel form-status">{status}</div>}
      {error && <div className="glass panel form-status">{error}</div>}

      {filteredMedia.length > 0 ? (
        <div className="memory-grid">
          {filteredMedia.map((item, i) => (
            <MemoryCard key={item._id || i} item={item} onDelete={() => handleDelete(item)} />
          ))}
        </div>
      ) : (
        <div className="glass panel empty-memories-full">
          <Images size={48} opacity={0.4} />
          <h2>No {filter === "all" ? "memories" : filter} uploaded yet</h2>
          <p>Attach photos and videos to your daily journal entries to build your personal memory vault.</p>
          <button type="button" className="primary-button" onClick={() => navigate("/journal")}>
            <Plus size={16} /> Open Daily Journal
          </button>
        </div>
      )}
    </section>
  );
}

function MemoryCard({ item, onDelete }) {
  const [hasError, setHasError] = useState(false);
  const mediaSrc = getMediaUrl(item.url);

  return (
    <div className={`memory-tile glass ${item.type === "video" ? "video-card" : ""}`}>
      <button
        type="button"
        className="media-remove-badge"
        onClick={onDelete}
        title="Delete photo/video"
      >
        <Trash2 size={13} />
      </button>

      {!hasError ? (
        item.type === "video" ? (
          <div className="video-wrapper">
            <video
              controls
              preload="auto"
              playsInline
              crossOrigin="anonymous"
              onError={() => setHasError(true)}
            >
              <source src={mediaSrc} type={item.url?.toLowerCase().endsWith(".mov") ? "video/mp4" : undefined} />
              <source src={mediaSrc} />
              Your browser cannot stream this video directly.
            </video>
          </div>
        ) : (
          <img
            src={mediaSrc}
            alt=""
            onError={() => setHasError(true)}
          />
        )
      ) : (
        <div className="memory-placeholder-fallback">
          <ImageIcon size={34} opacity={0.45} />
          <span>{item.type === "video" ? "Video Memory" : "Photo Memory"}</span>
          {item.type === "video" && (
            <a href={mediaSrc} target="_blank" rel="noreferrer" className="open-media-link">
              Open Video in New Tab
            </a>
          )}
        </div>
      )}

      <div className="memory-caption">
        <div>
          <strong>{formatLocalDate(item.date)}</strong>
          <small>{item.type === "video" ? "Video memory" : "Photo memory"}</small>
        </div>
        {item.type === "video" && (
          <a
            href={mediaSrc}
            target="_blank"
            rel="noreferrer"
            className="video-direct-link"
            title="Open video file in browser"
          >
            ↗ Open
          </a>
        )}
      </div>
    </div>
  );
}

