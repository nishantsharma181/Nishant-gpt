import express from "express";
import jwt from "jsonwebtoken";
import Thread from "../models/Thread.js";
import getOpenAIAPIResponse from "../utils/openai.js";

const router = express.Router();

// Middleware to verify JWT Token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access Denied: Please log in first" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or Expired Token" });
  }
};

// GET /api/thread
router.get("/thread", verifyToken, async (req, res) => {
  try {
    const threads = await Thread.find({ userId: req.user.id })
      .sort({ updatedAt: -1 })
      .select("threadId title updatedAt");
    return res.json(threads);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch threads" });
  }
});

// GET /api/thread/:threadId
router.get("/thread/:threadId", verifyToken, async (req, res) => {
  try {
    const thread = await Thread.findOne({
      threadId: req.params.threadId,
      userId: req.user.id,
    });
    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }
    return res.json(thread.messages);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

// DELETE /api/thread/:threadId
router.delete("/thread/:threadId", verifyToken, async (req, res) => {
  try {
    const deleted = await Thread.findOneAndDelete({
      threadId: req.params.threadId,
      userId: req.user.id,
    });
    if (!deleted) {
      return res.status(404).json({ error: "Thread not found" });
    }
    return res.json({ success: "Thread deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete thread" });
  }
});

// POST /api/chat
router.post("/chat", verifyToken, async (req, res) => {
  const { threadId, message } = req.body;

  if (!threadId || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    let thread = await Thread.findOne({
      threadId,
      userId: req.user.id,
    });

    if (!thread) {
      const autoTitle = message.length > 30 ? `${message.substring(0, 30)}...` : message;
      thread = new Thread({
        threadId,
        userId: req.user.id,
        title: autoTitle,
        messages: [{ role: "user", content: message }],
      });
    } else {
      thread.messages.push({ role: "user", content: message });
    }

    const assistantReply = await getOpenAIAPIResponse(message);

    thread.messages.push({ role: "assistant", content: assistantReply });
    thread.updatedAt = new Date();
    await thread.save();

    return res.json({ reply: assistantReply });
  } catch (err) {
    console.error("Chat Error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
