<?php
// Include database connection
include 'db.php';

header("Content-Type: application/json");

if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]));
}

$request_method = $_SERVER["REQUEST_METHOD"];

if ($request_method == 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
    register($input, $conn);
} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
}

function generate_salt($length = 26) {
    // Generate a cryptographically secure random salt
    return bin2hex(random_bytes($length));  // Convert to hexadecimal for readability
}

function generate_hash($password, $salt) {
    // Combine password and salt
    $salted_password = $password . $salt;
    // Generate the MD5 hash
    $hashed_password = md5($salted_password);
    return $hashed_password;
}

function register($input, $conn) {
    if (isset($input['email']) && isset($input['password'])) {
        $email = $conn->real_escape_string(trim($input['email']));
        $password = $conn->real_escape_string(trim($input['password']));
        $salt = generate_salt();
        $hashed_password = generate_hash($password, $salt);

        // Check if email already exists
        $check_query = "SELECT * FROM users WHERE email = '$email'";
        $result = $conn->query($check_query);

        if ($result->num_rows > 0) {
            http_response_code(409); // Conflict
            echo json_encode(["status" => "error", "message" => "Email already exists"]);
        } else {
            // Insert new user if email doesn't exist
            $query = "INSERT INTO users (email, password, salt) VALUES ('$email', '$hashed_password', '$salt')";
            if ($conn->query($query) === TRUE) {
                echo json_encode(["status" => "success", "message" => "Registration successful"]);
            } else {
                http_response_code(500); // Internal Server Error
                echo json_encode(["status" => "error", "message" => "Error: " . $conn->error]);
            }
        }
    } else {
        http_response_code(400); // Bad Request
        echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    }
}

$conn->close();
?>