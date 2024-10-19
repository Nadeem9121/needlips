const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  fullName: {
    type: String,
    trim: true,
  },
  bio: {
    type: String,
    maxlength: 160, // Optional limit for Twitter-like bios
  },
  profilePicture: {
    type: String, // URL to the profile picture
  },
  coverPhoto: {
    type: String, // URL to the cover photo (optional)
  },
  website: {
    type: String,
    trim: true,
  },

  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post", // Assuming you have a Post model
    },
  ],
  likedPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  notifications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification", // Assuming you have a Notification model
    },
  ],
  followRequests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Referring to User model for follow requests
    },
  ],
  otps: [
    {
      otp: {
        type: String, // To store the OTP
      },
      otpExpires: {
        type: Date, // To store when the OTP expires
      },
    },
  ],
  isVerified: {
    type: Boolean,
    default: false,
  },
  isPrivate: {
    type: Boolean,
    default: false, // For private accounts
  },
  isAdmin: {
    type: Boolean,
    default: false, // Set to true for admin users
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field on every save
UserSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

UserSchema.pre("save", async function (next) {
  //Only run this function if password was actually modified
  if (!this.isModified("password")) return next();
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if the password was changed after the token was issued
UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  // False means not changed
  return false;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
