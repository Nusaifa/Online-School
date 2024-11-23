// const express = require("express");
// const bcrypt = require("bcrypt");
// const User = require("../models/User");

// const router = express.Router();

// // Register a new user
// router.post("/register", async (req, res) => {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//         return res.status(400).send("All fields are required.");
//     }

//     try {
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const user = new User({ name, email, password: hashedPassword });
//         await user.save();
//         res.send(`
//             <script>
//                 alert('Registration successful! Please login.');
//                 window.location.href = '/login.html';
//             </script>
//           `);
//     } catch (error) {
//         console.error("Error registering user:", error);
//         res.status(500).send("Error registering user. Email may already be in use.");
//     }
// });

// // Login a user
// router.post("/login", async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         // Find user by email
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.send(`
//                 <script>
//                     alert('Invalid email or password. Please try again.');
//                     window.location.href = '/login.html';
//                 </script>
//             `);
//         }

//         // Compare passwords
//         const isValidPassword = await bcrypt.compare(password, user.password);
//         if (!isValidPassword) {
//             return res.send(`
//                 <script>
//                     alert('Invalid email or password. Please try again.');
//                     window.location.href = '/login.html';
//                 </script>
//             `);
//         }

//         // Login successful
//         res.send(`
//             <script>
//                 alert('Login successful! Welcome, ${user.name}.');
//                 window.location.href = '/';
//             </script>
//         `);
//     } catch (error) {
//         console.error("Error logging in user:", error);
//         res.status(500).send(`
//             <script>
//                 alert('An error occurred. Please try again later.');
//                 window.location.href = '/login.html';
//             </script>
//         `);
//     }
// });

// module.exports = router;


// const express = require("express");
// const bcrypt = require("bcrypt");
// const mysql = require("mysql");
// const db = require("../db");

// const router = express.Router();

// // Register a new user
// router.post("/register", async (req, res) => {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//         return res.status(400).send("All fields are required.");
//     }

//     try {
//         const hashedPassword = await bcrypt.hash(password, 10);

//         const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
//         db.query(query, [name, email, hashedPassword], (err, result) => {
//             if (err) {
//                 console.error("Error registering user:", err);
//                 return res.status(500).send("Error registering user. Email may already be in use.");
//             }

//             res.send(`
//                 <script>
//                     alert('Registration successful! Please login.');
//                     window.location.href = '/login.html';
//                 </script>
//             `);
//         });
//     } catch (error) {
//         console.error("Error registering user:", error);
//         res.status(500).send("An error occurred. Please try again later.");
//     }
// });

// // Login a user
// router.post("/login", (req, res) => {
//     const { email, password } = req.body;

//     if (!email || !password) {
//         return res.status(400).send("All fields are required.");
//     }

//     const query = "SELECT * FROM users WHERE email = ?";
//     db.query(query, [email], async (err, results) => {
//         if (err) {
//             console.error("Error finding user:", err);
//             return res.status(500).send("An error occurred. Please try again later.");
//         }

//         if (results.length === 0) {
//             return res.send(`
//                 <script>
//                     alert('Invalid email or password. Please try again.');
//                     window.location.href = '/login.html';
//                 </script>
//             `);
//         }

//         const user = results[0];
//         const isValidPassword = await bcrypt.compare(password, user.password);
//         if (!isValidPassword) {
//             return res.send(`
//                 <script>
//                     alert('Invalid email or password. Please try again.');
//                     window.location.href = '/login.html';
//                 </script>
//             `);
//         }

//         res.send(`
//             <script>
//                 alert('Login successful! Welcome, ${user.name}.');
//                 window.location.href = '/';
//             </script>
//         `);
//     });
// });

// module.exports = router;
















// const express = require("express");
// const bcrypt = require("bcrypt");
// const mysql = require("mysql");
// const db = require("../db");

// const router = express.Router();

// // Register a new user
// router.post("/register", async (req, res) => {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//         return res.status(400).send("All fields are required.");
//     }

//     try {
//         const hashedPassword = await bcrypt.hash(password, 10);
        
//         // Query to insert new user into MySQL database
//         const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
//         db.query(query, [name, email, hashedPassword], (err, result) => {
//             if (err) {
//                 console.error("Error inserting user:", err);
//                 return res.status(500).send("Error registering user. Email may already be in use.");
//             }
//             res.send(`
//                 <script>
//                     alert('Registration successful! Please login.');
//                     window.location.href = '/login.html';
//                 </script>
//             `);
//         });
//     } catch (error) {
//         console.error("Error registering user:", error);
//         res.status(500).send("Error registering user.");
//     }
// });

// // Login a user
// router.post("/login", async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         // Query to find user by email
//         const query = "SELECT * FROM users WHERE email = ?";
//         db.query(query, [email], async (err, result) => {
//             if (err) {
//                 console.error("Error finding user:", err);
//                 return res.status(500).send("Error logging in.");
//             }
//             if (result.length === 0) {
//                 return res.send(`
//                     <script>
//                         alert('Invalid email or password.');
//                         window.location.href = '/login.html';
//                     </script>
//                 `);
//             }

//             const user = result[0]; // Assuming single result returned

//             // Compare passwords
//             const isValidPassword = await bcrypt.compare(password, user.password);
//             if (!isValidPassword) {
//                 return res.send(`
//                     <script>
//                         alert('Invalid email or password.');
//                         window.location.href = '/login.html';
//                     </script>
//                 `);
//             }

//             // Login successful
//             res.send(`
//                 <script>
//                     alert('Login successful! Welcome, ${user.name}.');
//                     window.location.href = '/';
//                 </script>
//             `);
//         });
//     } catch (error) {
//         console.error("Error logging in user:", error);
//         res.status(500).send("Error logging in user.");
//     }
// });

// module.exports = router;


const express = require("express");
const bcrypt = require("bcrypt");
const mysql = require("mysql");
const db = require("../db");

const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).send("All fields are required.");
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Query to insert new user into MySQL database
        const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        db.query(query, [name, email, hashedPassword], (err, result) => {
            if (err) {
                console.error("Error inserting user:", err);
                return res.status(500).send("Error registering user. Email may already be in use.");
            }
            res.send(`
                <script>
                    alert('Registration successful! Please login.');
                    window.location.href = '/login.html';
                </script>
            `);
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).send("Error registering user.");
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
                return res.status(500).send("Error logging in.");
            }
            if (result.length === 0) {
                return res.send(`
                    <script>
                        alert('Invalid email or password.');
                        window.location.href = '/login.html';
                    </script>
                `);
            }

            const user = result[0]; // Assuming single result returned

            // Compare passwords
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.send(`
                    <script>
                        alert('Invalid email or password.');
                        window.location.href = '/login.html';
                    </script>
                `);
            }

            // Login successful
            res.send(`
                <script>
                    alert('Login successful! Welcome, ${user.name}.');
                    window.location.href = '/';
                </script>
            `);
        });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).send("Error logging in user.");
    }
});

module.exports = router;
