// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// exports.sendEmail = async ({ to, subject, html }) => {
//   try {
//     await transporter.sendMail({
//       from: `"Telcura" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       html,
//     });
//   } catch (err) {
//     console.error("Email error:", err.message);
//   }
// };
const nodemailer = require("nodemailer");

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: parseInt(process.env.EMAIL_PORT) === 465,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    tls: { rejectUnauthorized: false },
  });
  return transporter;
};

const baseTemplate = (content) => `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
body{font-family:Arial,sans-serif;background:#f0f7ff;margin:0;padding:0}
.container{max-width:600px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08)}
.header{background:#0a7ea4;padding:28px 32px;text-align:center}
.header h1{color:#fff;margin:0;font-size:22px}
.header p{color:rgba(255,255,255,0.75);margin:6px 0 0;font-size:13px}
.body{padding:32px}
.body p{color:#374151;line-height:1.7;margin:0 0 14px;font-size:15px}
.info-box{background:#f0f7ff;border-radius:8px;padding:18px 20px;margin:20px 0;border-left:4px solid #0a7ea4}
.info-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e2eaf4;font-size:14px}
.info-row:last-child{border-bottom:none}
.info-label{color:#6b7280}.info-value{font-weight:bold;color:#111827}
.btn{display:inline-block;padding:12px 28px;background:#0a7ea4;color:#fff!important;text-decoration:none;border-radius:8px;font-weight:bold;font-size:14px;margin:8px 0}
.footer{background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb}
.footer p{color:#9ca3af;font-size:12px;margin:0}
.badge{display:inline-block;padding:4px 12px;border-radius:99px;font-size:12px;font-weight:bold}
.badge-green{background:#d1fae5;color:#065f46}.badge-red{background:#fee2e2;color:#991b1b}.badge-blue{background:#dbeafe;color:#1e40af}
</style></head><body><div class="container">
<div class="header"><h1>🏥 MediConnect</h1><p>Your trusted telemedicine platform</p></div>
<div class="body">${content}</div>
<div class="footer"><p>© 2024 MediConnect — automated email, do not reply.</p><p style="margin-top:6px">Help? <a href="mailto:support@mediconnect.com" style="color:#0a7ea4">support@mediconnect.com</a></p></div>
</div></body></html>`;

const templates = {
  appointmentBookedDoctor: ({ patientName, date, timeSlot, consultationType, symptoms }) =>
    baseTemplate(`<p>Hello Doctor,</p><p>A new appointment has been booked on your calendar.</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Patient</span><span class="info-value">${patientName}</span></div>
      <div class="info-row"><span class="info-label">Date</span><span class="info-value">${date}</span></div>
      <div class="info-row"><span class="info-label">Time</span><span class="info-value">${timeSlot}</span></div>
      <div class="info-row"><span class="info-label">Type</span><span class="info-value"><span class="badge badge-blue">${consultationType}</span></span></div>
      ${symptoms ? `<div class="info-row"><span class="info-label">Symptoms</span><span class="info-value">${symptoms}</span></div>` : ""}
    </div><p>Please confirm from your dashboard.</p>`),

  appointmentBookedPatient: ({ doctorName, specialization, date, timeSlot, consultationType, fee }) =>
    baseTemplate(`<p>Hello,</p><p>Your appointment has been successfully booked!</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Doctor</span><span class="info-value">Dr. ${doctorName}</span></div>
      <div class="info-row"><span class="info-label">Specialization</span><span class="info-value">${specialization}</span></div>
      <div class="info-row"><span class="info-label">Date</span><span class="info-value">${date}</span></div>
      <div class="info-row"><span class="info-label">Time</span><span class="info-value">${timeSlot}</span></div>
      <div class="info-row"><span class="info-label">Type</span><span class="info-value">${consultationType}</span></div>
      <div class="info-row"><span class="info-label">Fee</span><span class="info-value">₹${fee}</span></div>
    </div><p>You will receive a reminder 1 hour before your appointment.</p>`),

  appointmentConfirmed: ({ patientName, doctorName, date, timeSlot }) =>
    baseTemplate(`<p>Hello ${patientName},</p><p>Dr. ${doctorName} has <strong>confirmed</strong> your appointment.</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Date</span><span class="info-value">${date}</span></div>
      <div class="info-row"><span class="info-label">Time</span><span class="info-value">${timeSlot}</span></div>
      <div class="info-row"><span class="info-label">Status</span><span class="info-value"><span class="badge badge-green">Confirmed ✓</span></span></div>
    </div><p>Log in at appointment time and click <strong>Join Consultation</strong>.</p>`),

  appointmentCancelled: ({ recipientName, cancelledBy, date, timeSlot, reason }) =>
    baseTemplate(`<p>Hello ${recipientName},</p><p>Your appointment has been <strong>cancelled</strong> by the ${cancelledBy}.</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Date</span><span class="info-value">${date}</span></div>
      <div class="info-row"><span class="info-label">Time</span><span class="info-value">${timeSlot}</span></div>
      <div class="info-row"><span class="info-label">Status</span><span class="info-value"><span class="badge badge-red">Cancelled</span></span></div>
      ${reason ? `<div class="info-row"><span class="info-label">Reason</span><span class="info-value">${reason}</span></div>` : ""}
    </div><p>You can rebook anytime from MediConnect.</p>`),

  prescriptionReady: ({ patientName, doctorName, diagnosis, medicineCount }) =>
    baseTemplate(`<p>Hello ${patientName},</p><p>Dr. ${doctorName} has written a prescription for you.</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Diagnosis</span><span class="info-value">${diagnosis}</span></div>
      <div class="info-row"><span class="info-label">Medicines</span><span class="info-value">${medicineCount} prescribed</span></div>
    </div><p>Log in to view and download your complete prescription.</p>`),

  passwordReset: ({ resetUrl }) =>
    baseTemplate(`<p>Hello,</p><p>Click below to reset your MediConnect password:</p>
    <div style="text-align:center;margin:28px 0"><a href="${resetUrl}" class="btn">Reset My Password</a></div>
    <p style="color:#6b7280;font-size:13px">This link expires in <strong>30 minutes</strong>. If you didn't request this, ignore this email.</p>`),

  welcomeEmail: ({ name, role }) =>
    baseTemplate(`<p>Hello ${name},</p><p>Welcome to <strong>MediConnect</strong>! Your ${role} account is ready.</p>
    <div class="info-box"><p style="margin:0;font-size:14px">
      ${role === "patient" ? "Search doctors, book consultations, use AI symptom checker, and manage health records."
        : role === "doctor" ? "Your profile is under admin review. You will be notified once approved."
        : "Your admin account is active."}
    </p></div>`),
};

exports.sendEmail = async ({ to, subject, html, template, templateData }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`📧 [Email not configured] Would send "${subject}" to ${to}`);
    return;
  }
  try {
    const finalHtml = template && templates[template] ? templates[template](templateData) : html;
    const info = await getTransporter().sendMail({
      from: `"MediConnect 🏥" <${process.env.EMAIL_USER}>`,
      to, subject, html: finalHtml,
    });
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`❌ Email failed to ${to}:`, err.message);
  }
};

exports.verifyEmailConnection = async () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("📧 Email not configured — add EMAIL_USER and EMAIL_PASS to .env");
    return false;
  }
  try {
    await getTransporter().verify();
    console.log("✅ Email server connected");
    return true;
  } catch (err) {
    console.error("❌ Email server failed:", err.message);
    return false;
  }
};
