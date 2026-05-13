// const Appointment = require("../models/Appointment");
// const Doctor = require("../models/Doctor");
// const Notification = require("../models/Notification");
// const { sendEmail } = require("../utils/email");
// const { v4: uuidv4 } = require("crypto");

// // @route POST /api/appointments
// exports.bookAppointment = async (req, res) => {
//   try {
//     const { doctorId, appointmentDate, timeSlot, consultationType, symptoms } = req.body;

//     const doctor = await Doctor.findById(doctorId).populate("user", "name email");
//     if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });
//     if (!doctor.isApproved) return res.status(400).json({ success: false, message: "Doctor not available" });

//     // Check if slot is taken
//     const existing = await Appointment.findOne({
//       doctor: doctorId,
//       appointmentDate: new Date(appointmentDate),
//       timeSlot,
//       status: { $in: ["confirmed", "pending"] },
//     });
//     if (existing) return res.status(400).json({ success: false, message: "This slot is already booked" });

//     const meetingRoomId = `mediconnect-${uuidv4 ? uuidv4() : Math.random().toString(36).substr(2, 9)}`;

//     const appointment = await Appointment.create({
//       patient: req.user._id,
//       doctor: doctorId,
//       appointmentDate: new Date(appointmentDate),
//       timeSlot,
//       consultationType,
//       symptoms,
//       fee: doctor.consultationFee,
//       meetingRoomId,
//     });

//     await appointment.populate([
//       { path: "patient", select: "name email avatar" },
//       { path: "doctor", populate: { path: "user", select: "name email" } },
//     ]);

//     // Create notification for doctor
//     await Notification.create({
//       user: doctor.user._id,
//       title: "New Appointment Booked",
//       message: `${req.user.name} has booked an appointment for ${new Date(appointmentDate).toDateString()} at ${timeSlot}`,
//       type: "appointment",
//       link: `/doctor/appointments/${appointment._id}`,
//     });

//     // Send email to doctor
//     await sendEmail({
//       to: doctor.user.email,
//       subject: "New Appointment - Telcura",
//       html: `<h3>New appointment booked by ${req.user.name}</h3><p>Date: ${new Date(appointmentDate).toDateString()}<br/>Time: ${timeSlot}<br/>Type: ${consultationType}</p>`,
//     });

//     res.status(201).json({ success: true, appointment });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // @route GET /api/appointments/patient
// exports.getPatientAppointments = async (req, res) => {
//   try {
//     const { status, page = 1, limit = 10 } = req.query;
//     let query = { patient: req.user._id };
//     if (status) query.status = status;

//     const total = await Appointment.countDocuments(query);
//     const appointments = await Appointment.find(query)
//       .populate({ path: "doctor", populate: { path: "user", select: "name avatar email" } })
//       .sort({ appointmentDate: -1 })
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit));

//     res.json({ success: true, total, appointments });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // @route GET /api/appointments/doctor
// exports.getDoctorAppointments = async (req, res) => {
//   try {
//     const doctor = await Doctor.findOne({ user: req.user._id });
//     if (!doctor) return res.status(404).json({ success: false, message: "Doctor profile not found" });

//     const { status, date, page = 1, limit = 10 } = req.query;
//     let query = { doctor: doctor._id };
//     if (status) query.status = status;
//     if (date) {
//       const d = new Date(date);
//       query.appointmentDate = {
//         $gte: d,
//         $lt: new Date(d.setDate(d.getDate() + 1)),
//       };
//     }

//     const total = await Appointment.countDocuments(query);
//     const appointments = await Appointment.find(query)
//       .populate("patient", "name avatar email gender dateOfBirth phone medicalHistory allergies")
//       .sort({ appointmentDate: 1 })
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit));

//     res.json({ success: true, total, appointments });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // @route GET /api/appointments/:id
// exports.getAppointmentById = async (req, res) => {
//   try {
//     const appointment = await Appointment.findById(req.params.id)
//       .populate("patient", "name avatar email gender dateOfBirth phone medicalHistory allergies bloodGroup")
//       .populate({ path: "doctor", populate: { path: "user", select: "name avatar email" } })
//       .populate("prescription");

//     if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

//     // Authorization check
//     const isPatient = appointment.patient._id.toString() === req.user._id.toString();
//     const doctorDoc = await Doctor.findOne({ user: req.user._id });
//     const isDoctor = doctorDoc && appointment.doctor._id.toString() === doctorDoc._id.toString();

//     if (!isPatient && !isDoctor && req.user.role !== "admin") {
//       return res.status(403).json({ success: false, message: "Not authorized" });
//     }

