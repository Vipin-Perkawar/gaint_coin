const mysql = require('mysql2');
const crypto = require('crypto');

// Create a MySQL connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

function generateHash(password, salt) {
    return crypto.createHash('md5').update(password + salt).digest('hex');
}

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const { email, password } = req.body;

        // Check if email and password are both missing
        if (!email && !password) {
            return res.status(400).json({ status: "error", message: 'Both email and password are required.' });
        }

        // Check if email is missing
        if (!email) {
            return res.status(400).json({ status: "error", message: 'Email is required.' });
        }

        // Check if password is missing
        if (!password) {
            return res.status(400).json({ status: "error", message: 'Password is required.' });
        }

        // Check if the email exists in the database
        pool.query('SELECT id, password, salt FROM users WHERE email = ?', [email], (err, results) => {
            if (err) {
                console.error('Error during the database query:', err); // Improved error logging
                return res.status(500).json({ status: "error", message: 'Database error.' });
            }

            if (results.length > 0) {
                const { id, password: storedPassword, salt } = results[0];
                const hashedPassword = generateHash(password, salt);

                // If the passwords match
                if (hashedPassword === storedPassword) {
                    return res.json({ status: "success", message: 'Login successful', id });
                } else {
                    return res.status(401).json({ status: "error", message: 'Invalid password' });
                }
            } else {
                return res.status(404).json({ status: "error", message: 'No user found with this email address' });
            }
        });
    } else {
        res.status(405).json({ status: "error", message: 'Method Not Allowed' });
    }
};