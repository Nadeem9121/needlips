// controllers/userVerificationController.js
const User = require("../models/userModel");
const { generateOTP, sendOTPEmail } = require("../utils/otpSending");

// Controller to request OTP for user verification
exports.requestUserVerification = async (req, res) => {
  const currentUserId = req.user.id; // Get current user's ID

  try {
    const user = await User.findById(currentUserId); // Find the current user

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a new OTP
    const otp = generateOTP();
    const otpData = {
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000, // OTP valid for 10 minutes
    };

    user.otps.push(otpData); // Save OTP to user model
    await user.save();

    await sendOTPEmail(user.email, otp); // Send OTP to user's email

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Controller to verify OTP
exports.verifyUser = async (req, res) => {
  const { otp } = req.body; // OTP from the request body
  const currentUserId = req.user.id; // Get current user's ID

  try {
    const user = await User.findById(currentUserId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find a valid OTP
    const validOtp = user.otps.find((otpEntry) => {
      return otpEntry.otp === otp && Date.now() < otpEntry.otpExpires;
    });

    if (!validOtp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true; // Mark user as verified
    user.otps = []; // Clear all OTPs
    await user.save();

    res.status(200).json({ message: "User verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Function to resend OTP for verification
exports.resendVerificationEmail = async (req, res) => {
  const currentUserId = req.user.id; // Get current user's ID

  try {
    const user = await User.findById(currentUserId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    // Generate a new OTP
    const otp = generateOTP();
    const otpData = {
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000, // OTP valid for 10 minutes
    };

    user.otps.push(otpData); // Save new OTP to user model
    await user.save();

    // Send new OTP email
    await sendOTPEmail(user.email, otp);

    res.status(200).json({ message: "New OTP sent to your email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
