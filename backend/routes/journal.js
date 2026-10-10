const express = require("express");
const jwt = require("jsonwebtoken");
const Journal = require("../models/Journal");

const router = express.Router();

/* =========================
   AUTHENTICATION MIDDLEWARE
========================= */

const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "You must be logged in to access your journal.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Your session is invalid or has expired.",
    });
  }
};


/* =========================
   CREATE JOURNAL ENTRY
========================= */

router.post("/", authenticateUser, async (req, res) => {
  try {
    const { title, content, mood } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required.",
      });
    }

    const journal = new Journal({
      userId: req.userId,
      title: title.trim(),
      content,
      mood: mood || "neutral",
    });

    await journal.save();

    res.status(201).json({
      message: "Journal entry saved ✦",
      journal,
    });

  } catch (error) {
    console.error("❌ Create journal error:", error);

    res.status(500).json({
      message: "Could not save your journal entry.",
    });
  }
});


/* =========================
   GET ALL JOURNAL ENTRIES
========================= */

router.get("/", authenticateUser, async (req, res) => {
  try {
    const journals = await Journal.find({
      userId: req.userId,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      journals,
    });

  } catch (error) {
    console.error("❌ Get journal error:", error);

    res.status(500).json({
      message: "Could not load your journal.",
    });
  }
});


/* =========================
   GET ONE JOURNAL ENTRY
========================= */

router.get("/:id", authenticateUser, async (req, res) => {
  try {
    const journal = await Journal.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!journal) {
      return res.status(404).json({
        message: "Journal entry not found.",
      });
    }

    res.status(200).json({
      journal,
    });

  } catch (error) {
    console.error("❌ Get journal entry error:", error);

    res.status(500).json({
      message: "Could not load this journal entry.",
    });
  }
});


/* =========================
   UPDATE JOURNAL ENTRY
========================= */

router.put("/:id", authenticateUser, async (req, res) => {
  try {
    const { title, content, mood } = req.body;

    const journal = await Journal.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!journal) {
      return res.status(404).json({
        message: "Journal entry not found.",
      });
    }

    if (title !== undefined) {
      journal.title = title.trim();
    }

    if (content !== undefined) {
      journal.content = content;
    }

    if (mood !== undefined) {
      journal.mood = mood;
    }

    await journal.save();

    res.status(200).json({
      message: "Journal entry updated ✦",
      journal,
    });

  } catch (error) {
    console.error("❌ Update journal error:", error);

    res.status(500).json({
      message: "Could not update your journal entry.",
    });
  }
});


/* =========================
   DELETE JOURNAL ENTRY
========================= */

router.delete("/:id", authenticateUser, async (req, res) => {
  try {
    const journal = await Journal.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!journal) {
      return res.status(404).json({
        message: "Journal entry not found.",
      });
    }

    res.status(200).json({
      message: "Journal entry deleted.",
    });

  } catch (error) {
    console.error("❌ Delete journal error:", error);

    res.status(500).json({
      message: "Could not delete your journal entry.",
    });
  }
});


module.exports = router;