import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiX } from "react-icons/fi";
import { useSocket } from "../../context/SocketContext.jsx";
import { format } from "date-fns";

const typeIcon = {
  appointment: "📅",
  prescription: "💊",
  payment: "💳",
  reminder: "⏰",
  system: "📢",
  chat: "💬",
};

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead, markOneRead } = useSocket();
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const bellRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Calculate dropdown position from bell button's screen coords
  const handleToggle = () => {
    if (!open && bellRef.current) {
      const rect = bellRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.top,
        left: rect.right + 12, // 12px gap to the right of sidebar
      });
    }
    setOpen((prev) => !prev);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        bellRef.current && !bellRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on scroll/resize
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, []);

  const handleClick = (notif) => {
    markOneRead(notif._id);
    setOpen(false);
    if (notif.link) navigate(notif.link);
  };

  // Clamp so dropdown never goes off-screen bottom
  const viewportHeight = window.innerHeight;
  const dropdownHeight = 400;
  const clampedTop = Math.min(dropdownPos.top, viewportHeight - dropdownHeight - 16);

  return (
    <>
      {/* Bell button */}
      <button
        ref={bellRef}
        onClick={handleToggle}
        style={{
          position: "relative", width: 36, height: 36, borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.12)", background: open ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
          color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 16, transition: "all 0.2s", flexShrink: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
        onMouseLeave={e => !open && (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
      >
        <FiBell />
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            width: 18, height: 18, background: "#ef4444",
            borderRadius: "50%", fontSize: 10, fontWeight: 700,
            color: "#fff", display: "flex", alignItems: "center",
            justifyContent: "center", border: "2px solid #0d1b2a",
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown — rendered via portal-like fixed positioning, fully outside sidebar */}
      {open && (
        <div
          ref={dropdownRef}
          style={{
            position: "fixed",
            top: clampedTop,
            left: dropdownPos.left,
            width: 320,
            background: "#1b2f45",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
            zIndex: 9999,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div>
              <p style={{ color: "#fff", fontSize: 14, fontWeight: 600, margin: 0 }}>Notifications</p>
              {unreadCount > 0 && <p style={{ color: "#7dd3f0", fontSize: 11, margin: "2px 0 0" }}>{unreadCount} unread</p>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {unreadCount > 0 && (
                <button onClick={markAllRead} style={{
                  background: "rgba(10,126,164,0.2)", border: "1px solid rgba(10,126,164,0.3)",
                  color: "#7dd3f0", fontSize: 11, padding: "4px 10px", borderRadius: "6px",
                  cursor: "pointer", fontFamily: "inherit",
                }}>
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} style={{
                background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: 2,
              }}>
                <FiX size={14} />
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: 340, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "#64748b", fontSize: 13 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
                <p>No notifications yet</p>
              </div>
            ) : notifications.map((n) => (
              <div key={n._id} onClick={() => handleClick(n)} style={{
                display: "flex", gap: 12, padding: "12px 16px", cursor: "pointer",
                background: n.isRead ? "transparent" : "rgba(10,126,164,0.08)",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                transition: "background 0.15s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                onMouseLeave={e => e.currentTarget.style.background = n.isRead ? "transparent" : "rgba(10,126,164,0.08)"}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: "8px",
                  background: "rgba(255,255,255,0.06)", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: 16, flexShrink: 0,
                }}>
                  {typeIcon[n.type] || "📢"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 13, fontWeight: n.isRead ? 400 : 600,
                    color: n.isRead ? "#94a3b8" : "#e2e8f0", margin: "0 0 2px",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>{n.title}</p>
                  <p style={{
                    fontSize: 12, color: "#64748b", margin: 0,
                    display: "-webkit-box", WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>{n.message}</p>
                  <p style={{ fontSize: 11, color: "#475569", margin: "4px 0 0" }}>
                    {n.createdAt ? format(new Date(n.createdAt), "MMM dd, hh:mm a") : "Just now"}
                  </p>
                </div>
                {!n.isRead && (
                  <div style={{ width: 8, height: 8, background: "#0a7ea4", borderRadius: "50%", flexShrink: 0, marginTop: 4 }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}