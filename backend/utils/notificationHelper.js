const Notification = require("../models/Notification");
const { getIO } = require("../socket/socket");

/**
 * Create a DB notification AND push it via Socket.io in real time
 */
exports.sendNotification = async ({ userId, title, message, type = "system", link = "" }) => {
  try {
    // 1. Save to database
    const notification = await Notification.create({ user: userId, title, message, type, link });

    // 2. Push via Socket.io to the user's room (they join with their userId)
    try {
      const io = getIO();
      io.to(userId.toString()).emit("notification", {
        _id: notification._id,
        title,
        message,
        type,
        link,
        isRead: false,
        createdAt: notification.createdAt,
      });
    } catch (socketErr) {
      // Socket not initialized or user offline — notification still saved to DB
      console.log(`📢 Notification saved to DB (user offline): ${title}`);
    }

    return notification;
  } catch (err) {
    console.error("Notification error:", err.message);
  }
};
