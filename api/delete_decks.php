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
$deck_id = intval($data['deck_id'] ?? 0);

if ($deck_id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid deck ID']);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM decks WHERE id = ? AND user_id = ?");
    $stmt->execute([$deck_id, $_SESSION['user_id']]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Deck not found']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
