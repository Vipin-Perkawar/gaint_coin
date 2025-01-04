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
    getUser($data, $conn);
} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["status" => "error", "message" => "Invalid request method. Please use POST."]);
}

function getUser($data, $conn) {
    // If no body data is provided, use the POST parameters (id or email)
    $id = isset($data['id']) ? $data['id'] : null;
    $email = isset($data['email']) ? $data['email'] : null;

    // Validate that at least one identifier (id or email) is provided
    if (!$id && !$email) {
        http_response_code(400); // Bad Request
        $response = ["status" => "error", "message" => "User ID or email is required"];
        echo json_encode($response);
        exit;
    }

    // Prepare the SQL query based on whether the user is looking for an ID or email
    if ($id) {
        $sql = "SELECT id, name, email, dob, gender, city, state, pincode as pinCode, address FROM user_details WHERE id = ?";
    } elseif ($email) {
        $sql = "SELECT id, name, email, dob, gender, city, state, pincode as pinCode, address FROM user_details WHERE email = ?";
    }

    // Prepare the statement
    if ($stmt = $conn->prepare($sql)) {
        // Bind parameters to the prepared statement (i for integer, s for string)
        if ($id) {
            $stmt->bind_param("i", $id); // Bind id as integer
        } elseif ($email) {
            $stmt->bind_param("s", $email); // Bind email as string
        }

        // Execute the query
        $stmt->execute();

        // Get the result
        $result = $stmt->get_result();

        // Check if user exists
        if ($result->num_rows > 0) {
            // Fetch data as associative array
            $user = $result->fetch_assoc();
            $response = ["status" => "success", "message" => "User found", "data" => $user];
        } else {
            http_response_code(404); // Not Found
            $response = ["status" => "error", "message" => "No user found"];
        }

        // Close the statement
        $stmt->close();
    } else {
        // Error in preparing the statement
        http_response_code(500); // Internal Server Error
        $response = ["status" => "error", "message" => "Error preparing the query: " . $conn->error];
    }

    // Send the JSON response
    echo json_encode($response);
}

// Close the connection
$conn->close();
?>