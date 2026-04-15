import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import socketHandler from "./socket/socketHandler.js";
import dns from "node:dns/promises";
dns.setServers(["1.1.1.1"]);
dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Meeting app backend running");
});

app.use("/api/auth", authRoutes);
app.use("/api/meetings", meetingRoutes);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

socketHandler(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
