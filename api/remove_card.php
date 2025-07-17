<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$data = json_decode(file_get_contents('php://input'), true);
$deck_id = intval($data['deck_id'] ?? 0);
$card_name = $data['card_name'] ?? '';

if (!$deck_id || !$card_name) {
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM deck_cards WHERE deck_id = ? AND card_name = ?");
    $stmt->execute([$deck_id, $card_name]);
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Server error']);
}
