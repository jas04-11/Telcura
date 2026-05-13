const express = require("express");
const router = express.Router();
const { symptomCheck, getPersonalizedRecommendations } = require("../controllers/ai.controller");
const { protect } = require("../middleware/auth");

router.post("/symptom-check", symptomCheck);
router.get("/recommendations", protect, getPersonalizedRecommendations);

module.exports = router;
