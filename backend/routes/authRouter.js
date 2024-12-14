const express = require("express");
const bcrypt = require("bcrypt");
const mysql = require("mysql");
const multer = require("multer");
const path = require("path");
const db = require("../db");

const router = express.Router();

// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save files to the 'uploads' folder
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Use original file name and add timestamp to avoid file name conflicts
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage: storage }); // Initialize multer with storage settings

// Middleware to check if the user is logged in
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next(); // User is authenticated, continue to the next route
  }
  res.status(401).json({ message: "Unauthorized. Please log in." }); // User is not authenticated
}

// Register a new user (with file upload handling)
router.post("/register", upload.single("profilePicture"), async (req, res) => {
  const {
    fullName,
    initials,
    gender,
    guardianName,
    email,
    mobileNumber,
    address,
    district,
    section,
    grade,
    password,
  } = req.body;

  if (!fullName || !email || !password) {
    return res
      .status(400)
      .json({ message: "Full name, email, and password are required." });
  }

  // Check if the email already exists in the database
  const emailCheckQuery = "SELECT * FROM users WHERE email = ?";
  db.query(emailCheckQuery, [email], async (err, result) => {
    if (err) {
      console.error("Error checking email:", err);
      return res.status(500).json({ message: "Error checking email." });
    }
    if (result.length > 0) {
      return res.status(400).json({ message: "Email already registered." });
    }

    // Proceed with password hashing and saving the user
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      let profilePicture = null;
      if (req.file) {
        profilePicture = req.file.path;
      }

      const query =
        "INSERT INTO users (fullName, initials, gender, guardianName, email, mobileNumber, address, district, section, grade, password, profilePicture) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      db.query(
        query,
        [
          fullName,
          initials,
          gender,
          guardianName,
          email,
          mobileNumber,
          address,
          district,
          section,
          grade,
          hashedPassword,
          profilePicture,
        ],
        (err, result) => {
          if (err) {
            console.error("Error inserting user:", err);
            return res.status(500).json({ message: "Error registering user." });
          }
          res
            .status(200)
            .json({ message: "Registration successful! Please log in." });
        }
      );
    } catch (error) {
      console.error("Error hashing password:", error);
      res.status(500).json({ message: "Error registering user." });
    }
  });
});

// Login a user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], async (err, result) => {
      if (err) {
        console.error("Error finding user:", err);
        return res.status(500).json({ message: "Error logging in." });
      }
      if (result.length === 0) {
        return res.status(400).json({ message: "Invalid email or password." });
      }

      const user = result[0];
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Invalid email or password." });
      }

      // Store userId in session
      req.session.userId = user.id;
      console.log("User logged in with ID:", req.session.userId); // Debug log

      res.status(200).json({
        message: `Login successful! Welcome ${user.fullName}.`,
        user: user.fullName,
      });
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Error logging in user." });
  }
});

// Logout a user
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Error logging out." });
    }
    res.clearCookie("connect.sid"); // Optional: Clear session cookie
    res.status(200).json({ message: "Logged out successfully." });
  });
});

// Check if user is logged in
router.get("/check-session", (req, res) => {
  if (req.session.userId) {
    res.json({ loggedIn: true, user: req.session.userId });
  } else {
    res.json({ loggedIn: false });
  }
});

router.get("/user/profile", isAuthenticated, (req, res) => {
  console.log("User ID in session:", req.session.userId); // Debug log

  const userId = req.session.userId;

  if (!userId) {
    console.log("Unauthorized: No user ID in session");
    return res.status(401).json({ message: "Unauthorized. Please log in." }); // Always return JSON
  }

  const query = "SELECT * FROM users WHERE id = ?";
  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error("Error fetching user profile:", err);
      return res.status(500).json({ message: "Error fetching user profile." });
    }

    if (result.length === 0) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found." });
    }

    const user = result[0];
    console.log("User profile fetched:", user);
    res.status(200).json({
      fullName: user.fullName,
      initials: user.initials,
      gender: user.gender,
      guardianName: user.guardianName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      address: user.address,
      district: user.district,
      section: user.section,
      grade: user.grade,
      profilePicture: user.profilePicture,
    });
  });
});

router.put("/updateProfile", upload.single("profilePicture"), (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  // Extract data from the request
  const fullName = req.body.fullName || null;
  const initials = req.body.initials || null;
  const gender = req.body.gender || null;
  const mobileNumber = req.body.mobileNumber || null;
  const address = req.body.address || null;
  const district = req.body.district || null;
  const section = req.body.section || null;
  const grade = req.body.grade || null;
  const profilePicture = req.file ? req.file.path.replace(/\\/g, "/") : null;

  // Construct the update query
  const query = `
      UPDATE users
      SET
        fullName = ?,
        initials = ?,
        gender = ?,
        mobileNumber = ?,
        address = ?,
        district = ?,
        section = ?,
        grade = ?
        ${profilePicture ? ", profilePicture = ?" : ""}
      WHERE id = ?
    `;

  const queryParams = [
    fullName,
    initials,
    gender,
    mobileNumber,
    address,
    district,
    section,
    grade,
  ];

  if (profilePicture) {
    queryParams.push(profilePicture);
  }
  queryParams.push(req.session.userId);

  // Execute the query
  db.query(query, queryParams, (err, result) => {
    if (err) {
      console.error("Error updating profile:", err);
      return res.status(500).json({ message: "Error updating profile." });
    }
    res.json({ message: "Profile updated successfully." });
  });
});


// Change Password Route
router.put("/changePassword", isAuthenticated, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.session.userId;

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Both old and new passwords are required." });
  }

  // Basic password strength validation (min 8 characters)
  const passwordStrengthRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordStrengthRegex.test(newPassword)) {
    return res.status(400).json({
      message:
        "New password must be at least 8 characters long and contain both letters and numbers.",
    });
  }

  try {
    const query = "SELECT password FROM users WHERE id = ?";
    db.query(query, [userId], async (err, result) => {
      if (err) {
        console.error("Error fetching user:", err);
        return res.status(500).json({ message: "Error fetching user." });
      }

      if (result.length === 0) {
        return res.status(400).json({ message: "User not found." });
      }

      const currentPassword = result[0].password;
      const isOldPasswordValid = await bcrypt.compare(
        oldPassword,
        currentPassword
      );
      if (!isOldPasswordValid) {
        return res.status(400).json({ message: "Incorrect old password." });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      const updateQuery = "UPDATE users SET password = ? WHERE id = ?";
      db.query(updateQuery, [hashedNewPassword, userId], (err, result) => {
        if (err) {
          console.error("Error updating password:", err);
          return res.status(500).json({ message: "Error updating password." });
        }
        res.status(200).json({ message: "Password updated successfully!" });
      });
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Error changing password." });
  }
});

module.exports = router;
