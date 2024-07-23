require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server);
// const path = require("path");
require("./configs/connect.js");
const userRouter = require("./routes/user.js");
const adminRouter = require("./routes/admin.js");
const email = require("./routes/email.js");
const forgotPasswordRouter = require("./routes/forgotPassword");
const User = require("./models/user.js");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cookie = require("cookie"); // for parsing cookie
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
    const userId = decoded.userId;
    console.log("User Connected: ", userId);
    socket.userId = userId;
    console.log("a user connected:", socket.id);
    socket.on("user connect", async (userId) => {
      try {
        await User.findOneAndUpdate({ _id: userId }, { socketId: socket.id });
        console.log("Socket ID stored in MongoDB for user:", userId);
      } catch (err) {
        console.error("Error storing socket ID in MongoDB:", err);
      }
    });

    socket.on("private message", async (data) => {
      const { senderId, recipientId, message } = data;

      try {
        const recipient = await User.findOne({ _id: recipientId });
        if (recipient) {
          io.to(recipient.socketId).emit("private message", {
            senderId,
            message,
          });
          console.log(
            `Message sent from ${senderId} to ${recipientId}: ${message}`
          );
          io.to(socket.id).emit("private message", {
            senderId,
            message,
          });
        } else {
          console.log(`Recipient ${recipientId} not found`);
        }
      } catch (err) {
        console.error("Error finding recipient in MongoDB:", err);
      }
    });

    // socket.on("typing", (userId) => {
    //   socket.broadcast.emit("typing", userId);
    // });

    // socket.on("stop typing", (userId) => {
    //   socket.broadcast.emit("stop typing", userId);
    // });

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

server.listen(process.env.PORT, () =>
  console.log("Server Started At PORT", process.env.PORT || 8001)
);
