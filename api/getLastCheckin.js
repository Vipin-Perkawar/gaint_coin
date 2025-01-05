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
        const { userId } = req.body; // Expecting userId to be passed in JSON format

        if (!userId) {
            return res.status(400).json({ status: "error", message: "User ID is required" });
        }

        pool.query('SELECT lastCheckin FROM users WHERE id = ?', [userId], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ status: "error", message: "Database error." });
            }

            if (result.length > 0) {
                const now = formatDate(result[0].lastCheckin);
                res.json({ status: "success", message: "User found.", lastCheckin: now });
            } else {
                res.json({ status: "error", message: "User not found.", userId });
            }
        });
    } else {
        res.status(405).json({ status: "error", message: "Method Not Allowed" });
    }
};