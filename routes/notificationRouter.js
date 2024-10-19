const express = require("express");
const { markNotificationAsRead } = require("../controllers/postController");
const authController = require("../controllers/authController");

const router = express.Router();

router.put(
  "/:notificationId/read",
  authController.protect,
  markNotificationAsRead
);

module.exports = router;
