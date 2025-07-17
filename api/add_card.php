<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$data = json_decode(file_get_contents('php://input'), true);
$deck_id = intval($data['deck_id'] ?? 0);
$card_name = $data['card_name'] ?? '';
$card_type = $data['card_type'] ?? '';
scryfall_id = $data['scryfall_id'] ?? '';
$image_uri = $data['image_uri'] ?? '';
$quantity = intval($data['quantity'] ?? 1);

if (!$deck_id || !$card_name || !$scryfall_id) {
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO deck_cards (deck_id, card_name, card_type, quantity, scryfall_id, image_uri) VALUES (?, ?, ?, ?, ?, ?)\n        ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)");
    $stmt->execute([$deck_id, $card_name, $card_type, $quantity, $scryfall_id, $image_uri]);
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Server error']);
}
