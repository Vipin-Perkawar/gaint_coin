const mysql = require('mysql2');

// Set up MySQL connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const { userId, dateTime } = req.body;

        // Ensure dateTime is passed and valid
        if (!userId || !dateTime) {
            return res.status(400).json({ status: "error", message: "UserId and dateTime are required." });
        }

        const now = new Date(dateTime);

        // Check if the date is valid
        if (isNaN(now.getTime())) {
            return res.status(400).json({ status: "error", message: "Invalid dateTime provided." });
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