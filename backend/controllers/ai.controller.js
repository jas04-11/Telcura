const Doctor = require("../models/Doctor");

// Symptom to specialization mapping (real-world medical knowledge)
const symptomSpecializationMap = {
  // Cardiology
  "chest pain": "Cardiologist",
  "heart palpitations": "Cardiologist",
  "shortness of breath": "Cardiologist",
  "high blood pressure": "Cardiologist",
  "irregular heartbeat": "Cardiologist",
  // Dermatology
  "skin rash": "Dermatologist",
  "acne": "Dermatologist",
  "hair loss": "Dermatologist",
  "eczema": "Dermatologist",
  "skin itching": "Dermatologist",
  // Neurology
  "headache": "Neurologist",
  "migraine": "Neurologist",
  "dizziness": "Neurologist",
  "seizure": "Neurologist",
  "numbness": "Neurologist",
  // Orthopedics
  "joint pain": "Orthopedist",
  "back pain": "Orthopedist",
  "knee pain": "Orthopedist",
  "fracture": "Orthopedist",
  "muscle pain": "Orthopedist",
  // Gastroenterology
  "stomach pain": "Gastroenterologist",
  "diarrhea": "Gastroenterologist",
  "vomiting": "Gastroenterologist",
  "constipation": "Gastroenterologist",
  "bloating": "Gastroenterologist",
  // Pulmonology
  "cough": "Pulmonologist",
  "asthma": "Pulmonologist",
  "breathing difficulty": "Pulmonologist",
  "wheezing": "Pulmonologist",
  // Psychiatry
  "anxiety": "Psychiatrist",
  "depression": "Psychiatrist",
  "insomnia": "Psychiatrist",
  "mood swings": "Psychiatrist",
  "panic attacks": "Psychiatrist",
  // Endocrinology
  "diabetes": "Endocrinologist",
  "thyroid issues": "Endocrinologist",
  "fatigue": "Endocrinologist",
  "weight gain": "Endocrinologist",
  "excessive thirst": "Endocrinologist",
  // Ophthalmology
  "eye pain": "Ophthalmologist",
  "blurred vision": "Ophthalmologist",
  "red eyes": "Ophthalmologist",
  "vision problems": "Ophthalmologist",
  // ENT
  "ear pain": "ENT Specialist",
  "sore throat": "ENT Specialist",
  "nasal congestion": "ENT Specialist",
  "hearing loss": "ENT Specialist",
  "sinusitis": "ENT Specialist",
  // Urology
  "urinary problems": "Urologist",
  "kidney pain": "Urologist",
  "frequent urination": "Urologist",
  // Gynecology
  "menstrual problems": "Gynecologist",
  "pelvic pain": "Gynecologist",
  "pregnancy": "Gynecologist",
  // Pediatrics
  "child fever": "Pediatrician",
  "child cough": "Pediatrician",
  "growth issues": "Pediatrician",
};

// Severity assessment rules
const getSeverity = (symptoms) => {
  const critical = ["chest pain", "breathing difficulty", "seizure", "severe bleeding", "unconscious", "stroke", "heart attack"];
  const high = ["shortness of breath", "high fever", "severe pain", "fracture", "irregular heartbeat"];
  const medium = ["vomiting", "diarrhea", "dizziness", "moderate pain", "skin rash"];

  const symptomsLower = symptoms.toLowerCase();

  if (critical.some((s) => symptomsLower.includes(s))) {
    return { level: "critical", message: "⚠️ EMERGENCY: Please call emergency services (112) immediately or visit the nearest ER.", color: "red" };
  }
  if (high.some((s) => symptomsLower.includes(s))) {
    return { level: "high", message: "🔴 High Priority: You should consult a doctor within 24 hours.", color: "orange" };
  }
  if (medium.some((s) => symptomsLower.includes(s))) {
    return { level: "medium", message: "🟡 Moderate: Schedule a consultation soon, within 2-3 days.", color: "yellow" };
  }
  return { level: "low", message: "🟢 Low: You can consult a doctor at your convenience.", color: "green" };
};

