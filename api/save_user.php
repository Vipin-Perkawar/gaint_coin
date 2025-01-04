<?php
// Include database connection
include 'db.php';

// Set the Content-Type header to application/json
header('Content-Type: application/json');

// Check the database connection
if ($conn->connect_error) {
    http_response_code(500); // Internal Server Error
    die(json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]));
}

// Get the request method
$request_method = $_SERVER["REQUEST_METHOD"];

// Process the request
if ($request_method == 'POST') {
    // Decode the incoming JSON data
    $data = json_decode(file_get_contents("php://input"), true);
    saveUser($data, $conn);
} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["status" => "error", "message" => "Invalid request method. Please use POST."]);
}

function saveUser($data, $conn) {
    // Validate input data
    $id = isset($data['id']) ? $data['id'] : null;
    $email = isset($data['email']) ? $data['email'] : null;
    if (!empty($id) || !empty($email)) {
        // Get values from the request data, and sanitize if necessary
        $name = isset($data['name']) && $data['name'] !== '' ? $conn->real_escape_string($data['name']) : null;
        $email = isset($data['email']) && $data['email'] !== '' ? $conn->real_escape_string($data['email']) : null;
        $dob = isset($data['dob']) && $data['dob'] !== '' ? $conn->real_escape_string($data['dob']) : null;
        $gender = isset($data['gender']) && $data['gender'] !== '' ? $conn->real_escape_string($data['gender']) : null;
        $city = isset($data['city']) && $data['city'] !== '' ? $conn->real_escape_string($data['city']) : null;
        $state = isset($data['state']) && $data['state'] !== '' ? $conn->real_escape_string($data['state']) : null;
        $pincode = isset($data['pinCode']) && $data['pinCode'] !== '' ? $conn->real_escape_string($data['pinCode']) : null;
        $address = isset($data['address']) && $data['address'] !== '' ? $conn->real_escape_string($data['address']) : null;

        // Check if the user with this id already exists
        $check_sql = "SELECT id FROM user_details WHERE id = ?";
        if ($stmt = $conn->prepare($check_sql)) {
            $stmt->bind_param("s", $id);
            $stmt->execute();
            $stmt->store_result();

            if ($stmt->num_rows > 0) {
                // If user exists, update the user details (only non-null fields)
                $update_sql = "UPDATE user_details SET ";
                $update_params = [];
                $param_types = "";

                // Dynamically add fields to be updated if they are non-null
                if ($name !== null) {
                    $update_sql .= "name = ?, ";
                    $update_params[] = $name;
                    $param_types .= "s";
                }
                if ($email !== null) {
                    $update_sql .= "email = ?, ";
                    $update_params[] = $email;
                    $param_types .= "s";
                }
                if ($dob !== null) {
                    $update_sql .= "dob = ?, ";
                    $update_params[] = $dob;
                    $param_types .= "s";
                }
                if ($gender !== null) {
                    $update_sql .= "gender = ?, ";
                    $update_params[] = $gender;
                    $param_types .= "s";
                }
                if ($city !== null) {
                    $update_sql .= "city = ?, ";
                    $update_params[] = $city;
                    $param_types .= "s";
                }
                if ($state !== null) {
                    $update_sql .= "state = ?, ";
                    $update_params[] = $state;
                    $param_types .= "s";
                }
                if ($pincode !== null) {
                    $update_sql .= "pincode = ?, ";
                    $update_params[] = $pincode;
                    $param_types .= "s";
                }
                if ($address !== null) {
                    $update_sql .= "address = ?, ";
                    $update_params[] = $address;
                    $param_types .= "s";
                }

                // Remove the last comma and space from the query
                $update_sql = rtrim($update_sql, ", ");

                // Complete the query with the WHERE clause
                $update_sql .= " WHERE email = ?";

                // Add the email as the last parameter
                $update_params[] = $email;
                $param_types .= "s"; // Email is a string

                // Prepare the update statement
                if ($update_stmt = $conn->prepare($update_sql)) {
                    // Bind the parameters to the prepared statement
                    $update_stmt->bind_param($param_types, ...$update_params);

                    // Execute the query
                    if ($update_stmt->execute()) {
                        $response = ["status" => "success", "message" => "User details updated successfully!"];
                    } else {
                        http_response_code(500); // Internal Server Error
                        $response = ["status" => "error", "message" => "Error updating user details: " . $update_stmt->error];
                    }

                    // Close the update statement
                    $update_stmt->close();
                } else {
                    http_response_code(500); // Internal Server Error
                    $response = ["status" => "error", "message" => "Error preparing update query: " . $conn->error];
                }
            } else {
                if ($name && $email && $dob && $gender && $city && $state && $pincode && $address) {
                    // If user does not exist, insert new user
                    $insert_sql = "INSERT INTO user_details (name, email, dob, gender, city, state, pincode, address)
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                    if ($insert_stmt = $conn->prepare($insert_sql)) {
                        $insert_stmt->bind_param("ssssssss", $name, $email, $dob, $gender, $city, $state, $pincode, $address);

                        if ($insert_stmt->execute()) {
                            $response = ["status" => "success", "message" => "User details saved successfully!"];
                        } else {
                            http_response_code(500); // Internal Server Error
                            $response = ["status" => "error", "message" => "Error executing query: " . $insert_stmt->error];
                        }

                        // Close the insert statement
                        $insert_stmt->close();
                    } else {
                        http_response_code(500); // Internal Server Error
                        $response = ["status" => "error", "message" => "Error preparing insert query: " . $conn->error];
                    }
                } else {
                    http_response_code(400); // Bad Request
                    $response = ["status" => "error", "message" => "All fields are required for new user!"];
                }
            }

            // Close the check statement
            $stmt->close();
        } else {
            http_response_code(500); // Internal Server Error
            $response = ["status" => "error", "message" => "Error checking user existence: " . $conn->error];
        }
    } else {
        // If User Id or Email is not provided
        http_response_code(400); // Bad Request
        $response = ["status" => "error", "message" => "User ID or email is required"];
    }

    // Send JSON response
    echo json_encode($response);
}

// Close the connection
$conn->close();
?>