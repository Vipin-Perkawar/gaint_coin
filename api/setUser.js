const mysql = require('mysql2');

// Set up MySQL connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

// The main function to handle the request
module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      status: 'error',
      message: 'Invalid request method. Please use POST.',
    });
  }

  const data = req.body;

  // Validate input data
  const { id, email, name, dob, gender, city, state, pinCode, address } = data;

  // Ensure either id or email is provided
  if (!id && !email) {
    return res.status(400).json({
      status: 'error',
      message: 'User ID or email is required',
    });
  }

  // Ensure all necessary fields are provided for new user
  if ((id || email) && !name || !dob || !gender || !city || !state || !pinCode || !address) {
    return res.status(400).json({
      status: 'error',
      message: 'All fields are required for new user!',
    });
  }

  // Determine the query based on the presence of id or email
  const checkSql = id 
    ? 'SELECT id FROM user_details WHERE id = ?' 
    : 'SELECT id FROM user_details WHERE email = ?';
  const params = id ? [id] : [email];

  pool.execute(checkSql, params, (error, results) => {
    if (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Database query failed: ' + error.message,
      });
    }

    if (results.length > 0) {
      // User exists, update the user details
      let updateSql = 'UPDATE user_details SET ';
      let updateParams = [];
      
      // Append the fields that need to be updated dynamically
      if (name) updateSql += 'name = ?, ', updateParams.push(name);
      if (email) updateSql += 'email = ?, ', updateParams.push(email);
      if (dob) updateSql += 'dob = ?, ', updateParams.push(dob);
      if (gender) updateSql += 'gender = ?, ', updateParams.push(gender);
      if (city) updateSql += 'city = ?, ', updateParams.push(city);
      if (state) updateSql += 'state = ?, ', updateParams.push(state);
      if (pinCode) updateSql += 'pincode = ?, ', updateParams.push(pinCode);
      if (address) updateSql += 'address = ?, ', updateParams.push(address);

      // Remove the trailing comma and space from the query
      updateSql = updateSql.slice(0, -2);
      updateSql += ' WHERE id = ?';
      updateParams.push(id);

      // Execute the update query
      pool.execute(updateSql, updateParams, (updateError, updateResults) => {
        if (updateError) {
          return res.status(500).json({
            status: 'error',
            message: 'Error updating user details: ' + updateError.message,
          });
        }

        return res.status(200).json({
          status: 'success',
          message: 'User details updated successfully!',
        });
      });
    } else {
      // User does not exist, insert the new user
      const insertSql = 'INSERT INTO user_details (name, email, dob, gender, city, state, pincode, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
      
      pool.execute(insertSql, [name, email, dob, gender, city, state, pinCode, address], (insertError, insertResults) => {
        if (insertError) {
          return res.status(500).json({
            status: 'error',
            message: 'Error inserting user details: ' + insertError.message,
          });
        }

        return res.status(200).json({
          status: 'success',
          message: 'User details saved successfully!',
        });
      });
    }
  });
};