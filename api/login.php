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
    login($input, $conn);
} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
}

function generate_hash($password, $salt) {
    // Combine password and salt
    $salted_password = $password . $salt;
    // Generate the MD5 hash
    $hashed_password = md5($salted_password);
    return $hashed_password;
}

function login($input, $conn) {
    $email = isset($input['email']) ? $input['email'] : null;
    $password = isset($input['password']) ? $input['password'] : null;

    if (!empty($email) && !empty($password)) {
        // Escape input to prevent SQL injection
        $email = $conn->real_escape_string(trim($input['email']));
        $password = $conn->real_escape_string(trim($input['password']));
        
        // Prepare the SQL query to fetch the stored password for the given email
        $query = "SELECT id, password, salt FROM users WHERE email = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("s", $email); // Bind the email parameter
        $stmt->execute();
        $stmt->store_result();
        $stmt->bind_result($storedId, $storedPassword, $stored_salt); // Bind the stored password from the result

        // Check if the email exists in the database
        if ($stmt->num_rows > 0) {
            // Fetch the stored password
            $stmt->fetch();
            $hashed_password = generate_hash($password, $stored_salt);

            // Verify the entered password against the stored hashed password
            if ($hashed_password == $storedPassword) {
                // Password is correct
                echo json_encode(["status" => "success", "message" => "Login successful", "id" => $storedId]);
            } else {
                // Password is incorrect
                http_response_code(401); // Unauthorized
                echo json_encode(["status" => "error", "message" => "Invalid password"]);
            }
        } else {
            // Email does not exist
            http_response_code(404); // Not Found
            echo json_encode(["status" => "error", "message" => "No user found with this email address"]);
        }

        $stmt->close();
    } else {
        // Missing required fields (email or password)
        http_response_code(400); // Bad Request
        echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    }
}

$conn->close();
?>