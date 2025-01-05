const mysql = require('mysql2');
const crypto = require('crypto');

// Set up MySQL connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

function generateSalt(length = 26) {
    return crypto.randomBytes(length).toString('hex');
}

function generateHash(password, salt) {
    return crypto.createHash('md5').update(password + salt).digest('hex');
}

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const { email, password } = req.body;

        // Check if both email and password are missing
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

        // Check if the email already exists in the database
        pool.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ status: "error", message: 'Database error.' });
            }

            if (results.length > 0) {
                // If email already exists
                return res.status(409).json({ status: "error", message: 'Email already exists' });
            } else {
                // Generate salt and hash the password
                const salt = generateSalt();
                const hashedPassword = generateHash(password, salt);

                pool.query('INSERT INTO users (email, password, salt) VALUES (?, ?, ?)', [email, hashedPassword, salt], (err, result) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ status: "error", message: 'Database error.' });
                    }

                    return res.json({ status: "success", message: 'Registration successful' });
                });
            }
        });
    } else {
        res.status(405).json({ status: "error", message: 'Method Not Allowed' });
    }
};