const mysql = require("mysql2");

// Create a connection pool
const db = mysql.createPool({
    host: "localhost",       // MySQL host (change if necessary)
    user: "root",            // MySQL username (default is 'root')
    password: "1234",        // MySQL password 
    database: "saha_learning_hub" // New database name
});

// Test connection
db.getConnection((err, connection) => {
    if (err) {
        console.error("Error connecting to the database:", err.stack);
        return;
    }
    console.log("Connected to the database as id " + connection.threadId);
    connection.release(); // Release the connection after test
});

module.exports = db;
