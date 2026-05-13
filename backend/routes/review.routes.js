const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const { protect, authorize } = require("../middleware/auth");

router.post("/", protect, authorize("patient"), async (req, res) => {
  try {
    const existing = await Review.findOne({ patient: req.user._id, appointment: req.body.appointmentId });
    if (existing) return res.status(400).json({ success: false, message: "Already reviewed" });
    const review = await Review.create({ ...req.body, patient: req.user._id });
    res.status(201).json({ success: true, review });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get("/doctor/:doctorId", async (req, res) => {
  try {
    const reviews = await Review.find({ doctor: req.params.doctorId })
      .populate("patient", "name avatar")
      .sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, reviews });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
