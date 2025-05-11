<?php
$host = 'localhost';
$db = 'event_management';
$user = 'root';
$pass = 'root'; 

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) die("Connection failed");

$name = $_POST['name'];
$email = $_POST['email'];
$password = $_POST['password'];

if (!$name || !$email || !$password) {
    echo "All fields are required.";
    exit;
}

if (strlen($password) < 8) {
    echo "Password must be at least 8 characters long.";
    exit;
}

$check = $conn->prepare("SELECT email FROM users WHERE email = ?");
$check->bind_param("s", $email);
$check->execute();
$check->store_result();

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

if ($check->num_rows > 0) {
    echo "Email already registered.";
} else {
    $stmt = $conn->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $name, $email, $hashedPassword);
}

if ($stmt->execute()) {
    echo "Registered successfully!";
} else {
    echo "Error: " . $stmt->error;
}

$stmt->close();
$conn->close();
