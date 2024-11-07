const Post = require("../models/postModel");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");

async function sendNotificationToFollowers(post, fromUser, type) {
  try {
    const postOwner = await User.findById(post.user);
    if (!postOwner) {
      throw new Error("Post owner not found");
    }

    console.log("Followers of post owner:", postOwner.followers);

    for (const followerId of postOwner.followers) {
      if (!mongoose.Types.ObjectId.isValid(followerId)) {
        console.error(`Invalid follower ID: ${followerId}`);
        continue; // Skip if invalid
      }

      const notification = new Notification({
        user: followerId,
        type,
        post: post._id,
        fromUser,
      });

      await notification.save();
      console.log(`Notification saved for user ${followerId}`);
    }
  } catch (error) {
    console.error("Error sending notifications:", error);
  }
}
// Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
  const { notificationId } = req.params;
  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new post
exports.createPost = [
  async (req, res) => {
    try {
      const { caption, type } = req.body;
      const userId = req.user.id;

      // if (!caption || !type) {
      //   return res
      //     .status(400)
      //     .json({ message: "Caption and type are required" });
      // }

      if (!req.file) {
        return res.status(400).json({ message: "Media file is required" });
      }

      const post = new Post({
        caption,
        type,
        imageUrl: req.file.path,
        user: userId,
      });

      await post.save();
      res.status(201).json(post);
      await sendNotificationToFollowers(post, userId, "new post");
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
];

// Get paginated posts
exports.getPosts = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const posts = await Post.find()
      .populate("user", "username profilePicUrl")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  const { id } = req.params;
  const { caption } = req.body;

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "User not authorized" });
    }

    post.caption = caption || post.caption;
    await post.save();

    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user is authorized to delete the post
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "User not authorized" });
    }

    // Remove the associated image file if it exists
    if (fs.existsSync(post.imageUrl)) {
      fs.unlinkSync(post.imageUrl);
    }

    // Remove the post from the database
    await Post.findByIdAndDelete(id);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Like or unlike a post
exports.toggleLikePost = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes = post.likes.filter((like) => like.toString() !== userId);
    } else {
      post.likes.push(userId);
      // Send notification for the like
      await sendNotificationToFollowers(post, userId, "like");
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add a comment to a post
exports.addComment = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const userId = req.user.id;

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = {
      user: userId,
      text,
    };

    post.comments.push(comment);
    await post.save();

    // Send notification for the comment
    await sendNotificationToFollowers(post, userId, "comment");

    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
