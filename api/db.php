<?php
$servername = "sql12.freemysqlhosting.net";  // Replace with your database server name
$username = "sql12755601";         // Replace with your database username
$password = "U5BfxJu4fP";             // Replace with your database password
$dbname = "sql12755601";  // Replace with your database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
