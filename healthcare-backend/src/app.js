const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
]
  .flatMap((origin) => (origin ? origin.split(",") : []))
  .map((origin) => origin.trim())
  .filter(Boolean);

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/symptoms", require("./routes/symptomRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/diet", require("./routes/dietRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/water", require("./routes/waterRoutes"));

// Health check
app.get("/", (req, res) =>
  res.json({ message: "HealthAI Backend Running ✅" }),
);

// Error handler
app.use(require("./middleware/errorHandler"));

module.exports = app;
