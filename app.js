const express = require("express");
const path = require("path");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const morgan = require("morgan");
const userRoutes = require("./routes/userRouter");
const postRoutes = require("./routes/postRouter");
const notificationRoutes = require("./routes/notificationRouter");
const storiesRoutes = require("./routes/storyRouter");
const followAndUnfollowRouter = require("./routes/followAndUnfollowRouter");
const messageRoutes = require("./routes/messageRouter");
const chatRoutes = require("./routes/chatRouter");
const app = express();

app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// Middleware
app.use(express.json());
app.use(cors());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({}));

// Routers
app.use("/api", followAndUnfollowRouter);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/stories", storiesRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/chats", chatRoutes);

module.exports = app;
