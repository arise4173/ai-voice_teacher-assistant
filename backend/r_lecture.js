import express from "express";
import Lecture from "./lecture.js";

const router = express.Router();

// GET /lectures → fetch all lectures
router.get("/", async (req, res) => {
  try {
    const lectures = await Lecture.find().populate("uploadedBy", "name email role");
    res.json(lectures);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /lectures → teacher uploads lecture
router.post("/", async (req, res) => {
  try {
    const { title, description, fileUrl, uploadedBy } = req.body;

    const lecture = await Lecture.create({ title, description, fileUrl, uploadedBy });
    res.status(201).json({ message: "Lecture uploaded", lecture });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
