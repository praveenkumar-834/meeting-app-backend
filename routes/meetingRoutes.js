import express from "express";
import {
  createMeeting,
  joinMeeting,
  getMeetingById,
  getMeetingHistory
} from "../controllers/meetingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, createMeeting);
router.post("/join", protect, joinMeeting);
router.get("/history", protect, getMeetingHistory);
router.get("/:id", protect, getMeetingById);

export default router;
