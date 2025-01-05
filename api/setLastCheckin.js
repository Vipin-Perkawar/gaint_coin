const mysql = require('mysql2');

// Set up MySQL connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});
// Function to format date to YYYY-MM-DD
const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];  // Returns in "YYYY-MM-DD" format
};
module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const { userId, dateTime } = req.body;
        const now = formatDate(dateTime);
        // Ensure dateTime is passed and valid
        if (!userId || !dateTime) {
            return res.status(400).json({ status: "error", message: "UserId and dateTime are required." });
        }
        // Check if the date is passed
        if (!dateTime) {
            return res.status(400).json({ status: "error", message: "DateTime is required." });
        }
        // Check if the UserId is passed
        if (!userId) {
            return res.status(400).json({ status: "error", message: "UserId is required." });
        }
        
        pool.query('UPDATE users SET lastCheckin = ? WHERE id = ?', [now, userId], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ status: "error", message: "Database error." });
            }

            if (result.affectedRows > 0) {
                res.json({ status: "success", message: "Check-in successful!", lastCheckin: now });
            } else {
                res.json({ status: "error", message: "User not found.", userId });
            }
        });
    } else {
        res.status(405).json({ status: "error", message: "Method Not Allowed" });
    }
};