// @route POST /api/ai/symptom-check
exports.symptomCheck = async (req, res) => {
  try {
    const { symptoms, age, gender } = req.body;
    if (!symptoms) return res.status(400).json({ success: false, message: "Symptoms are required" });

    const symptomsLower = symptoms.toLowerCase();

    // Find matching specializations
    const matchedSpecs = new Set();
    for (const [symptom, spec] of Object.entries(symptomSpecializationMap)) {
      if (symptomsLower.includes(symptom)) {
        matchedSpecs.add(spec);
      }
    }

    // Default to General Physician if no match
    if (matchedSpecs.size === 0) {
      matchedSpecs.add("General Physician");
    }

    const severity = getSeverity(symptoms);

    // Get possible conditions (simplified AI logic)
    const possibleConditions = getPossibleConditions(symptomsLower);

    // Fetch recommended doctors
    const recommendedDoctors = await Doctor.find({
      specialization: { $in: Array.from(matchedSpecs) },
      isApproved: true,
    })
      .populate("user", "name avatar email")
      .sort({ rating: -1 })
      .limit(6);

    // Fallback to general physicians
    let fallbackDoctors = [];
    if (recommendedDoctors.length < 3) {
      fallbackDoctors = await Doctor.find({
        specialization: "General Physician",
        isApproved: true,
      })
        .populate("user", "name avatar email")
        .sort({ rating: -1 })
        .limit(3);
    }

    const homeRemedies = getHomeRemedies(symptomsLower);
    const precautions = getPrecautions(symptomsLower);

    res.json({
      success: true,
      analysis: {
        severity,
        recommendedSpecializations: Array.from(matchedSpecs),
        possibleConditions,
        homeRemedies,
        precautions,
        disclaimer:
          "This AI analysis is for guidance only. Always consult a qualified medical professional for proper diagnosis and treatment.",
      },
      recommendedDoctors: [...recommendedDoctors, ...fallbackDoctors],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

function getPossibleConditions(symptoms) {
  const conditions = [];
  if (symptoms.includes("chest pain") || symptoms.includes("shortness of breath")) {
    conditions.push({ name: "Angina or Cardiac Issue", probability: "Moderate", action: "Seek immediate medical attention" });
  }
  if (symptoms.includes("headache") && symptoms.includes("fever")) {
    conditions.push({ name: "Viral Infection / Flu", probability: "High", action: "Rest, stay hydrated, monitor temperature" });
  }
  if (symptoms.includes("joint pain") || symptoms.includes("back pain")) {
    conditions.push({ name: "Musculoskeletal Strain", probability: "High", action: "Rest, avoid strenuous activity" });
    conditions.push({ name: "Arthritis", probability: "Moderate", action: "Orthopedic evaluation recommended" });
  }
  if (symptoms.includes("cough") && symptoms.includes("fever")) {
    conditions.push({ name: "Upper Respiratory Infection", probability: "High", action: "Consult a pulmonologist if symptoms persist > 5 days" });
  }
  if (symptoms.includes("stomach pain") || symptoms.includes("nausea")) {
    conditions.push({ name: "Gastritis / Food Poisoning", probability: "Moderate", action: "Bland diet, stay hydrated" });
  }
  if (conditions.length === 0) {
    conditions.push({ name: "Unspecified condition", probability: "Unknown", action: "Consult a General Physician for proper evaluation" });
  }
  return conditions;
}

function getHomeRemedies(symptoms) {
  const remedies = [];
  if (symptoms.includes("headache")) remedies.push("Rest in a quiet, dark room", "Apply cold/warm compress", "Stay hydrated");
  if (symptoms.includes("cough")) remedies.push("Honey with warm water", "Steam inhalation", "Ginger tea");
  if (symptoms.includes("fever")) remedies.push("Drink plenty of fluids", "Rest", "Cool compress on forehead");
  if (symptoms.includes("stomach pain")) remedies.push("Avoid spicy foods", "Eat light meals", "Ginger or peppermint tea");
  if (symptoms.includes("joint pain")) remedies.push("Apply ice or heat pack", "Rest the affected joint", "Gentle stretching");
  return remedies.length ? remedies : ["Rest and stay hydrated", "Monitor your symptoms", "Consult a doctor if symptoms worsen"];
}

function getPrecautions(symptoms) {
  return [
    "Monitor your symptoms and note any changes",
    "Avoid self-medication without doctor's advice",
    "Stay hydrated and get adequate rest",
    "Avoid strenuous physical activity until evaluated",
    "Seek emergency care if symptoms worsen suddenly",
  ];
}

// @route GET /api/ai/recommendations/:patientId
exports.getPersonalizedRecommendations = async (req, res) => {
  try {
    const User = require("../models/User");
    const Appointment = require("../models/Appointment");

    const user = await User.findById(req.user._id);
    const pastAppointments = await Appointment.find({
      patient: req.user._id,
      status: "completed",
    })
      .populate({ path: "doctor", select: "specialization" })
      .limit(10);

    // Get frequently visited specializations
    const specCount = {};
    pastAppointments.forEach((a) => {
      const spec = a.doctor?.specialization;
      if (spec) specCount[spec] = (specCount[spec] || 0) + 1;
    });

    const frequentSpecs = Object.keys(specCount).sort((a, b) => specCount[b] - specCount[a]);

    // Recommend top doctors from those specializations
    const recommendations = await Doctor.find({
      isApproved: true,
      ...(frequentSpecs.length ? { specialization: { $in: frequentSpecs } } : {}),
    })
      .populate("user", "name avatar email")
      .sort({ rating: -1 })
      .limit(4);

    const healthTips = getHealthTips(user);

    res.json({
      success: true,
      recommendations,
      healthTips,
      frequentSpecializations: frequentSpecs,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

function getHealthTips(user) {
  const tips = [
    "💧 Drink at least 8 glasses of water daily",
    "🚶 Walk 30 minutes every day for cardiovascular health",
    "😴 Aim for 7-8 hours of sleep each night",
    "🥗 Eat a balanced diet rich in fruits and vegetables",
    "🧘 Practice mindfulness or meditation to reduce stress",
    "🩺 Schedule regular health checkups every 6 months",
    "☀️ Get 15-20 minutes of sunlight daily for Vitamin D",
    "🚭 Avoid smoking and limit alcohol consumption",
  ];

  // Age-specific tips
  if (user.dateOfBirth) {
    const age = new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear();
    if (age > 40) tips.push("❤️ Get annual cardiac checkup after 40", "📊 Monitor blood pressure and sugar levels regularly");
    if (age > 60) tips.push("🦴 Calcium and Vitamin D supplements for bone health", "👁️ Annual eye and hearing checkups recommended");
  }

  return tips.slice(0, 5);
}
