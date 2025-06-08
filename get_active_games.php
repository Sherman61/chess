<?php
session_start();
header('Content-Type: application/json');

// Load DB config
require_once './backend/config.php';

// Connect to MySQL
$mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($mysqli->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

// Query for active games
$sql = "SELECT room_name, white_player, black_player FROM ongoing_games WHERE status = 'active'";
$result = $mysqli->query($sql);

$games = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $games[] = $row;
    }
}

echo json_encode($games);
$mysqli->close();
?>
