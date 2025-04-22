const logger = require("../utils/logger");
const { validateCreatePost } = require("../utils/validation");
const Post = require("../models/Post");

// with-cache -> load time is very less
// to invalidate cache when new post is created
// otherwise keeps on returning the same cached posts
async function invalidatePostCache(req, input) {
  const cachedKey = `post:${input}`;
  await req.redisClient.del(cachedKey);

  const keys = await req.redisClient.keys("posts:*");
  if (keys.length > 0) {
    await req.redisClient.del(keys);
  }
}

const createPost = async (req, res) => {
  logger.info("Create post endpoint hit");
  try {
    const { error } = validateCreatePost(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { content, mediaIds } = req.body;

    const newlyCreatedPost = new Post({
      // from the access-token passed in authHeader
      user: req.user.userId,
      content,
      mediaIds: mediaIds || [],
    });
    await newlyCreatedPost.save();
    // invalidate cache just after saving the new post
    await invalidatePostCache(req, newlyCreatedPost._id.toString());

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const cacheKey = `posts:${page}:${limit}`;
    const cachedPosts = await req.redisClient.get(cacheKey);
    if (cachedPosts) {
      return res.json(JSON.parse(cachedPosts));
    }
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const total = await Post.countDocuments();

    const result = {
      posts,
      currentpage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    };

    // save Posts in redis cache
    // 300 -> 5 mins.
    await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));

    res.json(result);
  } catch (e) {
    logger.error("error fetching posts", e);
    res.status(500).json({ success: false, message: "error fetching posts" });
  }
};

const getPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const cachekey = `post:${postId}`;
    const cachedPost = await req.redisClient.get(cachekey);

    if (cachedPost) {
      return res.json(JSON.parse(cachedPost));
    }

    const singlePostDetailsbyId = await Post.findById(postId);

    if (!singlePostDetailsbyId) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    await req.redisClient.setex(
      cachedPost,
      3600,
      JSON.stringify(singlePostDetailsbyId)
    );

    res.json(singlePostDetailsbyId);
  } catch (e) {
    logger.error("error getting post by ID", e);
    res
      .status(500)
      .json({ success: false, message: "error getting post by ID" });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    //publish post delete method ->
    // await publishEvent("post.deleted", {
    //   postId: post._id.toString(),
    //   userId: req.user.userId,
    //   mediaIds: post.mediaIds,
    // });

    // passing in cache in getPost
    await invalidatePostCache(req, req.params.id);
    res.json({
      message: "Post deleted successfully",
    });
  } catch (e) {
    logger.error("error deleting post", e);
    res.status(500).json({ success: false, message: "error deleting post" });
  }
};

module.exports = { createPost, getAllPosts, getPost, deletePost };
