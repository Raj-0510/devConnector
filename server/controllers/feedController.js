const comment = require("../models/comment");
const feed = require("../models/feedModel");
const mongoose = require("mongoose");
const userProfile = require("../models/userProfile");

exports.createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "All fields required" });
    }
    const userId = req.user.id;
    const image = req?.file?.path || "";
    const user = await userProfile.findOne({ userId }).select("userName image");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const post = await feed.create({
      title,
      content,
      image,
      userId,
      userName: user?.userName,
      profileImage: user.image,
    });

    res.status(201).json({ post, msg: "Post created successfully" });
  } catch (err) {
    console.error("err>>", err);
    res.status(500).json({ error: "Failed to create post" });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const post = await feed.findById(req.params.id);
    const userId = req.user.id;

    if (!post) return res.status(404).json({ error: "Post not found" });

    const liked = post.likes.includes(userId);
    if (liked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ liked: !liked });
  } catch (err) {
    console.error("err>>", err);
    res.status(500).json({ error: "Failed to toggle like" });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { content,userName } = req.body;
    const { postId } = req.params;

    const userId = req.user.id;

    const result = await comment.create({ content, postId, userId,userName });

    await feed.findByIdAndUpdate(postId, { $push: { comments: result._id } });

    res.status(201).json(result);
  } catch (err) {
    console.error("err>>", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const posts = await feed
      .find({ userId: { $ne: userId } })
      .populate("userId", "userName image")
      .populate({
        path: "comments",
        populate: { path: "userId", select: "userName image" },
      })
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("err>>", err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.params.userId;
    const posts = await feed
      .find({ userId })
      .populate("userId", "userName image")
      .populate({
        path: "comments",
        populate: { path: "userId", select: "userName image" },
      })
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("err>>", err);

    res.status(500).json({ error: "Failed to fetch user's posts" });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await feed.findById(req.params.id);
    const userId = req.user.id;

    if (!post || post.userId.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await comment.deleteMany({ postId: post._id });
    await post.deleteOne();

    res.json({ success:true, msg:"Post deleted successfully" });
  } catch (err) {
    console.error("err>>", err);
    res.status(500).json({ error: "Failed to delete post" });
  }
};
