const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  createStory,
  getStories,
  deleteStory,
} = require("../controllers/storyController");
const authController = require("../controllers/authController");

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/stories/"); // Set upload directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Multer upload configuration
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|mp4/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only .jpg, .png, and .mp4 files are allowed"));
    }
  },
});

// Create a new story
router.post("/", authController.protect, upload.single("file"), createStory);
// Get stories for the authenticated user
router.get("/", authController.protect, getStories);
// Delete a story
router.delete("/:id", authController.protect, deleteStory);

module.exports = router;
