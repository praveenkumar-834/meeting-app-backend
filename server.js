import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dns from "node:dns/promises";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import socketHandler from "./socket/socketHandler.js";

dns.setServers(["1.1.1.1"]);
dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigin = process.env.CLIENT_URL || "https://meeting-app-frontend-beige.vercel.app";

const corsOptions = {
  origin: allowedOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Meeting app backend running");
});

app.use("/api/auth", authRoutes);
app.use("/api/meetings", meetingRoutes);

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

socketHandler(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;