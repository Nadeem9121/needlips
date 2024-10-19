// userRoutes.js
const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const userVerfication = require("../controllers/userVerfication");
const forgotPassword = require("../controllers/forgotPassword");
const upload = require("../config/multerConfig");

const router = express.Router();

// Route for registering a new user
router.post("/register", authController.signup);

router.post("/login", authController.login);

// Router for get all users
router.get(
  "/get-all-users",
  authController.protect,
  authController.restrictedToAdmin,
  userController.getAllUsers
);

// Route for updating a user's profile
router.put("/:userId", userController.updateUserProfile);

// Route for uploading a profile picture
router.post(
  "/:userId/upload",
  upload.single("profilePicture"),
  userController.uploadProfilePicture
);

// Route for deleting a profile picture
router.delete(
  "/:userId/delete-profile-picture",
  userController.deleteProfilePicture
);

router.post(
  "/verify/request",
  authController.protect,
  userVerfication.requestUserVerification
);
router.post("/verify", authController.protect, userVerfication.verifyUser);
router.post(
  "/resend-verification",
  authController.protect,
  userVerfication.resendVerificationEmail
);

// Route to request OTP for password reset
router.post("/request-password-reset", forgotPassword.requestPasswordReset);

// Route to verify OTP for password reset
router.post(
  "/verify-password-reset-otp",
  forgotPassword.verifyPasswordResetOTP
);
// Route to reset password
router.post("/reset-password", forgotPassword.resetPassword);
// Route to logout
router.post("/logout", authController.logout);

module.exports = router;
