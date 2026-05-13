const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const { protect } = require("../middleware/auth");

router.post("/create-intent", protect, async (req, res) => {
  try {
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    const { amount, appointmentId } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "inr",
      metadata: { appointmentId, userId: req.user._id.toString() },
    });
    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post("/confirm", protect, async (req, res) => {
  try {
    const { appointmentId, paymentId } = req.body;
    const appt = await Appointment.findByIdAndUpdate(appointmentId, { paymentStatus: "paid", paymentId, status: "confirmed" }, { new: true });
    res.json({ success: true, appointment: appt });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
