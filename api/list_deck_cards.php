<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

$deck_id = intval($_GET['deck_id'] ?? 0);
if ($deck_id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid deck id']);
    exit;
}

try {
    $stmt = $pdo->prepare('
        SELECT dc.scryfall_id, dc.card_name, dc.quantity, cp.image_uri
        FROM deck_cards dc
        LEFT JOIN card_prices cp ON dc.scryfall_id = cp.scryfall_id
        WHERE dc.deck_id = ?
        ORDER BY dc.card_name
    ');
    $stmt->execute([$deck_id]);
    $cards = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'cards' => $cards]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error']);
}
