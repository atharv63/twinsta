import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import likeRoutes from "./routes/likeRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import chatSearchRoutes from "./routes/chatSearchRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/chat", chatSearchRoutes);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join_chat", (chatId) => {
    const room = `chat:${chatId}`;
    socket.join(room);
    console.log(`Socket ${socket.id} joined ${room}`);
  });

  socket.on("chat_message", (message) => {
    const room = `chat:${message.chatId}`;
    io.to(room).emit("chat_message", message);
  });

  socket.on("disconnect", () => console.log("Socket disconnected:", socket.id));
});

app.get("/", (req, res) => res.send("Server is running"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
