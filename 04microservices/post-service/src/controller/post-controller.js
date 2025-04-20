const logger = require("../utils/logger");
const { validateCreatePost } = require("../utils/validation");
const Post = require("../models/Post");

const createPost = async (req, res) => {
  logger.info("Create post endpoint hit");
  try {
    const { content, mediaIds } = req.body;

    const newlyCreatedPost = new Post({
      // from the access-token passed in authHeader
      user: req.user.userId,
      content,
      mediaIds: mediaIds || [],
    });
    await newlyCreatedPost.save();

    logger.info("Post created successfully", newlyCreatedPost);
    res
      .status(201)
      .json({ success: true, message: "Post created successfully" });
  } catch (e) {
    logger.error("error creating post", e);
    res.status(500).json({ success: false, message: "error creating post" });
  }
};

const getAllPosts = async (req, res) => {
  try {
  } catch (e) {
    logger.error("error fetching posts", e);
    res.status(500).json({ success: false, message: "error fetching posts" });
  }
};

const getPost = async (req, res) => {
  try {
  } catch (e) {
    logger.error("error getting post by ID", e);
    res
      .status(500)
      .json({ success: false, message: "error getting post by ID" });
  }
};

const deletePost = async (req, res) => {
  try {
  } catch (e) {
    logger.error("error deleting post", e);
    res.status(500).json({ success: false, message: "error deleting post" });
  }
};

module.exports = { createPost };
