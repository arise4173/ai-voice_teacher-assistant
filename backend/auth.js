import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User from "./User.js";   // make sure path is correct!

const router = express.Router();

// POST /auth/register
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
    body("role").isIn(["student", "teacher"]).withMessage("Role must be student or teacher")
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { name, email, password, role } = req.body;

      const exists = await User.findOne({ email });
      if (exists) return res.status(409).json({ error: "Email already registered" });

      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashed, role });

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
      );

      res.status(201).json({
        message: "Registered successfully",
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        token
      });
    } catch (err) {
      console.error(err);
      if (err.code === 11000) {
        return res.status(409).json({ error: "Email already registered" });
      }
      res.status(500).json({ error: "Server error" });
    }
  }
);

// POST /auth/login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required")
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, password } = req.body;

      const user = await User.findOne({ email }).select("+password");
      if (!user) return res.status(401).json({ error: "Invalid credentials" });

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ error: "Invalid credentials" });

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
      );

      res.json({
        message: "Logged in",
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        token
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
