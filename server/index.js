const expr = require("express");
const mg = require("mongoose");
const app = expr();
const cors = require("cors");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
const allowedOrigins = [
  "http://localhost:3000",                   
  "https://dev-connector-client1.netlify.app/", 
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use("/uploads", expr.static("uploads"));

const authRoutes = require("./routes/auth");
const profileRoute = require("./routes/userProfile");
const allProfiles = require("./routes/allProfiles");
const feedRoutes = require("./routes/feedRoutes");

mg.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("connected with db");
  })
  .catch((err) => console.log("Error connecting to db>>",err));
app.use(expr.json());

app.use("/api/auth", authRoutes);
app.use("/api/user-profile", profileRoute);
app.use("/api/profiles", allProfiles);
app.use("/api/feed", feedRoutes);

// Socket io
const http = require("http");
const socketio = require("socket.io");
const Notification = require("./models/Notification");

const server = http.createServer(app);


const io = socketio(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS in Socket.IO"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});



const onlineUsers = new Map();
io.on("connection", (socket) => {
  socket.on("register", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log("in register")
  });

  socket.on(
    "sendNotification",
    async ({ senderId, receiverId, type, post }) => {
      const newNotification = new Notification({
        senderId,
        receiverId,
        type,
        post,
        createdAt: new Date(),
        isRead: false,
      });
      await newNotification.save();

      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) {
        io.to(receiverSocket).emit("getNotification", { senderId, type, post });
      }
    }
  );
  socket.on("disconnect", () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});

app.get('/ping', (req, res) => {
  res.send('pong');
});


// Start server
server.listen(5000, () => {
  console.log("Server with socket running on port 5000");
});
