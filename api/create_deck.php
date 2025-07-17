<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$name = trim($data['name'] ?? '');
$description = trim($data['description'] ?? '');

if (!$name) {
    http_response_code(400);
    echo json_encode(['error' => 'Deck name is required']);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO decks (user_id, name, description) VALUES (?, ?, ?)");
    $stmt->execute([$_SESSION['user_id'], $name, $description]);
    echo json_encode(['success' => true, 'deck_id' => $pdo->lastInsertId()]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
