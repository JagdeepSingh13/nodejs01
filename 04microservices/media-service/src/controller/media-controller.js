const Media = require("../models/Media");
const { uploadMediaToCloudinary } = require("../utils/cloudinary");
const logger = require("../utils/logger");

const uploadMedia = async (req, res) => {
  logger.info("Starting media upload");
  try {
    if (!req.file) {
      logger.error("No file found");
      res.status(400).json({ success: false, message: "No file found" });
    }

    const { originalname, mimetype, buffer } = req.file;
    const userId = req.user.userId;

    logger.info(`File details: name=${originalname}, type=${mimetype}`);
    logger.info("Uploading to cloudinary, START");

    const cloudinaryUploadResult = await uploadMediaToCloudinary(req.file);
    logger.info(
      `Cloudinary upload successfull, Public id: ${cloudinaryUploadResult.public_id}`
    );

    const newlyCreatedMedia = new Media({
      publicId: cloudinaryUploadResult.public_id,
      originalName: originalname,
      mimeType: mimetype,
      url: cloudinaryUploadResult.secure_url,
      userId,
    });

    await newlyCreatedMedia.save();

    res.status(201).json({
      success: true,
      mediaId: newlyCreatedMedia._id,
      url: newlyCreatedMedia.url,
      message: "Media upload successful",
    });
  } catch (e) {
    logger.error("error uploading media", e);
    res.status(500).json({ success: false, message: "error uploading media" });
  }
};

const getAllMedias = async (req, res) => {
  try {
    const result = await Media.find({ userId: req.user.userId });
    res.json({ result });

    // if (result.length === 0) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "Can't find any media for this user",
    //   });
    // }
  } catch (e) {
    logger.error("Error fetching medias", error);
    res.status(500).json({
      success: false,
      message: "Error fetching medias",
    });
  }
};

module.exports = { uploadMedia, getAllMedias };
