const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Notification = require("../models/Notification");
const { protect, authorize } = require("../middleware/auth");

router.get("/dashboard", protect, authorize("admin"), async (req, res) => {
  try {
    const [totalUsers, totalDoctors, totalAppointments, pendingDoctors] = await Promise.all([
      User.countDocuments({ role: "patient" }),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      Doctor.countDocuments({ isApproved: false }),
    ]);
    const recentAppointments = await Appointment.find()
      .populate("patient", "name")
      .populate({ path: "doctor", populate: { path: "user", select: "name" } })
      .sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, stats: { totalUsers, totalDoctors, totalAppointments, pendingDoctors }, recentAppointments });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put("/doctors/:id/approve", protect, authorize("admin"), async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, { isApproved: req.body.isApproved }, { new: true });
    await Notification.create({
      user: doctor.user,
      title: req.body.isApproved ? "Profile Approved!" : "Profile Rejected",
      message: req.body.isApproved ? "Your doctor profile has been approved." : "Your profile was not approved.",
      type: "system",
    });
    res.json({ success: true, doctor });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get("/doctors/pending", protect, authorize("admin"), async (req, res) => {
  try {
    const doctors = await Doctor.find({ isApproved: false }).populate("user", "name email avatar createdAt");
    res.json({ success: true, doctors });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get("/users", protect, authorize("admin"), async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
