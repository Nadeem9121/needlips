const Message = require("../models/messagingModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Send a message
exports.sendMessage = catchAsync(async (req, res, next) => {
  const { senderId, receiverId, message, chatId } = req.body; // Get chatId from request body
  let media = req.file ? req.file.path : null; // Check if a file was uploaded

  // Validate the input
  if (!senderId || !receiverId || !chatId || (!message && !media)) {
    return next(
      new AppError(
        "Sender ID, Receiver ID, Chat ID, and either Message content or Media file are required!",
        400
      )
    );
  }

  // Create a new message
  const newMessage = await Message.create({
    sender: senderId,
    receiver: receiverId,
    message,
    media,
    chat: chatId, // Include the chat field
    status: "sent",
  });

  res.status(201).json({
    status: "success",
    data: {
      message: newMessage,
    },
  });
});

// Get messages between two users
exports.getMessages = catchAsync(async (req, res, next) => {
  const { userId1, userId2 } = req.params;

  // Find messages between the two users where media is visible
  const messages = await Message.find({
    $or: [
      { sender: userId1, receiver: userId2, isMediaVisible: true },
      { sender: userId2, receiver: userId1, isMediaVisible: true },
    ],
  }).sort({ createdAt: 1 }); // Sort by creation date

  res.status(200).json({
    status: "success",
    results: messages.length,
    data: {
      messages,
    },
  });
});

// Update message status (for read receipts)
exports.updateMessageStatus = catchAsync(async (req, res, next) => {
  const { messageId } = req.params;
  const { status } = req.body;

  // Validate status
  if (!["delivered", "read"].includes(status)) {
    return next(new AppError("Status must be 'delivered' or 'read'.", 400));
  }

  // Find and update the message status
  const updatedMessage = await Message.findByIdAndUpdate(
    messageId,
    { status },
    { new: true, runValidators: true }
  );

  if (!updatedMessage) {
    return next(new AppError("No message found with that ID.", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      message: updatedMessage,
    },
  });
});

// "Delete" a message (disable media visibility)
exports.deleteMessage = catchAsync(async (req, res, next) => {
  const { messageId } = req.params;

  // Find the message first
  const message = await Message.findById(messageId);

  if (!message) {
    return next(new AppError("No message found with that ID.", 404));
  }

  // Update the media visibility to false
  message.isMediaVisible = false;

  // Save the updated message
  await message.save();

  res.status(200).json({
    status: "success",
    message: "Media visibility disabled successfully",
    data: {
      message,
    },
  });
});

// Get all messages for a user
exports.getAllMessagesForUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const messages = await Message.find({
    $or: [{ sender: userId }, { receiver: userId }],
  }).sort({ createdAt: -1 }); // Sort by creation date

  res.status(200).json({
    status: "success",
    results: messages.length,
    data: {
      messages,
    },
  });
});

// Typing indicator (socket event)
exports.typingIndicator = (req, res, next) => {
  const { senderId, receiverId } = req.body;

  // Emit typing event using Socket.IO
  req.io.to(receiverId).emit("typing", { senderId });

  res.status(200).json({
    status: "success",
    message: "Typing indicator sent",
  });
};

// Search messages
exports.searchMessages = catchAsync(async (req, res, next) => {
  const { userId, query } = req.params;

  const messages = await Message.find({
    $or: [
      { sender: userId, message: { $regex: query, $options: "i" } },
      { receiver: userId, message: { $regex: query, $options: "i" } },
    ],
  }).sort({ createdAt: 1 });

  res.status(200).json({
    status: "success",
    results: messages.length,
    data: {
      messages,
    },
  });
});
