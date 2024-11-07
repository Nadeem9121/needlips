const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to User model
    required: true,
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat", // Reference to the Chat model
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  media: {
    type: String, // URL to media file (image, video, etc.)
    default: null,
  },
  status: {
    type: String,
    enum: ["sent", "delivered", "read"], // Status of the message
    default: "sent",
  },
  isMediaVisible: {
    type: Boolean,
    default: true, // By default, media is visible
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

// Update `updatedAt` before saving
MessageSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;
