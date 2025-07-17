<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

require 'db.php';
$stmt = $pdo->prepare("SELECT id, name, created_at FROM decks WHERE user_id = ?");
$stmt->execute([$_SESSION['user_id']]);
$decks = $stmt->fetchAll();

echo json_encode(['success' => true, 'decks' => $decks]);
