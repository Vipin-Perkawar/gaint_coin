const mysql = require('mysql2');
const crypto = require('crypto');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
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
                console.error('Database error', err);
                return res.status(500).json({ success: false, message: 'Database error.' });
            }

            // If the email does not exist
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
        // If the method is not POST
        res.status(405).json({ message: 'Method Not Allowed' });
    }
};