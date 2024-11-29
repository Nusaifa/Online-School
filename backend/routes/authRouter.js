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
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Use original file name and add timestamp to avoid file name conflicts
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
});

const upload = multer({ storage: storage }); // Initialize multer with storage settings

// Register a new user (with file upload handling)
router.post("/register", upload.single("profilePicture"), async (req, res) => {
    const { fullName, initials, gender, guardianName, email, mobileNumber, address, district, section, grade, password } = req.body;

    // Check if all required fields are present
    if (!fullName || !email || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Handle profile picture upload
        let profilePicture = null;
        if (req.file) {
            // Save the path of the uploaded file in the database
            profilePicture = req.file.path; // e.g., 'uploads/123456.jpg'
        }

        // Insert user data into the database
        const query = "INSERT INTO users (fullName, initials, gender, guardianName, email, mobileNumber, address, district, section, grade, password, profilePicture) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        db.query(query, [fullName, initials, gender, guardianName, email, mobileNumber, address, district, section, grade, hashedPassword, profilePicture], (err, result) => {
            if (err) {
                console.error("Error inserting user:", err);
                return res.status(500).json({ message: "Error registering user. Email may already be in use." });
            }
            res.status(200).json({ message: "Registration successful! Please log in." });
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Error registering user." });
    }
});

// Login a user
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Query to find user by email
        const query = "SELECT * FROM users WHERE email = ?";
        db.query(query, [email], async (err, result) => {
            if (err) {
                console.error("Error finding user:", err);
                return res.status(500).json({ message: "Error logging in." });
            }
            if (result.length === 0) {
                return res.status(400).json({ message: "Invalid email or password." });
            }

            const user = result[0]; // Assuming single result returned

            // Compare passwords
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(400).json({ message: "Invalid email or password." });
            }

            // Login successful
            res.status(200).json({ message: `Login successful! Welcome ${user.fullName}.` });
        });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ message: "Error logging in user." });
    }
});

module.exports = router;

