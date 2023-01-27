const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const mongoose = require("mongoose");
const DbConnection = require("./db/db");
const morgan = require("morgan");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const app = express();

const socketio = require("socket.io");
const server = require("http").Server(app);
const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const GroupsParticipants = require("./models/groupParticipants");

// routes
const userRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const postRouter = require("./routes/post");
const conversationRouter = require("./routes/conversation");
const messageRouter = require("./routes/messages");
const groupsRoute = require("./routes/groups");
const groupParticipantsRoute = require("./routes/groupParticipants");
const transaction = require("./routes/transactions");
const task = require("./routes/task");
const errorHandler = require("./middleware/error");

dotenv.config();

DbConnection();
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Middleware
app.use(cors());
app.use(express.json()); //bodyParser allow post request
app.use(helmet());
app.use(morgan("dev"));
app.set("socketio", io);

//socket server
io.on("connection", (socket) => {
  console.log("A user connected");

  //take connected user's id
  socket.on("addUser", async (userId) => {
    console.log("user added " + userId);
    console.log(socket.id);
    const groups = await GroupsParticipants.find({ userId: userId });
    for (let i = 0; i < groups.length; i++) {
      socket.join(groups[i].groupId);
      console.log("joined");
    }
    console.log(socket.rooms);
  });

  //send to all users
  socket.on("disconnect", () => {
    console.log("A user disconnected");
    // removeUser(socket.id);
    // io.emit("getAllOnlineUsers", connectedUsers);
  });
});
//socket server

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("File uploaded successfully");
  } catch (error) {
    console.log(error);
  }
});

app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/post", postRouter);
app.use("/api/conversations", conversationRouter);
app.use("/api/messages", messageRouter);
app.use("/api/groups", groupsRoute);
app.use("/api/groupParticipants", groupParticipantsRoute);
app.use("/api/transactions", transaction);
app.use("/api/tasks", task);
app.use(errorHandler);
PORT = process.env.PORT;
// app.listen(PORT, console.log(`Server started at ${PORT}`));
server.listen(PORT, console.log(`Server started at ${PORT}`));
