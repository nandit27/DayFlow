import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import logger from "./utils/logger.js";
import connectDB from "./config/mongodb.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import authRouter from "./routes/auth.route.js";
import { globalRateLimiter } from "./middlewares/rateLimiter.js";

dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.production" : ".env",
});

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

app.use(helmet());
app.use(morgan("dev"));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(globalRateLimiter);

app.use("/api/auth", authRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

app.use(errorHandler);

app.use("*", (req, res, next) => {
  try {
    res.status(404).json({ status: "error", message: "Route not found" });
  } catch (error) {
    next(error);
  }
});
app.listen(PORT, async () => {
  try {
    await connectDB();
    logger.info(`Server running on port ${PORT}`);
  } catch (error) {
    logger.error("Error starting server", error);
    process.exit(1);
  }
});
