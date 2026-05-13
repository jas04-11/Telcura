const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const Doctor = require("./models/Doctor");
const Review = require("./models/Review");

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // Clear existing demo data
  await User.deleteMany({ email: { $in: ["admin@demo.com","patient@demo.com","doctor@demo.com","doctor2@demo.com","doctor3@demo.com"] } });

  // Create Admin
  await User.create({ name: "Admin User", email: "admin@demo.com", password: "demo1234", role: "admin", isVerified: true, isActive: true });
  console.log("✅ Admin created");

  // Create Patient
  await User.create({
    name: "Arjun Mehta", email: "patient@demo.com", password: "demo1234",
    role: "patient", gender: "male", phone: "+91 9876543210",
    bloodGroup: "O+", allergies: ["Penicillin", "Dust"],
    currentMedications: ["Vitamin D 60K weekly"],
    address: { city: "Ludhiana", state: "Punjab", country: "India" },
    isVerified: true, isActive: true,
  });
  console.log("✅ Patient created");

  // Doctors
  const doctorsData = [
    { name: "Dr. Priya Sharma", email: "doctor@demo.com", gender: "female", city: "Mumbai", spec: "Cardiologist", exp: 12, fee: 800, rating: 4.8, reviews: 124, license: "MCI-2024-001" },
    { name: "Dr. Rohit Gupta", email: "doctor2@demo.com", gender: "male", city: "Delhi", spec: "Neurologist", exp: 8, fee: 600, rating: 4.6, reviews: 87, license: "MCI-2024-002" },
    { name: "Dr. Ananya Singh", email: "doctor3@demo.com", gender: "female", city: "Bangalore", spec: "Dermatologist", exp: 6, fee: 500, rating: 4.9, reviews: 203, license: "MCI-2024-003" },
  ];

  for (const d of doctorsData) {
    const user = await User.create({
      name: d.name, email: d.email, password: "demo1234",
      role: "doctor", gender: d.gender,
      address: { city: d.city, country: "India" },
      isVerified: true, isActive: true,
    });
    await Doctor.create({
      user: user._id,
      specialization: d.spec,
      experience: d.exp,
      licenseNumber: d.license,
      consultationFee: d.fee,
      followUpFee: Math.round(d.fee * 0.5),
      rating: d.rating,
      totalReviews: d.reviews,
      totalConsultations: d.reviews * 3,
      isApproved: true,
      isOnline: true,
      videoConsultation: true,
      chatConsultation: true,
      languages: ["English", "Hindi"],
      about: `Experienced ${d.spec} with ${d.exp} years of dedicated clinical practice. Committed to evidence-based, patient-centered care.`,
      qualifications: [{ degree: "MBBS", institution: "AIIMS Delhi", year: 2010 }, { degree: "MD", institution: "PGI Chandigarh", year: 2014 }],
      availability: [
        { day: "Monday", startTime: "09:00", endTime: "17:00", isAvailable: true },
        { day: "Tuesday", startTime: "09:00", endTime: "17:00", isAvailable: true },
        { day: "Wednesday", startTime: "09:00", endTime: "17:00", isAvailable: true },
        { day: "Thursday", startTime: "09:00", endTime: "17:00", isAvailable: true },
        { day: "Friday", startTime: "09:00", endTime: "14:00", isAvailable: true },
        { day: "Saturday", startTime: "10:00", endTime: "13:00", isAvailable: true },
        { day: "Sunday", startTime: "", endTime: "", isAvailable: false },
      ],
    });
    console.log(`✅ Doctor created: ${d.name}`);
  }

  console.log("\n🎉 Seeding complete!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📧 LOGIN CREDENTIALS (password: demo1234)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("👤 Patient : patient@demo.com");
  console.log("👨‍⚕️ Doctor  : doctor@demo.com");
  console.log("🛡️  Admin   : admin@demo.com");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  process.exit(0);
};

seed().catch((err) => { console.error("❌ Seed error:", err.message); process.exit(1); });
