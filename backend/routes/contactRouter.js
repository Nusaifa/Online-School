const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();

const router = express.Router();

// Validate contact form input
function validateContactForm({ name, email, subject, message }) {
    if (!name || !email || !subject || !message) {
        return "All fields are required.";
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
        return "Invalid email address.";
    }
    return null;
}

// Handle contact form submission
router.post("/", async (req, res) => {
    const { name, email, subject, message } = req.body;

    // Validate input
    const validationError = validateContactForm(req.body);
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL, // Sender email (your authenticated email)
                pass: process.env.EMAIL_PASSWORD, // App password or regular password
            },
        });

        await transporter.sendMail({
            from: `"SAHA LEARNING HUB" <${process.env.EMAIL}>`, // Always use your company's email
            to: process.env.EMAIL, // Recipient email (your inbox)
            replyTo: email, // User's email address (so replies go to them)
            subject: `Contact Form: ${subject}`,
            text: `Message from ${name} (${email}):\n\n${message}`, // Include user's name and message
        });

        res.status(200).json({ message: "Email sent successfully!" });
    } catch (error) {
        console.error("Email sending error:", error);
        res.status(500).json({ message: "Failed to send the email. Please try again later." });
    }
});

module.exports = router;
