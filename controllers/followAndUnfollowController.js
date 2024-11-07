const User = require("../models/userModel"); // Make sure to import your User model
const Notification = require("../models/notificationModel"); // For notifications

// Follow a user
exports.followUser = async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;

  if (currentUserId === userId) {
    return res.status(400).json({ message: "You cannot follow yourself" });
  }

  try {
    const userToFollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!userToFollow.username || !currentUser.username) {
      return res.status(400).json({ message: "User data is incomplete" });
    }

    if (currentUser.following.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You are already following this user" });
    }

    if (userToFollow.isPrivate) {
      if (userToFollow.followRequests.includes(currentUserId)) {
        return res.status(400).json({ message: "Follow request already sent" });
      }

      userToFollow.followRequests.push(currentUserId);
      await userToFollow.save();
      return res.status(200).json({ message: "Follow request sent" });
    } else {
      currentUser.following.push(userId);
      userToFollow.followers.push(currentUserId);

      await currentUser.save();
      await userToFollow.save();

      const notification = new Notification({
        user: userId,
        type: "follow",
        fromUser: currentUserId,
      });

      await notification.save();

      return res.status(200).json({
        message: "Successfully followed the user",
        following: currentUser.following,
        followers: userToFollow.followers,
      });
    }
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// Unfollow a user
exports.unfollowUser = async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;

  if (!currentUserId || !userId) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const userToUnfollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!currentUser.following.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You are not following this user" });
    }

    // Update the followers and following arrays
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== userId
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== currentUserId
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.status(200).json({
      message: "Successfully unfollowed the user",
      following: currentUser.following,
      followers: userToUnfollow.followers,
    });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.handleFollowRequest = async (req, res) => {
  const { userId, action } = req.params; // userId of the requesting user, action is 'approve' or 'reject'
  const currentUserId = req.user.id; // The ID of the logged-in user

  try {
    const currentUser = await User.findById(currentUserId);
    const requestingUser = await User.findById(userId);

    if (!currentUser || !requestingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the request exists
    if (!currentUser.followRequests.includes(userId)) {
      return res
        .status(400)
        .json({ message: "No follow request from this user" });
    }

    if (action === "approve") {
      // Approve follow request
      currentUser.followRequests = currentUser.followRequests.filter(
        (id) => id.toString() !== userId
      );
      currentUser.followers.push(userId);
      requestingUser.following.push(currentUserId);
    } else if (action === "reject") {
      // Reject follow request
      currentUser.followRequests = currentUser.followRequests.filter(
        (id) => id.toString() !== userId
      );
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    // Save changes
    await currentUser.save();
    await requestingUser.save();

    res.status(200).json({
      message: `Follow request ${
        action === "approve" ? "approved" : "rejected"
      }`,
      followers: currentUser.followers,
      following: requestingUser.following,
    });
  } catch (error) {
    console.error("Error handling follow request:", error);
    res.status(500).json({ message: "Server error" });
  }
};
