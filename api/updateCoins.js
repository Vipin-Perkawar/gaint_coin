const mysql = require('mysql2');

// Set up MySQL connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Vercel serverless function handler
module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { userId, coins } = req.body;

    // Check if userId and coins are provided
    if (!userId || coins === undefined) {
      return res.status(400).json({ status: 'error', message: 'User ID and coins are required' });
    }

    // Ensure coins is a valid number
    if (isNaN(coins)) {
      return res.status(400).json({ status: 'error', message: 'Coins must be a valid number' });
    }

    try {
      // Check if user exists
      const [rows] = await pool.promise().execute('SELECT id FROM user_coins WHERE user_id = ?', [userId]);

      if (rows.length > 0) {
        // Update coins if user exists
        await pool.promise().execute('UPDATE user_coins SET coins = ? WHERE user_id = ?', [coins, userId]);

        res.status(200).json({ status: 'success', message: 'Coins updated' });
      } else {
        // If user doesn't exist, create a new record
        await pool.promise().execute('INSERT INTO user_coins (user_id, coins) VALUES (?, ?)', [userId, coins]);

        res.status(201).json({ status: 'success', message: 'Coins created' });
      }
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ status: 'error', message: 'Database error' });
    }
  } else {
    // Handle invalid HTTP methods
    res.status(405).json({ status: 'error', message: 'Invalid request method' });
  }
};