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

  if (!id && !email) {
    return res.status(400).json({
      status: 'error',
      message: 'User ID or email is required',
    });
  }

  if ((id || email) && !name || !dob || !gender || !city || !state || !pinCode || !address) {
    return res.status(400).json({
      status: 'error',
      message: 'All fields are required for new user!',
    });
  }

  // Check if the user exists based on ID or Email
  let checkSql;
  let params;

  if (id) {
    checkSql = 'SELECT id FROM user_details WHERE id = ?';
    params = [id];
  } else if (email) {
    checkSql = 'SELECT id FROM user_details WHERE email = ?';
    params = [email];
  }

  pool.execute(checkSql, params, (error, results) => {
    if (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Database query failed: ' + error.message,
      });
    }

    if (results.length > 0) {
      // If user exists, update the user details
      let updateSql = 'UPDATE user_details SET ';
      let updateParams = [];
      let paramTypes = [];

      if (name) {
        updateSql += 'name = ?, ';
        updateParams.push(name);
        paramTypes.push('s');
      }
      if (email) {
        updateSql += 'email = ?, ';
        updateParams.push(email);
        paramTypes.push('s');
      }
      if (dob) {
        updateSql += 'dob = ?, ';
        updateParams.push(dob);
        paramTypes.push('s');
      }
      if (gender) {
        updateSql += 'gender = ?, ';
        updateParams.push(gender);
        paramTypes.push('s');
      }
      if (city) {
        updateSql += 'city = ?, ';
        updateParams.push(city);
        paramTypes.push('s');
      }
      if (state) {
        updateSql += 'state = ?, ';
        updateParams.push(state);
        paramTypes.push('s');
      }
      if (pinCode) {
        updateSql += 'pincode = ?, ';
        updateParams.push(pinCode);
        paramTypes.push('s');
      }
      if (address) {
        updateSql += 'address = ?, ';
        updateParams.push(address);
        paramTypes.push('s');
      }

      // Remove the trailing comma and space from the query
      updateSql = updateSql.slice(0, -2);
      updateSql += ' WHERE email = ?';

      updateParams.push(email);
      paramTypes.push('s');

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
      // If user does not exist, insert the new user
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