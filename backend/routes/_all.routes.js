// ─── appointment.routes.js ───────────────────────────────────────────────────
const express = require("express");
const apptRouter = express.Router();
const {
  bookAppointment, getPatientAppointments, getDoctorAppointments,
  getAppointmentById, updateAppointmentStatus, cancelAppointment,
} = require("../controllers/appointment.controller");
const { protect, authorize } = require("../middleware/auth");

apptRouter.post("/", protect, authorize("patient"), bookAppointment);
apptRouter.get("/patient", protect, authorize("patient"), getPatientAppointments);
apptRouter.get("/doctor", protect, authorize("doctor"), getDoctorAppointments);
apptRouter.get("/:id", protect, getAppointmentById);
apptRouter.put("/:id/status", protect, updateAppointmentStatus);
apptRouter.delete("/:id", protect, cancelAppointment);

module.exports = { apptRouter };

// ─── prescription.routes.js ──────────────────────────────────────────────────
const prescRouter = express.Router();
const { createPrescription, getPatientPrescriptions, getPrescriptionById } = require("../controllers/prescription.controller");

prescRouter.post("/", protect, authorize("doctor"), createPrescription);
prescRouter.get("/patient", protect, authorize("patient"), getPatientPrescriptions);
prescRouter.get("/:id", protect, getPrescriptionById);

module.exports.prescRouter = prescRouter;

// ─── ai.routes.js ────────────────────────────────────────────────────────────
const aiRouter = express.Router();
const { symptomCheck, getPersonalizedRecommendations } = require("../controllers/ai.controller");

aiRouter.post("/symptom-check", symptomCheck);
aiRouter.get("/recommendations", protect, getPersonalizedRecommendations);

module.exports.aiRouter = aiRouter;

// ─── review.routes.js ────────────────────────────────────────────────────────
const reviewRouter = express.Router();
const Review = require("../models/Review");
const Doctor = require("../models/Doctor");

reviewRouter.post("/", protect, authorize("patient"), async (req, res) => {
  try {
    const existing = await Review.findOne({ patient: req.user._id, appointment: req.body.appointmentId });
    if (existing) return res.status(400).json({ success: false, message: "Already reviewed" });
    const review = await Review.create({ ...req.body, patient: req.user._id });
    res.status(201).json({ success: true, review });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

reviewRouter.get("/doctor/:doctorId", async (req, res) => {
  try {
    const reviews = await Review.find({ doctor: req.params.doctorId })
      .populate("patient", "name avatar")
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, reviews });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports.reviewRouter = reviewRouter;

// ─── notification.routes.js ──────────────────────────────────────────────────
const notifRouter = express.Router();
const Notification = require("../models/Notification");

notifRouter.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
    const unread = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.json({ success: true, notifications, unread });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

notifRouter.put("/mark-read", protect, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports.notifRouter = notifRouter;

// ─── user.routes.js ──────────────────────────────────────────────────────────
const userRouter = express.Router();
const User = require("../models/User");

userRouter.put("/profile", protect, async (req, res) => {
  try {
    const allowed = ["name", "phone", "gender", "dateOfBirth", "bloodGroup", "address", "allergies", "currentMedications", "medicalHistory", "notificationPrefs"];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

userRouter.get("/health-records", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("medicalHistory allergies currentMedications bloodGroup");
    const Appointment = require("../models/Appointment");
    const Prescription = require("../models/Prescription");
    const appointments = await Appointment.find({ patient: req.user._id, status: "completed" })
      .populate({ path: "doctor", populate: { path: "user", select: "name" } })
      .select("appointmentDate consultationType")
      .limit(10);
    const prescriptions = await Prescription.find({ patient: req.user._id })
      .populate({ path: "doctor", populate: { path: "user", select: "name" } })
      .limit(10);
    res.json({ success: true, healthRecords: user, appointments, prescriptions });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports.userRouter = userRouter;

// ─── admin.routes.js ─────────────────────────────────────────────────────────
const adminRouter = express.Router();

adminRouter.get("/dashboard", protect, authorize("admin"), async (req, res) => {
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
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ success: true, stats: { totalUsers, totalDoctors, totalAppointments, pendingDoctors }, recentAppointments });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

adminRouter.put("/doctors/:id/approve", protect, authorize("admin"), async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, { isApproved: req.body.isApproved }, { new: true });
    const user = await User.findById(doctor.user);
    await Notification.create({
      user: doctor.user,
      title: req.body.isApproved ? "Profile Approved!" : "Profile Rejected",
      message: req.body.isApproved ? "Your doctor profile has been approved. You can now receive patients." : "Your doctor profile was not approved. Please contact support.",
      type: "system",
    });
    res.json({ success: true, doctor });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

adminRouter.get("/doctors/pending", protect, authorize("admin"), async (req, res) => {
  try {
    const doctors = await Doctor.find({ isApproved: false }).populate("user", "name email avatar createdAt");
    res.json({ success: true, doctors });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

adminRouter.get("/users", protect, authorize("admin"), async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports.adminRouter = adminRouter;

// ─── payment.routes.js ───────────────────────────────────────────────────────
const paymentRouter = express.Router();

paymentRouter.post("/create-intent", protect, async (req, res) => {
  try {
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    const { amount, appointmentId } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // paise/cents
      currency: "inr",
      metadata: { appointmentId, userId: req.user._id.toString() },
    });
    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

paymentRouter.post("/confirm", protect, async (req, res) => {
  try {
    const { appointmentId, paymentId } = req.body;
    const appt = await Appointment.findByIdAndUpdate(appointmentId, { paymentStatus: "paid", paymentId, status: "confirmed" }, { new: true });
    res.json({ success: true, appointment: appt });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports.paymentRouter = paymentRouter;

// ─── consultation.routes.js ──────────────────────────────────────────────────
const consultRouter = express.Router();
const Message = require("../models/Message");

consultRouter.get("/:appointmentId/messages", protect, async (req, res) => {
  try {
    const messages = await Message.find({ appointment: req.params.appointmentId })
      .populate("sender", "name avatar role")
      .sort({ createdAt: 1 });
    res.json({ success: true, messages });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports.consultRouter = consultRouter;
