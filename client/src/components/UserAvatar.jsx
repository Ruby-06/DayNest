import React, { useState, useEffect } from "react";
import { getMediaUrl } from "../App.jsx";

export default function UserAvatar({ user, className = "", style = {} }) {
  const [hasError, setHasError] = useState(false);

  // Reset error state if avatar changes
  useEffect(() => {
    setHasError(false);
  }, [user?.avatar]);

  const avatarLetter = user?.name ? user.name.trim().slice(0, 1).toUpperCase() : "R";
  const avatarUrl = user?.avatar ? getMediaUrl(user.avatar) : null;

  if (avatarUrl && !hasError) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={`avatar-img-btn ${className}`}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "50%",
          display: "block",
          ...style
        }}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <span className={`avatar-letter-fallback ${className}`} style={{ fontStyle: "normal", ...style }}>
      {avatarLetter}
    </span>
  );
}
