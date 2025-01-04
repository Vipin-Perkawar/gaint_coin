// api/getUser.js
const mysql = require('mysql2');

// Create a connection pool to the database
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
// The main function to handle the request
module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({
            status: 'error',
            message: 'Invalid request method. Please use POST.',
        });
    }

    // Get the incoming JSON data
    const { userId, email } = req.body;

    // Validate that at least one identifier (userId or email) is provided
    if (!userId && !email) {
        return res.status(400).json({
            status: 'error',
            message: 'User ID or email is required',
        });
    }

    // Prepare the SQL query based on whether the user is looking for a userId or email
    let sql;
    if (userId) {
        sql = 'SELECT id, name, email, dob, gender, city, state, pincode AS pinCode, address FROM user_details WHERE id = ?';
    } else if (email) {
        sql = 'SELECT id, name, email, dob, gender, city, state, pincode AS pinCode, address FROM user_details WHERE email = ?';
    }

    try {
        // Execute the query with the provided parameter
        pool.execute(sql, [userId || email], (error, results) => {
            if (error) {
                return res.status(500).json({
                    status: 'error',
                    message: 'Database query failed: ' + error.message,
                });
            }

            if (results.length > 0) {
                // Format the dob field to "YYYY-MM-DD" format
                const user = results[0];
                user.dob = formatDate(user.dob);
                // User found, send the response
                return res.status(200).json({
                    status: 'success',
                    message: 'User found',
                    data: user,
                });
            } else {
                // No user found
                return res.status(404).json({
                    status: 'error',
                    message: 'No user found',
                });
            }
        });
    } catch (err) {
        // Catch any errors
        return res.status(500).json({
            status: 'error',
            message: 'Internal Server Error: ' + err.message,
        });
    }
};
