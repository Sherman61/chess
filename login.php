<?php
session_start();
require_once(__DIR__ . "/backend/config.php");



ini_set('display_errors', 1);
ini_set('display_startup_errors', 1); // add this too
error_reporting(E_ALL);


header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === "POST") {

    $user_name = $_POST['user_name'] ?? '';
    $password = $_POST['password'] ?? '';

    if (!empty($user_name) && !empty($password)) {
        $stmt = $con->prepare("SELECT * FROM users WHERE user_name = ?");
        $stmt->bind_param("s", $user_name);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        $stmt->close();

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['username'] = $user['user_name'];
            $_SESSION['user_id'] = $user['user_id'];

            $_SESSION['display_name'] = $user['display_name'] ?? null;

            echo json_encode(['success' => true]);
            exit;
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid login']);
            exit;
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Missing credentials']);
        exit;
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request']);
    exit;
}
?>
