const mysql = require('mysql2');
const crypto = require('crypto');

const db = mysql.createConnection({
    host: process.env.DB_HOST, // Fixed the syntax error here
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

function generateHash(password, salt) {
    return crypto.createHash('md5').update(password + salt).digest('hex');
}

module.exports = async (req, res) = {
    if (req.method === 'POST') {
        const { email, password } = req.body;

        if (!email  !password) {
            return res.status(400).json({ success false, message 'Missing required fields' });
        }

         Check if email exists
        db.query('SELECT id, password, salt FROM users WHERE email = ', [email], (err, results) = {
            if (err) {
                console.error('Database error', err);
                return res.status(500).json({ success false, message 'Database error.' });
            }

            if (results.length  0) {
                const { id, password storedPassword, salt } = results[0];
                const hashedPassword = generateHash(password, salt);

                if (hashedPassword === storedPassword) {
                    return res.json({ success true, message 'Login successful', id });
                } else {
                    return res.status(401).json({ success false, message 'Invalid password' });
                }
            } else {
                return res.status(404).json({ success false, message 'No user found with this email address' });
            }
        });
    } else {
        res.status(405).json({ message 'Method Not Allowed' });
    }
};
