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
$reflection = trim($data["reflection"] ?? "");
$aiResponse = trim($data["ai_response"] ?? "");

if ($userId <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid user."
    ]);
    exit;
}

if ($mood === "") {
    echo json_encode([
        "success" => false,
        "message" => "Please select your mood."
    ]);
    exit;
}

if ($reflection === "") {
    echo json_encode([
        "success" => false,
        "message" => "Please write your daily reflection."
    ]);
    exit;
}

if ($aiResponse === "") {
    echo json_encode([
        "success" => false,
        "message" => "AI response is missing."
    ]);
    exit;
}

$stmt = $conn->prepare(
    "INSERT INTO reflection_entries
    (user_id, mood, reflection, ai_response)
    VALUES (?, ?, ?, ?)"
);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Database query preparation failed."
    ]);
    exit;
}

$stmt->bind_param(
    "isss",
    $userId,
    $mood,
    $reflection,
    $aiResponse
);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Daily reflection saved successfully.",
        "reflection_id" => $stmt->insert_id
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to save daily reflection."
    ]);
}

$stmt->close();
$conn->close();