const express = require("express");
const {
  followUser,
  unfollowUser,
  handleFollowRequest,
} = require("../controllers/followAndUnfollowController");
const authController = require("../controllers/authController");

const router = express.Router();

// Follow user route
router.post("/follow/:userId", authController.protect, followUser);

// Unfollow user route
router.post("/unfollow/:userId", authController.protect, unfollowUser);
router.put(
  "/follow/handle/:userId/:action",
  authController.protect,
  handleFollowRequest
);
module.exports = router;
