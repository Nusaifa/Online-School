const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

// Import routers
const authRouter = require("./routes/authRouter");
const contactRouter = require("./routes/contactRouter"); 

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../frontend/public")));

// Routes
app.use("/api", authRouter);
app.use("/api/contact", contactRouter); 

// Catch-all route for frontend
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/public/index.html"));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});










