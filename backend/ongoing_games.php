<?php
require_once("config.php");
header('Content-Type: application/json');

$sql = "SELECT room_name, white_player, black_player, status FROM ongoing_games WHERE status = 'active'";
$result = $con->query($sql);

$games = [];
while ($row = $result->fetch_assoc()) {
    $games[] = $row;
}
echo json_encode($games);
?>
