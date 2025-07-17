<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$deck_id = intval($_GET['id'] ?? 0);
if (!$deck_id) {
    echo json_encode(['success' => false, 'error' => 'Missing deck id']);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM decks WHERE id = ?");
$stmt->execute([$deck_id]);
$deck = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$deck) {
    echo json_encode(['success' => false, 'error' => 'Deck not found']);
    exit;
}

// Get cards
$stmt = $pdo->prepare("SELECT card_name, card_type, quantity, scryfall_id, image_uri FROM deck_cards WHERE deck_id = ? ORDER BY card_type, card_name");
$stmt->execute([$deck_id]);
$cards = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['success' => true, 'deck' => $deck, 'cards' => $cards]);
