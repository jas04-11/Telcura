const express = require("express");
const router = express.Router();
const {
  bookAppointment, getPatientAppointments, getDoctorAppointments,
  getAppointmentById, updateAppointmentStatus, cancelAppointment,
} = require("../controllers/appointment.controller");
const { protect, authorize } = require("../middleware/auth");

router.post("/", protect, authorize("patient"), bookAppointment);
router.get("/patient", protect, authorize("patient"), getPatientAppointments);
router.get("/doctor", protect, authorize("doctor"), getDoctorAppointments);
router.get("/:id", protect, getAppointmentById);
router.put("/:id/status", protect, updateAppointmentStatus);
router.delete("/:id", protect, cancelAppointment);

module.exports = router;
