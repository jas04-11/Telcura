const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const { protect } = require("../middleware/auth");

router.get("/:appointmentId/messages", protect, async (req, res) => {
  try {
    const messages = await Message.find({ appointment: req.params.appointmentId })
      .populate("sender", "name avatar role")
      .sort({ createdAt: 1 });
    res.json({ success: true, messages });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
