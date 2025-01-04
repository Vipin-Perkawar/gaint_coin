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
    if (req.method === 'GET') {
        pool.query('SELECT * FROM users', (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, message: 'Database error.' });
            }

            res.json({ success: true, users: results });
        });
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
};