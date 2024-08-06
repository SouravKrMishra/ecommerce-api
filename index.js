require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server);
require("./configs/connect.js");
const userRouter = require("./routes/user.js");
const adminRouter = require("./routes/admin.js");
const email = require("./routes/email.js");
const forgotPasswordRouter = require("./routes/forgotPassword");
const User = require("./models/user.js");
const ChatMessage = require("./models/chatMessage.js");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cookie = require("cookie"); // for parsing cookie
// const io = require("./socket");
app.use(cookieParser());
const {
  swaggerUi,
  loadSwaggerDocument,
} = require("./routes/swagger/swagger.js");

loadSwaggerDocument()
  .then((swaggerDocument) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  })
  .catch((error) => {
    console.error("Failed to load Swagger document:", error);
  });

app.set("view engine", "ejs"); //setting view engine to ejs
// app.set("views", path.resolve("./views")); //location where views are stored
app.use(express.static("css"));
app.use(express.static("views")); // or 'static', depending on your directory name
app.use("/uploads", express.static("uploads"));
app.use(express.urlencoded({ extended: false })); //middleware for form data
app.use(express.json()); //middleware to handle JSON payloads
app.use("/admin", adminRouter);
app.use("/user", userRouter);
app.use("/email", email);
app.use("/forgotPassword", forgotPasswordRouter);

io.on("connection", (socket) => {
  const cookies = cookie.parse(socket.handshake.headers.cookie || "");
  const token = cookies.token;
  if (!token) {
    return socket.disconnect(true);
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userIdJwt = decoded.userId;
    console.log("User Connected with userIdJwt: ", userIdJwt);
    socket.userId = userIdJwt;
    console.log("a user connected socket.id:", socket.id);
    socket.on("user connect", async (userId) => {
      try {
        await User.findOneAndUpdate({ _id: userId }, { socketId: socket.id });
        console.log("Socket ID stored in MongoDB for user:", userId);
      } catch (err) {
        console.error("Error storing socket ID in MongoDB:", err);
      }
    });

    socket.on("delete message", async (messageId) => {
      try {
        const message = await ChatMessage.findById(messageId);
        if (!message) {
          console.error("Message not found for deletion");
          return;
        }

        if (socket.userId !== message.sender.toString()) {
          console.log("Unauthorized deletion attempt");
          socket.emit(
            "deletion error",
            "You can only delete messages you have sent."
          );
          return;
        }
        const sender = await User.findById(message.sender);
        const recipient = await User.findById(message.recipient);

        if (sender && sender.socketId) {
          io.to(sender.socketId).emit("message deleted", messageId);
        }

        if (recipient && recipient.socketId) {
          io.to(recipient.socketId).emit("message deleted", messageId);
        }
      } catch (error) {
        console.error("Error processing message deletion:", error);
      }
    });

    socket.on("private message", async (data) => {
      const { senderEmail, recipientId, message, senderId } = data;
      try {
        if (!senderId) {
          console.error("Sender ID not found in private message event");
          return;
        }
        const isImage = message.startsWith("data:image");
        const chatMessage = new ChatMessage({
          sender: senderId,
          recipient: recipientId,
          message,
          isImage,
        });
        await chatMessage.save();
        const recipient = await User.findOne({ _id: recipientId });
        if (recipient) {
          if (message.startsWith("data:image")) {
            io.to(recipient.socketId).emit("recipient message", {
              senderEmail,
              message, // This is the Base64 string of the image
              recipient,
            });
            io.to(socket.id).emit("recipient message", {
              senderEmail,
              message,
            });
          } else {
            io.to(recipient.socketId).emit("recipient message", {
              messageId: chatMessage._id,
              senderEmail,
              message,
            });
            console.log(
              `Message sent from ${senderEmail} to ${recipient.email}: ${message}`
            );
            // console.log(chatMessage._id);
            io.to(socket.id).emit("recipient message", {
              messageId: chatMessage._id,
              senderEmail,
              message,
            });
          }
        } else {
          console.log(`Recipient ${recipientId} not found`);
        }
      } catch (err) {
        console.error("Error finding recipient in MongoDB:", err);
      }
    });

    socket.on("disconnect", async () => {
      console.log("user disconnected:", socket.userId);
      try {
        await User.findOneAndUpdate({ _id: socket.userId }, { socketId: null });
        console.log("Socket ID removed from MongoDB");
      } catch (err) {
        console.error("Error removing socket ID from MongoDB:", err);
      }
    });
  } catch (err) {
    console.error("Authentication failed:", err);
    socket.disconnect(true);
  }
});

module.exports = io;

server.listen(process.env.PORT, () =>
  console.log("Server Started At PORT", process.env.PORT || 8001)
);
