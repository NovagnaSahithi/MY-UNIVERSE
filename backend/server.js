const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const journalRoutes = require("./routes/journal");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/journal", journalRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "My Little Universe backend is alive 🌌",
  });
});

const PORT = 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("🌌 MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`🚀 My Little Universe server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:");
    console.error(error.message);
  });