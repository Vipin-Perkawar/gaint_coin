const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST, // Fixed the syntax error here
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const { userId, dateTime } = req.body;
        const now = new Date(dateTime);

        db.query('UPDATE users SET lastCheckin = ? WHERE id = ?', [now, userId], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, message: 'Database error.' });
            }

            if (result.affectedRows > 0) {
                res.json({ success: true, message: "Check-in successful!", lastCheckin: now });
            } else {
                res.json({ success: false, message: "User not found.", userId });
            }
        });
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
};