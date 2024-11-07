const express = require("express");
const chatController = require("../controllers/chatController");
const { protect } = require("../controllers/authController");

const router = express.Router();

// Protect routes if necessary
// router.use(protect);

// Route to create a new chat
router.post("/createChat", chatController.createChat);

// Route to get all chats for a user with pagination
router.get("/:userId", chatController.getAllChatsForUser);

// Route to get chat details including messages
router.get("/details/:chatId", chatController.getChatDetails);

// Route to add a user to an existing chat
router.patch("/add-user", chatController.addUserToChat);

// Route to remove a user from a chat
router.patch("/remove-user", chatController.removeUserFromChat);

// Route for typing indicator
router.post("/typing", chatController.typingIndicator);

// Route for message read receipt
router.patch("/read-receipt", chatController.readReceipt);

module.exports = router;
