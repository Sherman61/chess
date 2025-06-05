<?php
session_start();
if (isset($_SESSION['user_name'])) {
    echo json_encode(['user_name' => $_SESSION['user_name']]);
} else {
    echo json_encode(['user_name' => null]);
}
?>
