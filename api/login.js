const mysql = require('mysql2');
const crypto = require('crypto');

// Create a MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST, // Ensure this is correct
    user: process.env.DB_USER, // Ensure this is correct
    password: process.env.DB_PASSWORD, // Ensure this is correct
    database: process.env.DB_NAME  // Ensure this is correct
});

// Check if the connection is successful
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to the database');
});

function generateHash(password, salt) {
    return crypto.createHash('md5').update(password + salt).digest('hex');
}

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const { email, password } = req.body;

        // Check if email or password is missing
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Check if the email exists in the database
        db.query('SELECT id, password, salt FROM users WHERE email = ?', [email], (err, results) => {
            if (err) {
                console.error('Error during the database query:', err); // Improved error logging
                return res.status(500).json({ success: false, message: 'Database error.' });
            }

            if (results.length > 0) {
                const { id, password: storedPassword, salt } = results[0];
                const hashedPassword = generateHash(password, salt);

                // If the passwords match
                if (hashedPassword === storedPassword) {
                    return res.json({ success: true, message: 'Login successful', id });
                } else {
                    return res.status(401).json({ success: false, message: 'Invalid password' });
                }
            } else {
                return res.status(404).json({ success: false, message: 'No user found with this email address' });
            }
        });
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
};