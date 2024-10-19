const User = require("../models/userModel");
const { generateOTP, sendOTPEmail } = require("../utils/otpSending");

// Controller to request OTP for password reset
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a new OTP
    const otp = generateOTP();
    const otpData = {
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000, // OTP valid for 10 minutes
    };

    user.otps.push(otpData); // Save OTP to user's model
    await user.save();

    // Send OTP email
    await sendOTPEmail(user.email, otp);

    res
      .status(200)
      .json({ message: "OTP sent to your email for password reset" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Controller to verify OTP for password reset
exports.verifyPasswordResetOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the most recent OTP that is not expired
    const validOtpEntry = user.otps.find(
      (otpEntry) => otpEntry.otp === otp && Date.now() < otpEntry.otpExpires
    );

    if (!validOtpEntry) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Remove used OTP from user's model
    user.otps = user.otps.filter((otpEntry) => otpEntry.otp !== otp);
    await user.save();

    res.status(200).json({
      message: "OTP verified successfully. You can reset your password.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Controller to reset password
exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = newPassword; // Update the password
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
