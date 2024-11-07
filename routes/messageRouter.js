const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messagingController");
const multer = require("multer");

// Set up Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/messages/"); // Change to your desired upload folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Create the upload middleware
const upload = multer({ storage });

// Route to send a message
router.post(
  "/send-message",
  upload.single("media"),
  messageController.sendMessage
);

// Other routes for your message controller...
// router.get("/", messageController.getMessages);
// router.put("/:messageId", messageController.updateMessageStatus);

module.exports = router;
