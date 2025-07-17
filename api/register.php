<?php
<?php
// register.php
require 'db.php';

$email = $_POST['email'] ?? '';
$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

if (!$email || !$username || !$password) {
    exit('❌ All fields are required.');
}

$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare("INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)");
try {
    $stmt->execute([$email, $username, $hash]);
    // Redirect to dashboard.html with a success message
    header("Location: /dashboard.html?registered=1");
    exit;
} catch (PDOException $e) {
    echo '❌ Error: ' . $e->getMessage();
}
?>