//     res.json({ success: true, appointment });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // @route PUT /api/appointments/:id/status
// exports.updateAppointmentStatus = async (req, res) => {
//   try {
//     const { status, cancelReason } = req.body;
//     const appointment = await Appointment.findById(req.params.id).populate("patient", "name email");

//     if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

//     appointment.status = status;
//     if (cancelReason) {
//       appointment.cancelReason = cancelReason;
//       appointment.cancelledBy = req.user.role;
//     }
//     await appointment.save();

//     // Notify patient
//     await Notification.create({
//       user: appointment.patient._id,
//       title: `Appointment ${status}`,
//       message: `Your appointment has been ${status}`,
//       type: "appointment",
//     });

//     res.json({ success: true, appointment });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // @route DELETE /api/appointments/:id
// exports.cancelAppointment = async (req, res) => {
//   try {
//     const appointment = await Appointment.findById(req.params.id);
//     if (!appointment) return res.status(404).json({ success: false, message: "Not found" });

//     if (appointment.status === "completed") {
//       return res.status(400).json({ success: false, message: "Cannot cancel completed appointment" });
//     }

//     appointment.status = "cancelled";
//     appointment.cancelReason = req.body.reason;
//     appointment.cancelledBy = req.user.role;
//     await appointment.save();

//     res.json({ success: true, message: "Appointment cancelled successfully" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const { sendEmail } = require("../utils/email");
const { sendNotification } = require("../utils/notificationHelper");
const crypto = require("crypto");

// @route POST /api/appointments
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, timeSlot, consultationType, symptoms } = req.body;

    const doctor = await Doctor.findById(doctorId).populate("user", "name email");
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });
    if (!doctor.isApproved) return res.status(400).json({ success: false, message: "Doctor not available" });

    // Check if slot is taken
    const existing = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      status: { $in: ["confirmed", "pending"] },
    });
    if (existing) return res.status(400).json({ success: false, message: "This slot is already booked" });

    const meetingRoomId = `mediconnect-${crypto.randomBytes(8).toString("hex")}`;
    const formattedDate = new Date(appointmentDate).toDateString();

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      consultationType,
      symptoms,
      fee: doctor.consultationFee,
      meetingRoomId,
    });

    await appointment.populate([
      { path: "patient", select: "name email avatar" },
      { path: "doctor", populate: { path: "user", select: "name email" } },
    ]);

    // ── Notify DOCTOR ────────────────────────────────────────────────────────
    await sendNotification({
      userId: doctor.user._id,
      title: "New Appointment Booked 📅",
      message: `${req.user.name} booked an appointment for ${formattedDate} at ${timeSlot}`,
      type: "appointment",
      link: `/doctor/appointments`,
    });

    // ── Notify PATIENT (confirmation) ────────────────────────────────────────
    await sendNotification({
      userId: req.user._id,
      title: "Appointment Booked ✅",
      message: `Your appointment with Dr. ${doctor.user.name} on ${formattedDate} at ${timeSlot} is booked.`,
      type: "appointment",
      link: `/patient/appointments`,
    });

    // ── Email DOCTOR ─────────────────────────────────────────────────────────
    await sendEmail({
      to: doctor.user.email,
      subject: "New Appointment Booked — MediConnect",
      template: "appointmentBookedDoctor",
      templateData: {
        patientName: req.user.name,
        date: formattedDate,
        timeSlot,
        consultationType,
        symptoms,
      },
    });

    // ── Email PATIENT ─────────────────────────────────────────────────────────
    await sendEmail({
      to: req.user.email,
      subject: "Appointment Confirmed — MediConnect",
      template: "appointmentBookedPatient",
      templateData: {
        doctorName: doctor.user.name,
        specialization: doctor.specialization,
        date: formattedDate,
        timeSlot,
        consultationType,
        fee: doctor.consultationFee,
      },
    });

    res.status(201).json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/appointments/patient
