<?php
header("Content-Type: application/json");

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "test";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    // Set HTTP status code 500 for internal server error
    http_response_code(500);
    die(json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]));
}

$request_method = $_SERVER["REQUEST_METHOD"];

if ($request_method == 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
    updateCoins($input, $conn);
} else {
    // Set HTTP status code 405 for method not allowed
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
}

function updateCoins($input, $conn) {
    // Check if userId and coins are provided in the input
    if (isset($input['userId']) && isset($input['coins'])) {
        $user_id = $input['userId'];
        $coins = $input['coins'];

        // Ensure coins is a valid integer
        if (!is_numeric($coins)) {
            // Set HTTP status code 400 for bad request
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Coins must be a valid number']);
            return;
        }

        // Prepare statement to check if user exists
        $stmt = $conn->prepare("SELECT id FROM user_coins WHERE user_id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            // Update user's coins if user exists
            $stmt = $conn->prepare("UPDATE user_coins SET coins = ? WHERE user_id = ?");
            $stmt->bind_param("ii", $coins, $user_id);
            $stmt->execute();

            // Set HTTP status code 200 for successful update
            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'Coins updated']);
        } else {
            // If user doesn't exist, create a new record
            $stmt = $conn->prepare("INSERT INTO user_coins (user_id, coins) VALUES (?, ?)");
            $stmt->bind_param("ii", $user_id, $coins);
            $stmt->execute();

            // Set HTTP status code 201 for successful creation
            http_response_code(201);
            echo json_encode(['status' => 'success', 'message' => 'Coins created']);
        }

        $stmt->close();
    } else {
        // Set HTTP status code 400 for bad request
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'User ID and coins are required']);
    }
}

$conn->close();
?>