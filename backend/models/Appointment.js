const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    appointmentDate: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    consultationType: {
      type: String,
      enum: ["video", "chat", "in-clinic"],
      default: "video",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "in-progress", "completed", "cancelled", "no-show"],
      default: "pending",
    },
    symptoms: { type: String },
    notes: { type: String },
    fee: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded", "failed"],
      default: "pending",
    },
    paymentId: String,
    meetingRoomId: String,
    prescription: { type: mongoose.Schema.Types.ObjectId, ref: "Prescription" },
    followUp: { type: Boolean, default: false },
    followUpDate: Date,
    cancelReason: String,
    cancelledBy: { type: String, enum: ["patient", "doctor", "admin"] },
    duration: { type: Number, default: 30 }, // minutes
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
