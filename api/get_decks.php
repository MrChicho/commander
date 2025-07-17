<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

try {
    $userId = $_SESSION['user_id'];
    $stmt = $pdo->prepare("SELECT id, name, description, created_at FROM decks WHERE user_id = ?");
    $stmt->execute([$userId]);
    $decks = $stmt->fetchAll();

    echo json_encode(['success' => true, 'decks' => $decks]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'details' => $e->getMessage()]);
}
