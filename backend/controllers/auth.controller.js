// const User = require("../models/User");
// const Doctor = require("../models/Doctor");
// const jwt = require("jsonwebtoken");
// const crypto = require("crypto");
// const { sendEmail } = require("../utils/email");

// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
// };

// // @route POST /api/auth/register
// exports.register = async (req, res) => {
//   try {
//     const { name, email, password, phone, role, gender, dateOfBirth } = req.body;

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ success: false, message: "Email already registered" });
//     }

//     const user = await User.create({ name, email, password, phone, role, gender, dateOfBirth });

//     // If registering as doctor, create doctor profile
//     if (role === "doctor") {
//       await Doctor.create({
//         user: user._id,
//         specialization: req.body.specialization || "General Physician",
//         experience: req.body.experience || 0,
//         licenseNumber: req.body.licenseNumber || `TEMP-${user._id}`,
//         consultationFee: req.body.consultationFee || 500,
//       });
//     }

//     const token = generateToken(user._id);

//     res.status(201).json({
//       success: true,
//       message: "Registration successful",
//       token,
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         avatar: user.avatar,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // @route POST /api/auth/login
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ success: false, message: "Please provide email and password" });
//     }

//     const user = await User.findOne({ email }).select("+password");
//     if (!user || !(await user.matchPassword(password))) {
//       return res.status(401).json({ success: false, message: "Invalid email or password" });
//     }

//     if (!user.isActive) {
//       return res.status(401).json({ success: false, message: "Account has been deactivated" });
//     }

//     user.lastLogin = Date.now();
//     await user.save({ validateBeforeSave: false });

//     let doctorProfile = null;
//     if (user.role === "doctor") {
//       doctorProfile = await Doctor.findOne({ user: user._id });
//     }

//     const token = generateToken(user._id);

//     res.json({
//       success: true,
//       token,
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         avatar: user.avatar,
//         phone: user.phone,
//         gender: user.gender,
//         isVerified: user.isVerified,
//       },
//       doctorProfile,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // @route GET /api/auth/me
// exports.getMe = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     let doctorProfile = null;
//     if (user.role === "doctor") {
//       doctorProfile = await Doctor.findOne({ user: user._id });
//     }
//     res.json({ success: true, user, doctorProfile });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // @route POST /api/auth/forgot-password
// exports.forgotPassword = async (req, res) => {
//   try {
//     const user = await User.findOne({ email: req.body.email });
//     if (!user) {
//       return res.status(404).json({ success: false, message: "No user with that email" });
//     }

//     const resetToken = crypto.randomBytes(32).toString("hex");
//     user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
//     user.passwordResetExpire = Date.now() + 30 * 60 * 1000; // 30 min
//     await user.save({ validateBeforeSave: false });

//     const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
//     await sendEmail({
//       to: user.email,
//       subject: "MediConnect - Password Reset",
//       html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 30 minutes.</p>`,
//     });

//     res.json({ success: true, message: "Password reset email sent" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // @route PUT /api/auth/reset-password/:token
// exports.resetPassword = async (req, res) => {
//   try {
//     const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
//     const user = await User.findOne({
//       passwordResetToken: hashedToken,
//       passwordResetExpire: { $gt: Date.now() },
//     });

//     if (!user) {
//       return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
//     }

//     user.password = req.body.password;
//     user.passwordResetToken = undefined;
//     user.passwordResetExpire = undefined;
//     await user.save();

//     const token = generateToken(user._id);
//     res.json({ success: true, token, message: "Password reset successful" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // @route PUT /api/auth/change-password
// exports.changePassword = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).select("+password");
//     if (!(await user.matchPassword(req.body.currentPassword))) {
//       return res.status(401).json({ success: false, message: "Current password incorrect" });
//     }
//     user.password = req.body.newPassword;
//     await user.save();
//     res.json({ success: true, message: "Password changed successfully" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendEmail } = require("../utils/email");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// @route POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, gender, dateOfBirth } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({ name, email, password, phone, role, gender, dateOfBirth });

    // If registering as doctor, create doctor profile
    if (role === "doctor") {
      await Doctor.create({
        user: user._id,
        specialization: req.body.specialization || "General Physician",
        experience: req.body.experience || 0,
        licenseNumber: req.body.licenseNumber || `TEMP-${user._id}`,
        consultationFee: req.body.consultationFee || 500,
      });
    }

    // Send welcome email
    await sendEmail({
      to: user.email,
      subject: 'Welcome to MediConnect 🏥',
      template: 'welcomeEmail',
      templateData: { name: user.name, role: user.role },
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: "Account has been deactivated" });
    }

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    let doctorProfile = null;
    if (user.role === "doctor") {
      doctorProfile = await Doctor.findOne({ user: user._id });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        gender: user.gender,
        isVerified: user.isVerified,
      },
      doctorProfile,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let doctorProfile = null;
    if (user.role === "doctor") {
      doctorProfile = await Doctor.findOne({ user: user._id });
    }
    res.json({ success: true, user, doctorProfile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ success: false, message: "No user with that email" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.passwordResetExpire = Date.now() + 30 * 60 * 1000; // 30 min
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: "Password Reset — MediConnect",
      template: "passwordReset",
      templateData: { resetUrl },
    });

    res.json({ success: true, message: "Password reset email sent" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.json({ success: true, token, message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({ success: false, message: "Current password incorrect" });
    }
    user.password = req.body.newPassword;
    await user.save();
    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