exports.getPatientAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    let query = { patient: req.user._id };
    if (status) query.status = status;

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate({ path: "doctor", populate: { path: "user", select: "name avatar email" } })
      .sort({ appointmentDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, total, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/appointments/doctor
exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor profile not found" });

    const { status, date, page = 1, limit = 10 } = req.query;
    let query = { doctor: doctor._id };
    if (status) query.status = status;
    if (date) {
      const d = new Date(date);
      query.appointmentDate = { $gte: d, $lt: new Date(d.setDate(d.getDate() + 1)) };
    }

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate("patient", "name avatar email gender dateOfBirth phone medicalHistory allergies bloodGroup")
      .sort({ appointmentDate: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, total, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/appointments/:id
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patient", "name avatar email gender dateOfBirth phone medicalHistory allergies bloodGroup")
      .populate({ path: "doctor", populate: { path: "user", select: "name avatar email" } })
      .populate("prescription");

    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

    const isPatient = appointment.patient._id.toString() === req.user._id.toString();
    const doctorDoc = await Doctor.findOne({ user: req.user._id });
    const isDoctor = doctorDoc && appointment.doctor._id.toString() === doctorDoc._id.toString();

    if (!isPatient && !isDoctor && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/appointments/:id/status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, cancelReason } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate("patient", "name email")
      .populate({ path: "doctor", populate: { path: "user", select: "name email" } });

    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

    appointment.status = status;
    if (cancelReason) {
      appointment.cancelReason = cancelReason;
      appointment.cancelledBy = req.user.role;
    }
    await appointment.save();

    const formattedDate = new Date(appointment.appointmentDate).toDateString();

    if (status === "confirmed") {
      // Notify patient appointment was confirmed
      await sendNotification({
        userId: appointment.patient._id,
        title: "Appointment Confirmed ✅",
        message: `Dr. ${appointment.doctor.user.name} confirmed your appointment on ${formattedDate} at ${appointment.timeSlot}`,
        type: "appointment",
        link: `/patient/appointments`,
      });

      await sendEmail({
        to: appointment.patient.email,
        subject: "Appointment Confirmed — MediConnect",
        template: "appointmentConfirmed",
        templateData: {
          patientName: appointment.patient.name,
          doctorName: appointment.doctor.user.name,
          date: formattedDate,
          timeSlot: appointment.timeSlot,
        },
      });
    }

    if (status === "cancelled") {
      const cancelledBy = req.user.role;

      // Notify the OTHER party
      if (cancelledBy === "doctor") {
        // Doctor cancelled — notify patient
        await sendNotification({
          userId: appointment.patient._id,
          title: "Appointment Cancelled ❌",
          message: `Dr. ${appointment.doctor.user.name} cancelled your appointment on ${formattedDate}`,
          type: "appointment",
          link: `/patient/appointments`,
        });
        await sendEmail({
          to: appointment.patient.email,
          subject: "Appointment Cancelled — MediConnect",
          template: "appointmentCancelled",
          templateData: {
            recipientName: appointment.patient.name,
            cancelledBy: "doctor",
            date: formattedDate,
            timeSlot: appointment.timeSlot,
            reason: cancelReason,
          },
        });
      } else {
        // Patient cancelled — notify doctor
        await sendNotification({
          userId: appointment.doctor.user._id,
          title: "Appointment Cancelled ❌",
          message: `${appointment.patient.name} cancelled the appointment on ${formattedDate} at ${appointment.timeSlot}`,
          type: "appointment",
          link: `/doctor/appointments`,
        });
        await sendEmail({
          to: appointment.doctor.user.email,
          subject: "Appointment Cancelled — MediConnect",
          template: "appointmentCancelled",
          templateData: {
            recipientName: `Dr. ${appointment.doctor.user.name}`,
            cancelledBy: "patient",
            date: formattedDate,
            timeSlot: appointment.timeSlot,
            reason: cancelReason,
          },
        });
      }
    }

    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route DELETE /api/appointments/:id
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patient", "name email")
      .populate({ path: "doctor", populate: { path: "user", select: "name email" } });

    if (!appointment) return res.status(404).json({ success: false, message: "Not found" });

    if (appointment.status === "completed") {
      return res.status(400).json({ success: false, message: "Cannot cancel completed appointment" });
    }

    appointment.status = "cancelled";
    appointment.cancelReason = req.body.reason || "Cancelled by " + req.user.role;
    appointment.cancelledBy = req.user.role;
    await appointment.save();

    const formattedDate = new Date(appointment.appointmentDate).toDateString();

    // Notify doctor if patient cancelled
    if (req.user.role === "patient") {
      await sendNotification({
        userId: appointment.doctor.user._id,
        title: "Appointment Cancelled ❌",
        message: `${appointment.patient.name} cancelled the appointment on ${formattedDate} at ${appointment.timeSlot}`,
        type: "appointment",
        link: `/doctor/appointments`,
      });
      await sendEmail({
        to: appointment.doctor.user.email,
        subject: "Appointment Cancelled — MediConnect",
        template: "appointmentCancelled",
        templateData: {
          recipientName: `Dr. ${appointment.doctor.user.name}`,
          cancelledBy: "patient",
          date: formattedDate,
          timeSlot: appointment.timeSlot,
          reason: req.body.reason,
        },
      });
    }

    res.json({ success: true, message: "Appointment cancelled successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
