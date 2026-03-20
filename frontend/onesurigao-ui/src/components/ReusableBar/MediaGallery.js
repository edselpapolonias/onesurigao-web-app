// src/components/ReusableBar/MediaGallery.js
import React, { useState } from "react";

// ─── Lightbox Modal ───────────────────────────────────────────────────────────

const LightboxModal = ({ media, startIndex, onClose }) => {
  const [current, setCurrent] = useState(startIndex);

  const goPrev = (e) => { e.stopPropagation(); setCurrent(i => (i - 1 + media.length) % media.length); };
  const goNext = (e) => { e.stopPropagation(); setCurrent(i => (i + 1) % media.length); };

  const item = media[current];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 2000, padding: 20,
      }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        style={{
          position: "absolute", top: 16, right: 16,
          background: "rgba(255,255,255,0.15)", border: "none",
          color: "#fff", borderRadius: "50%", width: 40, height: 40,
          cursor: "pointer", fontSize: 20, display: "flex",
          alignItems: "center", justifyContent: "center",
          transition: "background 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
      >✕</button>

      {/* Counter */}
      <div style={{
        position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)",
        color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "'Segoe UI', sans-serif",
        background: "rgba(0,0,0,0.4)", padding: "4px 14px", borderRadius: 20,
      }}>
        {current + 1} / {media.length}
      </div>

      {/* Prev Button */}
      {media.length > 1 && (
        <button
          onClick={goPrev}
          style={{
            position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.15)", border: "none", color: "#fff",
            borderRadius: "50%", width: 44, height: 44, cursor: "pointer",
            fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
        >‹</button>
      )}

      {/* Media */}
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: "90vw", maxHeight: "85vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {item.mediaType === "image" ? (
          <img
            src={item.file}
            alt={`media-${current}`}
            style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: 10, objectFit: "contain", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}
          />
        ) : (
          <video
            src={item.file}
            controls
            autoPlay
            style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: 10, background: "#000" }}
          />
        )}
      </div>

      {/* Next Button */}
      {media.length > 1 && (
        <button
          onClick={goNext}
          style={{
            position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.15)", border: "none", color: "#fff",
            borderRadius: "50%", width: 44, height: 44, cursor: "pointer",
            fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
        >›</button>
      )}

      {/* Thumbnail Strip (if more than 1) */}
      {media.length > 1 && (
        <div style={{
          position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
          display: "flex", gap: 8, padding: "8px 12px",
          background: "rgba(0,0,0,0.5)", borderRadius: 12,
        }}>
          {media.map((m, i) => (
            <div
              key={i}
              onClick={e => { e.stopPropagation(); setCurrent(i); }}
              style={{
                width: 48, height: 36, borderRadius: 6, overflow: "hidden", cursor: "pointer",
                border: i === current ? "2px solid #fff" : "2px solid transparent",
                opacity: i === current ? 1 : 0.55,
                transition: "all 0.15s", flexShrink: 0,
              }}
            >
              {m.mediaType === "image" ? (
                <img src={m.file} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "#333", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontSize: 14 }}>▶</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Media Gallery ────────────────────────────────────────────────────────────

const MediaGallery = ({ media }) => {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (!media || media.length === 0) return null;

  const MAX_VISIBLE = 4;
  const visible = media.slice(0, MAX_VISIBLE);
  const remaining = media.length - MAX_VISIBLE;

  // ── Layout helpers ──
  const gridStyle = (count) => {
    if (count === 1) return { display: "block" };
    if (count === 2) return { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 };
    if (count === 3) return { display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "auto auto", gap: 3 };
    return { display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 3 };
  };

  const itemHeight = (count, index) => {
    if (count === 1) return 320;
    if (count === 2) return 220;
    if (count === 3) return index === 0 ? 220 : 160;
    return 180;
  };

  const itemStyle = (count, index) => ({
    position: "relative",
    overflow: "hidden",
    borderRadius: count === 1 ? 10 : (
      index === 0 ? "10px 0 0 10px" :
      index === 1 ? "0 10px 10px 0" :
      index === 2 ? "0 0 0 10px" : "0 0 10px 0"
    ),
    cursor: "pointer",
    height: itemHeight(count, index),
    gridColumn: count === 3 && index === 0 ? "1 / 2" : "auto",
    gridRow: count === 3 && index === 0 ? "1 / 3" : "auto",
    background: "#1a1a2e",
  });

  return (
    <div style={{ padding: "0 18px 14px" }}>
      <div style={gridStyle(visible.length)}>
        {visible.map((m, i) => (
          <div
            key={i}
            style={itemStyle(visible.length, i)}
            onClick={() => setLightboxIndex(i)}
            onMouseEnter={e => e.currentTarget.querySelector(".media-overlay").style.opacity = "1"}
            onMouseLeave={e => e.currentTarget.querySelector(".media-overlay").style.opacity = "0"}
          >
            {/* Media */}
            {m.mediaType === "image" ? (
              <img
                src={m.file}
                alt={`media-${i}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.3s" }}
              />
            ) : (
              <div style={{ width: "100%", height: "100%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <video src={m.file} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 18, marginLeft: 3 }}>▶</span>
                </div>
              </div>
            )}

            {/* Hover Overlay */}
            <div
              className="media-overlay"
              style={{
                position: "absolute", inset: 0,
                background: "rgba(0,0,0,0.25)",
                opacity: 0, transition: "opacity 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            </div>

            {/* +N overlay on last visible item */}
            {i === MAX_VISIBLE - 1 && remaining > 0 && (
              <div style={{
                position: "absolute", inset: 0,
                background: "rgba(0,0,0,0.55)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column", gap: 4,
              }}>
                <span style={{ color: "#fff", fontSize: 28, fontWeight: 800, fontFamily: "'Segoe UI', sans-serif", lineHeight: 1 }}>
                  +{remaining}
                </span>
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, fontFamily: "'Segoe UI', sans-serif" }}>
                  more
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <LightboxModal
          media={media}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
};

export default MediaGallery;