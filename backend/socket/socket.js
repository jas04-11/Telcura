const { Server } = require("socket.io");
const Message = require("../models/Message");
const Appointment = require("../models/Appointment");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const activeUsers = new Map(); // userId -> socketId
  const videoRooms = new Map(); // roomId -> [socketIds]

  io.on("connection", (socket) => {
    //console.log(`🔌 Socket connected: ${socket.id}`);

    // User joins with their userId
    socket.on("join", (userId) => {
      activeUsers.set(userId, socket.id);
      socket.join(userId);
      console.log(`👤 User ${userId} joined`);
      io.emit("onlineUsers", Array.from(activeUsers.keys()));
    });

    // Chat consultation room
    socket.on("joinConsultation", async ({ appointmentId, userId }) => {
      socket.join(`consultation:${appointmentId}`);
      
      // Load chat history
      const messages = await Message.find({ appointment: appointmentId })
        .populate("sender", "name avatar role")
        .sort({ createdAt: 1 })
        .limit(50);
      
      socket.emit("chatHistory", messages);
      socket.to(`consultation:${appointmentId}`).emit("userJoined", { userId });
    });

    // Send message in consultation
    socket.on("sendMessage", async ({ appointmentId, senderId, senderRole, content, type = "text", fileUrl, fileName }) => {
      try {
        const message = await Message.create({
          appointment: appointmentId,
          sender: senderId,
          senderRole,
          content,
          type,
          fileUrl,
          fileName,
        });

        await message.populate("sender", "name avatar role");

        io.to(`consultation:${appointmentId}`).emit("newMessage", message);
      } catch (err) {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Typing indicator
    socket.on("typing", ({ appointmentId, userId, isTyping }) => {
      socket.to(`consultation:${appointmentId}`).emit("userTyping", { userId, isTyping });
    });

    // Video call signaling (WebRTC)
    socket.on("joinVideoRoom", ({ roomId, userId }) => {
      socket.join(`video:${roomId}`);
      if (!videoRooms.has(roomId)) videoRooms.set(roomId, []);
      videoRooms.get(roomId).push({ socketId: socket.id, userId });
      
      // Notify others in room
      socket.to(`video:${roomId}`).emit("userJoinedVideo", { userId, socketId: socket.id });
      
      // Send existing peers to new user
      const peers = videoRooms.get(roomId).filter((p) => p.socketId !== socket.id);
      socket.emit("existingPeers", peers);
    });

    socket.on("videoOffer", ({ to, offer, from }) => {
      io.to(to).emit("videoOffer", { offer, from });
    });

    socket.on("videoAnswer", ({ to, answer, from }) => {
      io.to(to).emit("videoAnswer", { answer, from });
    });

    socket.on("iceCandidate", ({ to, candidate }) => {
      io.to(to).emit("iceCandidate", { candidate });
    });

    socket.on("endCall", ({ roomId }) => {
      io.to(`video:${roomId}`).emit("callEnded");
      videoRooms.delete(roomId);
    });

    // Notification
    socket.on("sendNotification", ({ userId, notification }) => {
      io.to(userId).emit("notification", notification);
    });

    // Disconnect
    socket.on("disconnect", () => {
      for (const [userId, socketId] of activeUsers.entries()) {
        if (socketId === socket.id) {
          activeUsers.delete(userId);
          break;
        }
      }
      io.emit("onlineUsers", Array.from(activeUsers.keys()));
      //console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

module.exports = { initSocket, getIO };


// const { Server } = require("socket.io");
// const Message = require("../models/Message");

// let io;

// const initSocket = (server) => {
//   io = new Server(server, {
//     cors: {
//       origin: process.env.CLIENT_URL || "*",
//       methods: ["GET", "POST"],
//       credentials: true,
//     },
//   });

//   const activeUsers = new Map(); // userId -> socketId
//   const videoRooms = new Map(); // roomId -> [{ socketId, userId }]

//   io.on("connection", (socket) => {
//     console.log("🔌 Connected:", socket.id);

//     // ---------------- USER ONLINE ----------------
//     socket.on("join", (userId) => {
//       activeUsers.set(userId, socket.id);
//       socket.join(userId);

//       io.emit("onlineUsers", Array.from(activeUsers.keys()));
//     });

//     // ---------------- CHAT ROOM ----------------
//     socket.on("joinConsultation", async ({ appointmentId, userId }) => {
//       const room = `consultation:${appointmentId}`;
//       socket.join(room);

//       try {
//         const messages = await Message.find({ appointment: appointmentId })
//           .populate("sender", "name avatar role")
//           .sort({ createdAt: 1 })
//           .limit(50);

//         socket.emit("chatHistory", messages);
//       } catch (err) {
//         console.error(err);
//       }

//       socket.to(room).emit("userJoined", { userId });
//     });

//     // ---------------- SEND MESSAGE ----------------
//     socket.on("sendMessage", async (data) => {
//       try {
//         const message = await Message.create(data);
//         await message.populate("sender", "name avatar role");

//         io.to(`consultation:${data.appointmentId}`).emit("newMessage", message);
//       } catch (err) {
//         socket.emit("error", { message: "Message failed" });
//       }
//     });

//     // ---------------- TYPING ----------------
//     socket.on("typing", ({ appointmentId, userId, isTyping }) => {
//       socket.to(`consultation:${appointmentId}`).emit("userTyping", {
//         userId,
//         isTyping,
//       });
//     });

//     // ================== VIDEO CALL ==================

//     // JOIN VIDEO ROOM
//     socket.on("joinVideoRoom", ({ roomId, userId }) => {
//       const room = `video:${roomId}`;
//       socket.join(room);

//       if (!videoRooms.has(roomId)) {
//         videoRooms.set(roomId, []);
//       }

//       videoRooms.get(roomId).push({
//         socketId: socket.id,
//         userId,
//       });

//       // Send existing peers to new user
//       const peers = videoRooms
//         .get(roomId)
//         .filter((p) => p.socketId !== socket.id);

//       socket.emit("existingPeers", peers);

//       // Notify others
//       socket.to(room).emit("userJoinedVideo", {
//         socketId: socket.id,
//         userId,
//       });
//     });

//     // OFFER
//     socket.on("videoOffer", ({ to, offer, from }) => {
//       io.to(to).emit("videoOffer", { offer, from });
//     });

//     // ANSWER
//     socket.on("videoAnswer", ({ to, answer, from }) => {
//       io.to(to).emit("videoAnswer", { answer, from });
//     });

//     // ICE
//     socket.on("iceCandidate", ({ to, candidate }) => {
//       io.to(to).emit("iceCandidate", { candidate });
//     });

//     // END CALL
//     socket.on("endCall", ({ roomId }) => {
//       io.to(`video:${roomId}`).emit("callEnded");
//       videoRooms.delete(roomId);
//     });

//     // ---------------- NOTIFICATIONS ----------------
//     socket.on("sendNotification", ({ userId, notification }) => {
//       io.to(userId).emit("notification", notification);
//     });

//     // ---------------- DISCONNECT ----------------
//     socket.on("disconnect", () => {
//       console.log("❌ Disconnected:", socket.id);

//       // Remove from active users
//       for (const [userId, socketId] of activeUsers.entries()) {
//         if (socketId === socket.id) {
//           activeUsers.delete(userId);
//           break;
//         }
//       }

//       io.emit("onlineUsers", Array.from(activeUsers.keys()));

//       // Remove from video rooms
//       for (const [roomId, users] of videoRooms.entries()) {
//         const filtered = users.filter((u) => u.socketId !== socket.id);

//         if (filtered.length === 0) {
//           videoRooms.delete(roomId);
//         } else {
//           videoRooms.set(roomId, filtered);
//         }
//       }
//     });
//   });

//   return io;
// };

// const getIO = () => {
//   if (!io) throw new Error("Socket not initialized");
//   return io;
// };

// module.exports = { initSocket, getIO };