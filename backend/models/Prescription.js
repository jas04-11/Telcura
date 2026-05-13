const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    diagnosis: { type: String, required: true },
    medicines: [
      {
        name: { type: String, required: true },
        dosage: String,
        frequency: String,
        duration: String,
        instructions: String,
      },
    ],
    tests: [
      {
        name: String,
        instructions: String,
      },
    ],
    advice: String,
    followUpDate: Date,
    isActive: { type: Boolean, default: true },
    aiGenerated: { type: Boolean, default: false },
    doctorSignature: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);
