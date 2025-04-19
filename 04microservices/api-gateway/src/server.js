require("dotenv").config();
const express = require("express");
const logger = require("./utils/logger");
const helmet = require("helmet");
const cors = require("cors");
const Redis = require("ioredis");
const errorHandler = require("./middleware/errorHandler");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");

const app = express();
const PORT = process.env.PORT || 3001;

const redisClient = new Redis(process.env.REDIS_URL);

app.use(helmet());
app.use(cors());
app.use(express.json());

// rate-limiting
const ratelimitOptions = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Sensitive end-point rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ status: false, message: "Too many requests" });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

app.use(ratelimitOptions);

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${req.body}`);
  next();
});
