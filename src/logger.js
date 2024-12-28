const winston = require("winston");
const fs = require("fs");
const path = require("path");

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const DEFAULT_LEVEL = 'warn'
const getLogLevel = () => {
  const args = process.argv.slice(2);
  const levelIndex = args.findIndex((arg) => arg === "--log-level");
  if (levelIndex !== -1 && args[levelIndex + 1]) {
    return args[levelIndex + 1];
  }
  return process.env.LOG_LEVEL || DEFAULT_LEVEL;
};

const logger = winston.createLogger({
  level: getLogLevel(),
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Add log level information
logger.info(`Current log level: ${logger.level}`);

module.exports = logger;
