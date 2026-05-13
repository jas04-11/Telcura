// const express = require("express");
// const http = require("http");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const connectDB = require("./config/db");
// const { initSocket } = require("./socket/socket");

// // Load env vars
// dotenv.config();

// // Connect to database
// connectDB();

// const app = express();
// const server = http.createServer(app);

// // Init Socket.io
// initSocket(server);

// // Middleware
// app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Routes
// app.use("/api/auth", require("./routes/auth.routes"));
// app.use("/api/users", require("./routes/user.routes"));
// app.use("/api/doctors", require("./routes/doctor.routes"));
// app.use("/api/appointments", require("./routes/appointment.routes"));
// app.use("/api/consultations", require("./routes/consultation.routes"));
// app.use("/api/prescriptions", require("./routes/prescription.routes"));
// app.use("/api/reviews", require("./routes/review.routes"));
// app.use("/api/ai", require("./routes/ai.routes"));
// app.use("/api/admin", require("./routes/admin.routes"));
// app.use("/api/payments", require("./routes/payment.routes"));
// app.use("/api/notifications", require("./routes/notification.routes"));

// // Health check
// app.get("/", (req, res) => res.json({ message: "MediConnect API Running 🏥" }));

// // Error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(err.statusCode || 500).json({
//     success: false,
//     message: err.message || "Internal Server Error",
//   });
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { initSocket } = require("./socket/socket");
const { verifyEmailConnection } = require("./utils/email");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
initSocket(server);

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/doctors", require("./routes/doctor.routes"));
app.use("/api/appointments", require("./routes/appointment.routes"));
app.use("/api/consultations", require("./routes/consultation.routes"));
app.use("/api/prescriptions", require("./routes/prescription.routes"));
app.use("/api/reviews", require("./routes/review.routes"));
app.use("/api/ai", require("./routes/ai.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/payments", require("./routes/payment.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));

// Health check
app.get("/", (req, res) => res.json({ message: "MediConnect API Running 🏥", status: "ok" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await verifyEmailConnection();
});
