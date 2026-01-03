import winston from "winston";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { mkdirSync, existsSync } from "fs";

// Create logs directory if it doesn't exist
const __dirname = dirname(fileURLToPath(import.meta.url));
const logDir = `${__dirname}/logs`;

if (!existsSync(logDir)) {
  mkdirSync(logDir);
}

// Create a logger instance
const logger = winston.createLogger({
  level: "info", // Minimum level to log
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }), // Log the full stack
    winston.format.splat(),
    winston.format.json() // JSON format
  ),
  defaultMeta: { service: "Auth-Mern-Project" },
  transports: [
    // Console transport (for development)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // File transport (for errors)
    new winston.transports.File({
      filename: `${logDir}/error.log`,
      level: "error",
    }),
    // File transport (for all logs)
    new winston.transports.File({
      filename: `${logDir}/combined.log`,
    }),
  ],
});

export default logger;
