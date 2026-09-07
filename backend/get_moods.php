<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once "config.php";

$data = json_decode(file_get_contents("php://input"), true);
$userId = intval($data["user_id"] ?? 0);

if ($userId <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid user.",
        "entries" => []
    ]);
    exit();
}

$stmt = $conn->prepare(
    "SELECT id, mood, note, created_at
     FROM mood_entries
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 7"
);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Database query preparation failed.",
        "entries" => []
    ]);
    exit();
}

$stmt->bind_param("i", $userId);
$stmt->execute();

$result = $stmt->get_result();
$entries = [];

while ($row = $result->fetch_assoc()) {
    $entries[] = $row;
}

echo json_encode([
    "success" => true,
    "entries" => $entries
]);

$stmt->close();
$conn->close();