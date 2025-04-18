const logger = require("../utils/logger");
const { validateRegistration } = require("../utils/validation");
const User = require("../models/User");
const generateTokens = require("../utils/generateToken");

// Registration
const registerUser = async (req, res) => {
  logger.info("registration end-point hit");
  try {
    // validate the schema
    const { error } = validateRegistration(req.body);
    if (error) {
      logger.warn("validation error", error.details[0].message);
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const { email, password, username } = req.body();

    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      logger.warn("user already exists", error.details[0].message);
      return res
        .status(400)
        .json({ success: false, message: "user already exists" });
    }

    user = new User({ username, email, password });
    await user.save();
    logger.warn("user saved successfully", user._id);

    const { accessToken, refreshToken } = await generateTokens(user);

    return res.status(201).json({
      success: true,
      message: "user registered successfully",
      accessToken,
      refreshToken,
    });
  } catch (e) {
    logger.error("registration error", e);
    return res
      .status(500)
      .json({ success: false, message: "registration error internal server" });
  }
};

module.exports = { registerUser };
