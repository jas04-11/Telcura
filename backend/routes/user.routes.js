const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const { protect } = require("../middleware/auth");

router.put("/profile", protect, async (req, res) => {
  try {
    const allowed = ["name","phone","gender","dateOfBirth","bloodGroup","address","allergies","currentMedications","medicalHistory","notificationPrefs"];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get("/health-records", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("medicalHistory allergies currentMedications bloodGroup");
    const appointments = await Appointment.find({ patient: req.user._id, status: "completed" })
      .populate({ path: "doctor", populate: { path: "user", select: "name" } })
      .select("appointmentDate consultationType").limit(10);
    const prescriptions = await Prescription.find({ patient: req.user._id })
      .populate({ path: "doctor", populate: { path: "user", select: "name" } }).limit(10);
    res.json({ success: true, healthRecords: user, appointments, prescriptions });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
