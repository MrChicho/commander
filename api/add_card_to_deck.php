<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$deck_id = intval($data['deck_id'] ?? 0);
$scryfall_id = $data['scryfall_id'] ?? '';
$card_name = $data['card_name'] ?? '';
$quantity = intval($data['quantity'] ?? 1);


if ($deck_id <= 0 || !$scryfall_id || !$card_name || $quantity <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid input']);
    exit;
}

try {
    // You should have a deck_cards table: deck_id, scryfall_id, card_name, quantity
    $stmt = $pdo->prepare("INSERT INTO deck_cards (deck_id, scryfall_id, card_name, quantity) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)");
    $stmt->execute([$deck_id, $scryfall_id, $card_name, $quantity]);
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error']);
}
