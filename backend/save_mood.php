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
$mood = trim($data["mood"] ?? "");
$note = trim($data["note"] ?? "");

$allowedMoods = [
    "Very Happy",
    "Happy",
    "Calm",
    "Neutral",
    "Sad",
    "Stressed"
];

if ($userId <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid user."
    ]);
    exit();
}

if ($mood === "" || !in_array($mood, $allowedMoods, true)) {
    echo json_encode([
        "success" => false,
        "message" => "Please select a valid mood."
    ]);
    exit();
}

if (strlen($note) > 1000) {
    echo json_encode([
        "success" => false,
        "message" => "Mood note is too long."
    ]);
    exit();
}

$stmt = $conn->prepare(
    "INSERT INTO mood_entries (user_id, mood, note)
     VALUES (?, ?, ?)"
);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Database query preparation failed."
    ]);
    exit();
}

$stmt->bind_param("iss", $userId, $mood, $note);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Mood saved successfully.",
        "entry_id" => $stmt->insert_id
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to save mood."
    ]);
}

$stmt->close();
$conn->close();