const http = require("http");
const socketIo = require("socket.io");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = require("./app");
const Message = require("./models/messagingModel");
const Chat = require("./models/chatModel"); // Assuming you have a Chat model

dotenv.config({ path: "./config.env" });

// Database connection
const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);
mongoose.connect(DB).then(() => console.log("DB Connection Successful!"));

// Setting up server and Socket.IO
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

const port = process.env.PORT || 3000;

// Store active users
let activeUsers = new Map();

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // When a user joins the chat
  socket.on("join", (userId) => {
    activeUsers.set(userId, socket.id);
    console.log(`User ${userId} joined with socket ID ${socket.id}`);
  });

  // Handling private messages
  socket.on(
    "sendMessage",
    async ({ senderId, receiverId, chatId, message, media }) => {
      const newMessage = await Message.create({
        sender: senderId,
        receiver: receiverId,
        message,
        media,
        status: "sent",
      });

      // Update the chat with the new message
      const chat = await Chat.findByIdAndUpdate(
        chatId,
        {
          $push: { messages: newMessage._id },
          lastMessage: newMessage._id,
        },
        { new: true }
      );

      const receiverSocketId = activeUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", newMessage);

        // Update message status to "delivered"
        newMessage.status = "delivered";
        await newMessage.save();
      }

      socket.emit("messageSent", newMessage); // Acknowledgement to the sender
    }
  );

  // Typing indicator
  socket.on("typing", ({ chatId, senderId }) => {
    socket.to(chatId).emit("userTyping", { senderId });
  });

  // Disconnecting users
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    activeUsers = new Map(
      [...activeUsers].filter(([_, id]) => id !== socket.id)
    );
  });
});

server.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
