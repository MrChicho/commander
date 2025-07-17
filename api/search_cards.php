<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$q = trim($_GET['q'] ?? '');
if ($q === '') {
    echo json_encode(['success' => false, 'cards' => []]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT scryfall_id, NAME, set_code FROM card_prices WHERE NAME LIKE ? LIMIT 20");
    $stmt->execute(['%' . $q . '%']);
    $cards = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'cards' => $cards]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error']);
}
