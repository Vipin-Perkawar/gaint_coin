<?php
header("Content-Type: application/json");

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "test";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    // Set the status code to 500 for server error
    http_response_code(500);
    die(json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]));
}

$request_method = $_SERVER["REQUEST_METHOD"];

if ($request_method == 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
    getCoins($input, $conn);
} else {
    // Set the status code to 405 for Method Not Allowed
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
}

function getCoins($input, $conn) {
    if (isset($input['userId'])) {
        $user_id = $input['userId'];

        // Prepare the SQL statement
        $query = "SELECT coins FROM user_coins WHERE user_id = ?";
        $stmt = $conn->prepare($query);

        // Bind parameters and execute
        $stmt->bind_param("i", $user_id); // 'i' for integer
        $stmt->execute();

        // Get result
        $result = $stmt->get_result();
        
        // Fetch the result as an associative array
        if ($row = $result->fetch_assoc()) {
            // Set the status code to 200 for success
            http_response_code(200);
            echo json_encode(['status' => 'success', 'coins' => $row['coins']]);
        } else {
            // Set the status code to 404 for Not Found
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'User not found']);
        }

        // Close the statement
        $stmt->close();
    } else {
        // Set the status code to 400 for Bad Request
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'User ID is required']);
    }
}

$conn->close();
?>