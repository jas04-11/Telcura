// const Prescription = require("../models/Prescription");
// const Appointment = require("../models/Appointment");
// const Doctor = require("../models/Doctor");
// const Notification = require("../models/Notification");

// // @route POST /api/prescriptions
// exports.createPrescription = async (req, res) => {
//   try {
//     const { appointmentId, diagnosis, medicines, tests, advice, followUpDate } = req.body;

//     const doctor = await Doctor.findOne({ user: req.user._id });
//     if (!doctor) return res.status(404).json({ success: false, message: "Doctor profile not found" });

//     const appointment = await Appointment.findById(appointmentId).populate("patient", "name email");
//     if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

//     const prescription = await Prescription.create({
//       appointment: appointmentId,
//       patient: appointment.patient._id,
//       doctor: doctor._id,
//       diagnosis,
//       medicines,
//       tests,
//       advice,
//       followUpDate,
//     });

//     // Link prescription to appointment
//     appointment.prescription = prescription._id;
//     appointment.status = "completed";
//     await appointment.save();

//     // Update doctor stats
//     doctor.totalConsultations += 1;
//     doctor.earnings += appointment.fee;
//     await doctor.save();

//     // Notify patient
//     await Notification.create({
//       user: appointment.patient._id,
//       title: "Prescription Ready",
//       message: "Your doctor has written a prescription. Click to view.",
//       type: "prescription",
//       link: `/patient/prescriptions/${prescription._id}`,
//     });

//     res.status(201).json({ success: true, prescription });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // @route GET /api/prescriptions/patient
// exports.getPatientPrescriptions = async (req, res) => {
//   try {
//     const prescriptions = await Prescription.find({ patient: req.user._id })
//       .populate({ path: "doctor", populate: { path: "user", select: "name avatar" } })
//       .populate("appointment", "appointmentDate consultationType")
//       .sort({ createdAt: -1 });

//     res.json({ success: true, prescriptions });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // @route GET /api/prescriptions/:id
// exports.getPrescriptionById = async (req, res) => {
//   try {
//     const prescription = await Prescription.findById(req.params.id)
//       .populate("patient", "name dateOfBirth gender bloodGroup")
//       .populate({ path: "doctor", populate: { path: "user", select: "name avatar" } })
//       .populate("appointment");

//     if (!prescription) return res.status(404).json({ success: false, message: "Prescription not found" });
//     res.json({ success: true, prescription });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };
const Prescription = require("../models/Prescription");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const { sendEmail } = require("../utils/email");
const { sendNotification } = require("../utils/notificationHelper");

// @route POST /api/prescriptions
exports.createPrescription = async (req, res) => {
  try {
    const { appointmentId, diagnosis, medicines, tests, advice, followUpDate } = req.body;

    const doctor = await Doctor.findOne({ user: req.user._id }).populate("user", "name");
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor profile not found" });

    const appointment = await Appointment.findById(appointmentId)
      .populate("patient", "name email");
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

    const prescription = await Prescription.create({
      appointment: appointmentId,
      patient: appointment.patient._id,
      doctor: doctor._id,
      diagnosis,
      medicines,
      tests,
      advice,
      followUpDate,
    });

    // Update appointment
    appointment.prescription = prescription._id;
    appointment.status = "completed";
    await appointment.save();

    // Update doctor stats
    doctor.totalConsultations += 1;
    doctor.earnings += appointment.fee;
    await doctor.save();

    // ── Notify patient ──────────────────────────────────────────────────────
    await sendNotification({
      userId: appointment.patient._id,
      title: "Prescription Ready 💊",
      message: `Dr. ${doctor.user.name} has written a prescription for you. Diagnosis: ${diagnosis}`,
      type: "prescription",
      link: `/patient/prescriptions`,
    });

    // ── Email patient ────────────────────────────────────────────────────────
    await sendEmail({
      to: appointment.patient.email,
      subject: "Your Prescription is Ready — MediConnect",
      template: "prescriptionReady",
      templateData: {
        patientName: appointment.patient.name,
        doctorName: doctor.user.name,
        diagnosis,
        medicineCount: medicines?.length || 0,
      },
    });

    res.status(201).json({ success: true, prescription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/prescriptions/patient
exports.getPatientPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.user._id })
      .populate({ path: "doctor", populate: { path: "user", select: "name avatar" } })
      .populate("appointment", "appointmentDate consultationType")
      .sort({ createdAt: -1 });

    res.json({ success: true, prescriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/prescriptions/:id
exports.getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate("patient", "name dateOfBirth gender bloodGroup")
      .populate({ path: "doctor", populate: { path: "user", select: "name avatar" } })
      .populate("appointment");

    if (!prescription) return res.status(404).json({ success: false, message: "Prescription not found" });
    res.json({ success: true, prescription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
