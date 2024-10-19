// userController.js
const User = require("../models/userModel"); // Assuming User model is in models/userModel.js
const fs = require("fs");
const path = require("path");
const catchAsync = require("../utils/catchAsync");

//Get All Users
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  //SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { fullName, bio, website } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullName, bio, website },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Update user's profile picture path
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: req.file.path },
      { new: true }
    );

    res.status(200).json({
      message: "Profile picture uploaded successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete a user's profile picture
exports.deleteProfilePicture = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user || !user.profilePicture) {
      return res.status(404).json({ message: "Profile picture not found" });
    }

    // Delete the file from the server
    fs.unlinkSync(path.resolve(user.profilePicture));

    // Update user document to remove profile picture path
    user.profilePicture = null;
    await user.save();

    res.status(200).json({ message: "Profile picture deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
