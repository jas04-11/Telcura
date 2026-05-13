// import React, { createContext, useContext, useEffect, useState } from "react";
// import { io } from "socket.io-client";
// import { useAuth } from "./AuthContext.jsx";

// const SocketContext = createContext();

// export const SocketProvider = ({ children }) => {
//   const { user } = useAuth();
//   const [socket, setSocket] = useState(null);
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const [notifications, setNotifications] = useState([]);

//   useEffect(() => {
//     if (!user) return;

//     const s = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
//       transports: ["websocket"],
//     });

//     s.on("connect", () => {
//       s.emit("join", user._id);
//     });

//     s.on("onlineUsers", (users) => setOnlineUsers(users));

//     s.on("notification", (notif) => {
//       setNotifications((prev) => [notif, ...prev]);
//     });

//     setSocket(s);

//     return () => {
//       s.disconnect();
//     };
//   }, [user]);

//   const isOnline = (userId) => onlineUsers.includes(userId);

//   return (
//     <SocketContext.Provider value={{ socket, onlineUsers, isOnline, notifications, setNotifications }}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export const useSocket = () => useContext(SocketContext);
import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext.jsx";
import api from "../utils/api.js";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch existing notifications from DB on login
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    api.get("/notifications").then(({ data }) => {
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unread);
      }
    }).catch(() => {});
  }, [user]);

  // Socket connection
  useEffect(() => {
    if (!user) return;

    const s = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    s.on("connect", () => {
      console.log("✅ Socket connected");
      s.emit("join", user._id);
    });

    s.on("disconnect", () => console.log("❌ Socket disconnected"));

    s.on("onlineUsers", (users) => setOnlineUsers(users));

    // Real-time notification pushed by server
    s.on("notification", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    setSocket(s);

    return () => { s.disconnect(); };
  }, [user]);

  const isOnline = (userId) => onlineUsers.includes(userId?.toString());

  const markAllRead = async () => {
    try {
      await api.put("/notifications/mark-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const markOneRead = (id) => {
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isOnline, notifications, unreadCount, markAllRead, markOneRead }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
