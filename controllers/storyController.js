const Story = require("../models/storyModel");
const User = require("../models/userModel");
const fs = require("fs");
const path = require("path");

// Create a new story
exports.createStory = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: "Media file is required" });
    }

    const mediaType = req.file.mimetype.startsWith("video") ? "video" : "image";

    const story = new Story({
      user: userId,
      mediaUrl: req.file.path,
      mediaType,
    });

    await story.save();

    // Notify followers about the new story
    await notifyFollowers(userId, "newStory");

    res.status(201).json(story);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Retrieve all stories for a user
exports.getStories = async (req, res) => {
  try {
    const userId = req.user.id;
    const stories = await Story.find({ user: userId })
      .populate("user", "username profilePicUrl")
      .sort({ createdAt: -1 });

    res.status(200).json(stories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a story
exports.deleteStory = async (req, res) => {
  const { id } = req.params;

  try {
    const story = await Story.findById(id);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    if (story.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "User not authorized" });
    }

    // Remove the media file
    if (fs.existsSync(story.mediaUrl)) {
      fs.unlinkSync(story.mediaUrl);
    }

    await Story.findByIdAndDelete(id);

    res.status(200).json({ message: "Story deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Notify followers about new stories
async function notifyFollowers(userId, type) {
  const user = await User.findById(userId).populate("followers", "username");
  user.followers.forEach((follower) => {
    // Implement your notification logic here (e.g., save to a notifications collection)
    console.log(`Notifying ${follower.username} about a new story.`);
  });
}
