<?php
// Force secure, modern session settings
$secure = false; // set to false for testing on HTTP or if HTTPS is not enforced
$httponly = true;
$samesite = 'Strict'; // or 'Lax' if Strict causes issues
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    // 'domain' => 'commander.awesome-domain.net', // removed for compatibility
    'secure' => $secure,
    'httponly' => $httponly,
    'samesite' => $samesite
]);
session_start();
file_put_contents('/tmp/session_debug.txt', print_r($_SESSION, true));

  // <-- Needed to access session variables
header('Content-Type: application/json');

if (isset($_SESSION['user_id'], $_SESSION['email'])) {
    echo json_encode([
        'logged_in' => true,
        'email' => $_SESSION['email']
    ]);
} else {
    echo json_encode(['logged_in' => false]);
}
