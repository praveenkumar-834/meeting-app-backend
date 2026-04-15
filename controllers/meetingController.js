import { v4 as uuidv4 } from "uuid";
import Meeting from "../models/Meeting.js";

export const createMeeting = async (req, res) => {
  try {
    const { title, scheduledTime } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const meeting = await Meeting.create({
      title,
      meetingId: uuidv4().slice(0, 8),
      host: req.user._id,
      participants: [req.user._id],
      scheduledTime: scheduledTime || null,
      status: scheduledTime ? "scheduled" : "active"
    });

    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const joinMeeting = async (req, res) => {
  try {
    const { meetingId } = req.body;

    if (!meetingId) {
      return res.status(400).json({ message: "Meeting ID is required" });
    }

    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    const alreadyJoined = meeting.participants.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (!alreadyJoined) {
      meeting.participants.push(req.user._id);
      await meeting.save();
    }

    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMeetingById = async (req, res) => {
  try {
    const meeting = await Meeting.findOne({ meetingId: req.params.id })
      .populate("host", "name email")
      .populate("participants", "name email");

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMeetingHistory = async (req, res) => {
  try {
    const meetings = await Meeting.find({ participants: req.user._id })
      .populate("host", "name email")
      .sort({ createdAt: -1 });

    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
