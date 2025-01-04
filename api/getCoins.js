const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

// Vercel serverless function handler
module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ status: 'error', message: 'User ID is required' });
        }

        const query = 'SELECT coins FROM user_coins WHERE user_id = ?';

        // Using a promise to handle the query
        pool.promise().execute(query, [userId])
            .then(([results]) => {
                if (results.length > 0) {
                    res.status(200).json({ status: 'success', coins: results[0].coins });
                } else {
                    res.status(404).json({ status: 'error', message: 'User not found' });
                }
            })
            .catch((err) => {
                console.error('Database error:', err);
                res.status(500).json({ status: 'error', message: 'Database error' });
            });
    } else {
        // Handle invalid HTTP methods
        res.status(405).json({ status: 'error', message: 'Invalid request method' });
    }
};