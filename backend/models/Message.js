const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: { type: String, enum: ["patient", "doctor"] },
    content: { type: String },
    type: { type: String, enum: ["text", "image", "file", "audio"], default: "text" },
    fileUrl: String,
    fileName: String,
    isRead: { type: Boolean, default: false },
    readAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
