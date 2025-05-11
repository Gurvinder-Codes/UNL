<?php
session_start();

header('Content-Type: application/json');
$host = 'localhost';
$db   = 'event_management';
$user = 'root';
$pass = 'root';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'checkLoginStatus':
    echo json_encode(['loggedIn' => isset($_SESSION['email'])]);
    break;

    case 'getEvents':
        $email = $_SESSION['email'];
        $stmt = $pdo->prepare("
            SELECT *
            FROM events e
            WHERE e.createdBy != ?
            AND NOT EXISTS (
                SELECT 1
                FROM registrations r
                WHERE r.eventId = e.id AND r.email = ?
            )
        ");
        $stmt->execute([$email, $email]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
    
    case 'getMyEvents':
        $email = $_SESSION['email'];

        $stmt = $pdo->prepare("SELECT * FROM events WHERE createdBy = ?");
        $stmt->execute([$email]);

        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
        
    case 'getRegisteredEvents':
        $email = $_SESSION['email'];

        $stmt = $pdo->prepare("
            SELECT e.*
            FROM events e
            INNER JOIN registrations r ON e.id = r.eventId
            WHERE r.email = ?
        ");
        $stmt->execute([$email]);

        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'createEvent':
        $data = json_decode(file_get_contents("php://input"), true);
        $email = $_SESSION['email'];
        $sql = "INSERT INTO events (title, date, location, description, imageURL, createdBy) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['title'], $data['date'], $data['location'], $data['description'], $data['imageURL'], $email
        ]);
        echo json_encode(["success" => true]);
        break;

    case 'registerEvent':
        $data = json_decode(file_get_contents("php://input"), true);
        $name = $_SESSION['name'];
        $email = $_SESSION['email'];
        $eventId = intval($data['eventId']);

        try {
        $stmt = $pdo->prepare("INSERT INTO registrations (eventId, name, email) VALUES (?, ?, ?)");
        $stmt->execute([$eventId, $name, $email]);

        echo json_encode(["success" => true]);
        } catch (PDOException $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
        break;

    case 'submitFeedback':
        $data = json_decode(file_get_contents("php://input"), true);
        $email = $_SESSION['email'];
        $sql = "INSERT INTO feedback (eventId, rating, comment, givenBy) VALUES (?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['eventId'], $data['rating'], $data['comment'], $email
        ]);
        echo json_encode(["success" => true]);
        break;

    case 'getFeedbacks':
        $email = $_SESSION['email'];
        $stmt = $pdo->prepare("SELECT feedback.*, events.title, users.name FROM feedback JOIN events ON events.id = feedback.eventId JOIN users ON users.email = feedback.givenBy WHERE events.createdBy = ?");
        $stmt->execute([$email]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'getUserFeedbackEvents':
        $email = $_SESSION['email'];
        $stmt = $pdo->prepare("
            SELECT events.* 
            FROM events
            JOIN feedback ON events.id = feedback.eventId
            WHERE feedback.givenBy = ?
        ");
        $stmt->execute([$email]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'logout':
        session_destroy();
        header("Location: /CSCE864-Project1/login.html");
        break;
        
    default:
        http_response_code(400);
        echo json_encode(["error" => "Invalid action"]);
        break;
}
?>
