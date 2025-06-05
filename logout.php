<?php
session_start();

// Destroy all session variables
$_SESSION = [];
session_destroy();

// Optional: Clear cookies if used
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Redirect to login page
header("Location: login.html");
exit;
?>
