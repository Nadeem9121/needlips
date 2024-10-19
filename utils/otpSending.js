// utils/emailUtils.js
const nodemailer = require("nodemailer");

// Function to generate a 5-digit OTP
function generateOTP() {
  return Math.floor(10000 + Math.random() * 90000).toString(); // Generate a 5-digit OTP
}

// Function to send OTP email
async function sendOTPEmail(email, otp) {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // Replace with your email service
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your email password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender address
    to: email, // Recipient address
    subject: "Your OTP for Verification",
    text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  generateOTP,
  sendOTPEmail,
};
