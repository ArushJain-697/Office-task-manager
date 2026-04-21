const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const swaggerUi = require("swagger-ui-express");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");
const { swaggerSpec } = require("./swagger");

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      const isDev = process.env.NODE_ENV !== "production";
      const isLocalDevOrigin =
        isDev &&
        (/^http:\/\/localhost:\d+$/.test(origin || "") ||
          /^http:\/\/127\.0\.0\.1:\d+$/.test(origin || ""));

      if (!origin || allowedOrigins.includes(origin) || isLocalDevOrigin) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// Production-only request signature guard (timing-safe compare)
app.use((req, res, next) => {
  // Allow OPTIONS requests to pass through so CORS preflight works!
  if (req.method === 'OPTIONS') {
    return next();
  }

  if (process.env.NODE_ENV !== "production") return next();
  const incomingToken = req.headers['x-edge'];
  const expectedToken = process.env.EDGE_SECRET;

  // Use crypto.timingSafeEqual carefully (length must match or it throws instantly)
  if (!incomingToken || !expectedToken) {
    return res.status(403).json({ error: "Access denied. Missing signature." });
  }

  try {
    const incBuf = Buffer.from(incomingToken, 'utf8');
    const expBuf = Buffer.from(expectedToken, 'utf8');

    // timingSafeEqual throws if lengths are different
    if (incBuf.length !== expBuf.length || !crypto.timingSafeEqual(incBuf, expBuf)) {
      throw new Error("Mismatch");
    }
  } catch (err) {
    console.warn(`Unauthorized signature attempt: ${req.ip}`);
    return res.status(403).json({ error: "Access denied. Invalid signature." });
  }
  next();
});

app.get("/api/v1", (_req, res) => {
  res.json({ message: "Office Task Manager API v1" });
});

const apiV1Router = express.Router();
apiV1Router.use("/auth", authRoutes);
apiV1Router.use("/tasks", taskRoutes);
apiV1Router.use("/users", userRoutes);
apiV1Router.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1", apiV1Router);

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