const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const db = require("./db"); // Use the existing database connection from db.js

const authRouter = require("./routes/authRouter");
const contactRouter = require("./routes/contactRouter");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configure session middleware
app.use(
  session({
    secret: "your-secret-key", // Replace with a secure secret
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Use true if HTTPS is enabled
  })
);

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../frontend/public")));

// API Routes
app.use("/api", authRouter); // API routes for authentication and profile management
app.use("/api/contact", contactRouter); // API route for contact

// API route for fetching user profile
app.get("/api/profile", (req, res) => {
  console.log("Session data:", req.session); // Debug log

  if (!req.session.userId) {
    console.log("Unauthorized: No user ID in session"); // Debug log
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  const userId = req.session.userId;
  console.log("User ID in session:", userId); // Debug log

  const query = "SELECT * FROM users WHERE id = ?";
  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error("Error fetching user profile:", err); // Debug log
      return res.status(500).json({ message: "Error fetching user profile." });
    }

    if (result.length === 0) {
      console.log("User not found"); // Debug log
      return res.status(404).json({ message: "User not found." });
    }

    console.log("User profile fetched:", result[0]); // Debug log
    res.status(200).json(result[0]); // Send JSON response
  });
});

app.put("/updateProfile", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }
  const {
    fullName,
    initials,
    gender,
    mobileNumber,
    address,
    district,
    section,
    grade,
  } = req.body;
  const query = `
        UPDATE users
        SET fullName = ?, initials = ?, gender = ?, mobileNumber = ?, address = ?, district = ?, section = ?, grade = ?
        WHERE id = ?
    `;
  db.query(
    query,
    [
      fullName,
      initials,
      gender,
      mobileNumber,
      address,
      district,
      section,
      grade,
      req.session.userId,
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error updating profile." });
      }
      res.json({ message: "Profile updated successfully." });
    }
  );
});

app.put("/changePassword", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }
  const { currentPassword, newPassword } = req.body;
  const query = "SELECT password FROM users WHERE id = ?";
  db.query(query, [req.session.userId], (err, result) => {
    if (err || result.length === 0) {
      return res.status(500).json({ message: "Error fetching user data." });
    }
    const storedPassword = result[0].password;
    bcrypt.compare(currentPassword, storedPassword, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(400).json({ message: "Incorrect current password." });
      }
      bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
        if (err) {
          return res.status(500).json({ message: "Error hashing password." });
        }
        const updateQuery = "UPDATE users SET password = ? WHERE id = ?";
        db.query(updateQuery, [hashedPassword, req.session.userId], (err) => {
          if (err) {
            return res
              .status(500)
              .json({ message: "Error updating password." });
          }
          res.json({ message: "Password changed successfully." });
        });
      });
    });
  });
});

// Catch-all route for serving the frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/public/index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
