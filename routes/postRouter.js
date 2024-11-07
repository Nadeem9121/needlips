const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  createPost,
  getPosts,
  updatePost,
  deletePost,
  toggleLikePost,
  addComment,
} = require("../controllers/postController");
const authController = require("../controllers/authController");

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Set the upload destination to "uploads/posts/"
    cb(null, "uploads/posts/");
  },
  filename: function (req, file, cb) {
    // Use original filename and append a timestamp to avoid overwriting
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Multer file filter to restrict file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
  const extName = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only images (jpeg, jpg, png, gif) and videos (mp4, mov, avi) are allowed"
      )
    );
  }
};

// Multer middleware configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

// Define routes
router.post("/", authController.protect, upload.single("file"), createPost);
router.get("/", authController.protect, getPosts);
router.put("/:id", authController.protect, updatePost);
router.delete("/:id", authController.protect, deletePost);
router.put("/like/:id", authController.protect, toggleLikePost);
router.post("/:id/comment", authController.protect, addComment);

module.exports = router;
