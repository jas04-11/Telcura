const Doctor = require("../models/Doctor");
const User = require("../models/User");
const Appointment = require("../models/Appointment");

// @route GET /api/doctors
exports.getAllDoctors = async (req, res) => {
  try {
    const { specialization, city, rating, consultationType, search, page = 1, limit = 12 } = req.query;

    let doctorQuery = { isApproved: true };
    if (specialization) doctorQuery.specialization = { $regex: specialization, $options: "i" };
    if (consultationType === "video") doctorQuery.videoConsultation = true;
    if (consultationType === "chat") doctorQuery.chatConsultation = true;
    if (rating) doctorQuery.rating = { $gte: parseFloat(rating) };

    let userQuery = { isActive: true };
    if (search) userQuery.$or = [
      { name: { $regex: search, $options: "i" } },
    ];
    if (city) userQuery["address.city"] = { $regex: city, $options: "i" };

    const matchingUsers = await User.find(userQuery).select("_id");
    const userIds = matchingUsers.map((u) => u._id);

    if (search || city) {
      doctorQuery.user = { $in: userIds };
    }

    const total = await Doctor.countDocuments(doctorQuery);
    const doctors = await Doctor.find(doctorQuery)
      .populate("user", "name email avatar gender address phone")
      .sort({ rating: -1, totalConsultations: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      doctors,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/doctors/:id
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate(
      "user",
      "name email avatar gender address phone"
    );
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/doctors/profile
exports.updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate({ user: req.user._id }, req.body, {
      new: true,
      runValidators: true,
    }).populate("user", "name email avatar");

    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/doctors/dashboard/stats
exports.getDoctorDashboard = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor profile not found" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayAppts, pendingAppts, completedAppts, totalAppts] = await Promise.all([
      Appointment.countDocuments({
        doctor: doctor._id,
        appointmentDate: { $gte: today, $lt: tomorrow },
        status: { $in: ["confirmed", "pending"] },
      }),
      Appointment.countDocuments({ doctor: doctor._id, status: "pending" }),
      Appointment.countDocuments({ doctor: doctor._id, status: "completed" }),
      Appointment.countDocuments({ doctor: doctor._id }),
    ]);

    const recentAppointments = await Appointment.find({ doctor: doctor._id })
      .populate("patient", "name avatar gender dateOfBirth")
      .sort({ appointmentDate: -1 })
      .limit(5);

    const monthlyEarnings = await Appointment.aggregate([
      {
        $match: {
          doctor: doctor._id,
          status: "completed",
          paymentStatus: "paid",
          createdAt: { $gte: new Date(new Date().setDate(1)) },
        },
      },
      { $group: { _id: null, total: { $sum: "$fee" } } },
    ]);

    res.json({
      success: true,
      stats: {
        todayAppointments: todayAppts,
        pendingAppointments: pendingAppts,
        completedAppointments: completedAppts,
        totalAppointments: totalAppts,
        rating: doctor.rating,
        totalReviews: doctor.totalReviews,
        monthlyEarnings: monthlyEarnings[0]?.total || 0,
        totalEarnings: doctor.earnings,
      },
      recentAppointments,
      doctor,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/doctors/:id/availability
exports.getDoctorAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select("availability");
    const { date } = req.query;

    if (!date) {
      return res.json({ success: true, availability: doctor.availability });
    }

    const requestedDate = new Date(date);
    const dayName = requestedDate.toLocaleDateString("en-US", { weekday: "long" });

    const daySlots = doctor.availability.find((a) => a.day === dayName);

    // Get booked slots for that date
    const bookedSlots = await Appointment.find({
      doctor: req.params.id,
      appointmentDate: {
        $gte: new Date(date),
        $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
      },
      status: { $in: ["confirmed", "pending", "in-progress"] },
    }).select("timeSlot");

    const bookedTimes = bookedSlots.map((a) => a.timeSlot);

    res.json({
      success: true,
      daySlots,
      bookedTimes,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/doctors/availability
exports.updateAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { user: req.user._id },
      { availability: req.body.availability },
      { new: true }
    );
    res.json({ success: true, availability: doctor.availability });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/doctors/specializations
exports.getSpecializations = async (req, res) => {
  try {
    const specs = await Doctor.distinct("specialization", { isApproved: true });
    res.json({ success: true, specializations: specs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/doctors/toggle-online
exports.toggleOnlineStatus = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    doctor.isOnline = !doctor.isOnline;
    await doctor.save();
    res.json({ success: true, isOnline: doctor.isOnline });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
