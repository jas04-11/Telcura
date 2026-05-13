const express = require("express");
const router = express.Router();
const {
  getAllDoctors, getDoctorById, updateDoctorProfile,
  getDoctorDashboard, getDoctorAvailability, updateAvailability,
  getSpecializations, toggleOnlineStatus,
} = require("../controllers/doctor.controller");
const { protect, authorize } = require("../middleware/auth");

router.get("/", getAllDoctors);
router.get("/specializations", getSpecializations);
router.get("/dashboard", protect, authorize("doctor"), getDoctorDashboard);
router.put("/profile", protect, authorize("doctor"), updateDoctorProfile);
router.put("/availability", protect, authorize("doctor"), updateAvailability);
router.put("/toggle-online", protect, authorize("doctor"), toggleOnlineStatus);
router.get("/:id", getDoctorById);
router.get("/:id/availability", getDoctorAvailability);

module.exports = router;
