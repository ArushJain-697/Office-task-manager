const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const sicarioRoutes = require("./routes/sicarioRoutes");
const fixerRoutes = require("./routes/fixerRoutes");
const connectionRoutes = require("./routes/connectionRoutes");
const userRoutes = require("../routes/userRoutes");

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL || "https://sicari.works",
  "https://sicari.works",
  "https://www.sicari.works",
  "http://localhost:5173",
].filter(Boolean);

// app.use(
//   cors({
//     origin(origin, callback) {
//       const isDev = process.env.NODE_ENV !== "production";
//       const isLocalDevOrigin =
//         isDev &&
//         (/^http:\/\/localhost:\d+$/.test(origin || "") ||
//           /^http:\/\/127\.0\.0\.1:\d+$/.test(origin || ""));

//       if (!origin || allowedOrigins.includes(origin) || isLocalDevOrigin) {
//         callback(null, true);
//         return;
//       }
//       callback(new Error("Not allowed by CORS"));
//     },
//     credentials: true,
//   })
// );
app.use(cors())
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// ==========================================
// 🛡️ THE SYNDICATE EDGE GUARD (v2 - Timing Safe)
// ==========================================
// app.use((req, res, next) => {
//   if (process.env.NODE_ENV !== "production") return next();
//   const incomingToken = req.headers['x-edge'];
//   const expectedToken = process.env.EDGE_SECRET;
//   if (!incomingToken || !expectedToken) {
//     return res.status(403).json({ error: "Access Denied. Missing Signature." });
//   }
//   try {
//     const isMatch = crypto.timingSafeEqual(Buffer.from(incomingToken), Buffer.from(expectedToken));
//     if (!isMatch) throw new Error("Mismatch");
//   } catch (err) {
//     console.warn(`🚨 UNAUTHORIZED ORIGIN ATTEMPT: ${req.ip}`);
//     return res.status(403).json({ error: "Access Denied. Invalid Edge Signature." });
//   }
//   next();
// });

app.get("/api", (_req, res) => {
  res.json({ message: "Hello from the backend!" });
});

const apiRouter = express.Router();
apiRouter.use("/auth", authRoutes);
apiRouter.use("/posts", postRoutes);
apiRouter.use("/sicario", sicarioRoutes);
apiRouter.use("/fixer", fixerRoutes);
apiRouter.use("/connections", connectionRoutes);
apiRouter.use("/profile", userRoutes);

app.use("/api", apiRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found. Please check the API documentation." });
});

app.use((err, _req, res, _next) => {
  if (err && err.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "CORS blocked this origin" });
  }
  if (err && err.message === "Only image files are allowed (jpg, png, webp, gif)") {
    return res.status(400).json({ message: err.message });
  }
  if (err && err.code === "MISSING_FIELD_NAME") {
    return res.status(400).json({ message: "File field name missing. Use 'photo' as the key." });
  }
  if (err && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File too large. Max 5MB." });
  }
  console.error("Unhandled error:", err);
  const response = { message: "Internal server error" };
  if (process.env.NODE_ENV !== "production") response.error = err?.message || "Unknown error";
  return res.status(500).json(response);
});

module.exports = app;