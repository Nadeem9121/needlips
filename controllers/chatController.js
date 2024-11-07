const Chat = require("../models/chatModel");
const Message = require("../models/messagingModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");

// Create a new chat
exports.createChat = catchAsync(async (req, res, next) => {
  const { participants } = req.body;

  if (!participants || participants.length < 2) {
    return next(new AppError("At least two participants are required.", 400));
  }

  const newChat = await Chat.create({ participants });

  res.status(201).json({
    status: "success",
    data: {
      chat: newChat,
    },
  });
});

// Get all chats for a user with pagination
exports.getAllChatsForUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const skip = (page - 1) * limit;

  const chats = await Chat.find({ participants: userId })
    .populate("participants", "name")
    .populate("lastMessage")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: chats.length,
    data: {
      chats,
    },
  });
});

// Get chat details including messages with pagination
exports.getChatDetails = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;

  const chat = await Chat.findById(chatId)
    .populate("participants", "name")
    .populate("lastMessage");

  if (!chat) {
    return next(new AppError("No chat found with that ID.", 404));
  }

  const messages = await Message.find({
    $or: [
      { sender: { $in: chat.participants } },
      { receiver: { $in: chat.participants } },
    ],
  }).sort({ createdAt: 1 });

  res.status(200).json({
    status: "success",
    data: {
      chat,
      messages,
    },
  });
});

// Add user to an existing chat
exports.addUserToChat = catchAsync(async (req, res, next) => {
  const { chatId, userId } = req.body;

  const chat = await Chat.findByIdAndUpdate(
    chatId,
    { $addToSet: { participants: userId } },
    { new: true }
  );

  if (!chat) {
    return next(new AppError("No chat found with that ID.", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      chat,
    },
  });
});

// Remove user from a chat
exports.removeUserFromChat = catchAsync(async (req, res, next) => {
  const { chatId, userId } = req.body;

  const chat = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { participants: userId } },
    { new: true }
  );

  if (!chat) {
    return next(new AppError("No chat found with that ID.", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      chat,
    },
  });
});

// Emit typing indicator
exports.typingIndicator = (req, res) => {
  const { chatId, userId } = req.body;
  req.io.to(chatId).emit("typing", { userId });

  res.status(200).json({
    status: "success",
    message: "Typing indicator sent",
  });
};

// Handle message read receipt
exports.readReceipt = catchAsync(async (req, res, next) => {
  const { messageId } = req.body;

  // Update message status to 'read'
  const message = await Message.findByIdAndUpdate(
    messageId,
    { status: "read" },
    { new: true }
  );

  if (!message) {
    return next(new AppError("No message found with that ID.", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      message,
    },
  });
});
