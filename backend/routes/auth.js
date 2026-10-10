const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Resend } = require("resend");

const User = require("../models/User");

const router = express.Router();

const resend = new Resend(process.env.RESEND_API_KEY);

/* =========================
   REGISTER
========================= */

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Please fill in all fields.",
      });
    }

    /* Gmail-only validation */

    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!gmailRegex.test(email)) {
      return res.status(400).json({
        message: "Please use a valid Gmail address.",
      });
    }

    /* Password length */

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long.",
      });
    }

    /* Check username */

    const existingUsername = await User.findOne({ username });

    if (existingUsername) {
      return res.status(400).json({
        message: "That username is already taken.",
      });
    }

    /* Check email */

    const existingEmail = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingEmail) {
      return res.status(400).json({
        message: "An account with this Gmail already exists.",
      });
    }

    /* Generate 6-digit verification code */

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    /* Code expires in 10 minutes */

    const verificationCodeExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    /* Create user */

    const user = new User({
      username,
      email: email.toLowerCase(),
      password,
      emailVerified: false,
      verificationCode,
      verificationCodeExpires,
    });

    await user.save();

    /* Send verification email */

    const { error } = await resend.emails.send({
      from: "My Little Universe <onboarding@resend.dev>",
      to: [email.toLowerCase()],
      subject: "Your My Little Universe verification code 🌌",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 30px;">
          <h1>Welcome to My Little Universe 🌌</h1>

          <p>Hi ${username},</p>

          <p>Your verification code is:</p>

          <h2 style="font-size: 32px; letter-spacing: 8px;">
            ${verificationCode}
          </h2>

          <p>This code will expire in 10 minutes.</p>

          <p>
            If you didn't create this account, you can ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Email sending failed:", error);

      return res.status(500).json({
        message: "Could not send verification email.",
      });
    }

    res.status(201).json({
      message: "Verification code sent to your Gmail 🌌",
      username: user.username,
    });

  } catch (error) {
    console.error("❌ Registration error:", error);

    res.status(500).json({
      message: "Something went wrong while creating your universe.",
    });
  }
});


/* =========================
   VERIFY EMAIL
========================= */

router.post("/verify-email", async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        message: "Email and verification code are required.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        message: "Account not found.",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        message: "This email is already verified.",
      });
    }

    if (!user.verificationCode) {
      return res.status(400).json({
        message: "No verification code found.",
      });
    }

    if (
      !user.verificationCodeExpires ||
      new Date() > user.verificationCodeExpires
    ) {
      return res.status(400).json({
        message: "Your verification code has expired.",
      });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({
        message: "Incorrect verification code.",
      });
    }

    user.emailVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;

    await user.save();

    res.status(200).json({
      message: "Email verified successfully 🌌",
      username: user.username,
    });

  } catch (error) {
    console.error("❌ Email verification error:", error);

    res.status(500).json({
      message: "Something went wrong while verifying your email.",
    });
  }
});


/* =========================
   LOGIN
========================= */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter your Gmail and password.",
      });
    }

    /* Gmail-only validation */

    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!gmailRegex.test(email)) {
      return res.status(400).json({
        message: "Please use a valid Gmail address.",
      });
    }

    /* Find account */

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        message: "No universe exists with this Gmail.",
      });
    }

    /* Check email verification */

    if (!user.emailVerified) {
      return res.status(403).json({
        message: "Please verify your Gmail before entering your universe.",
      });
    }

    /* Check password */

    const passwordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordCorrect) {
      return res.status(401).json({
        message: "Incorrect password.",
      });
    }

    /* Create JWT token */

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    /* Successful login */

    res.status(200).json({
      message: "Welcome back to your universe 🌌",
      token,
      username: user.username,
      email: user.email,
    });

  } catch (error) {
    console.error("❌ Login error:", error);

    res.status(500).json({
      message: "Something went wrong while entering your universe.",
    });
  }
});


/* =========================
   GET CURRENT USER
========================= */

router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authenticated.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.userId).select(
      "-password -verificationCode -verificationCodeExpires"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    res.status(200).json({
      username: user.username,
      email: user.email,
      emailVerified: user.emailVerified,
    });

  } catch (error) {
    console.error("❌ Authentication error:", error);

    return res.status(401).json({
      message: "Invalid or expired session.",
    });
  }
});


module.exports = router;