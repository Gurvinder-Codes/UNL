<?php
session_start();

$host = 'localhost';
$db = 'event_management';
$user = 'root';
$pass = 'root'; 

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) die("Connection failed");

$email = $_POST['email'];
$password = $_POST['password'];

if (!$email || !$password) {
    echo "Email and password required.";
    exit;
}

$stmt = $conn->prepare("SELECT id, name, password FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows == 1) {
    $stmt->bind_result($id, $name, $hashedPassword);
    $stmt->fetch();

    if (password_verify($password, $hashedPassword)) {
        $_SESSION['user_id'] = $id; 
        $_SESSION['email'] = $email; 
        $_SESSION['name'] = $name;
        echo "Login successful!";
    } else {
        echo "Incorrect password.";
    }
} else {
    echo "User not found.";
}

$stmt->close();
$conn->close();
