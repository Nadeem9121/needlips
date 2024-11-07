// models/Post.js
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  caption: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  reelUrl: {
    type: String,
  },
  text: {
    type: String,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // type: {
  //   // Added to differentiate between post types
  //   type: String,
  //   enum: ["text", "picture", "reel"], // Define acceptable post types
  //   required: true,
  // },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date, // Field to track last update
  },
});

// Middleware to set updatedAt before saving
postSchema.pre("save", function (next) {
  this.updatedAt = Date.now(); // Update timestamp before saving
  next();
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
