const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  day: { type: String, enum: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"] },
  startTime: String,
  endTime: String,
  isAvailable: { type: Boolean, default: true },
});

const doctorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    specialization: { type: String, required: true },
    subSpecialization: [String],
    qualifications: [
      {
        degree: String,
        institution: String,
        year: Number,
      },
    ],
    experience: { type: Number, required: true }, // years
    licenseNumber: { type: String, required: true, unique: true },
    licenseExpiry: Date,
    consultationFee: { type: Number, required: true },
    followUpFee: { type: Number },
    about: { type: String },
    languages: [String],
    hospital: {
      name: String,
      address: String,
      city: String,
    },
    availability: [slotSchema],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    totalConsultations: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    videoConsultation: { type: Boolean, default: true },
    chatConsultation: { type: Boolean, default: true },
    inClinic: { type: Boolean, default: false },
    awards: [String],
    publications: [String],
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      accountName: String,
    },
    earnings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Virtual for full doctor info
doctorSchema.virtual("fullInfo", {
  ref: "User",
  localField: "user",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.model("Doctor", doctorSchema);
