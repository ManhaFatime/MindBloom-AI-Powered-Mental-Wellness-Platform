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
$negativeThought = trim($data["negative_thought"] ?? "");
$positiveThought = trim($data["positive_thought"] ?? "");

if ($userId <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid user."
    ]);
    exit();
}

if ($negativeThought === "") {
    echo json_encode([
        "success" => false,
        "message" => "Please write your difficult thought."
    ]);
    exit();
}

if ($positiveThought === "") {
    echo json_encode([
        "success" => false,
        "message" => "Positive reframe is missing."
    ]);
    exit();
}

$stmt = $conn->prepare(
    "INSERT INTO positive_thoughts
    (user_id, negative_thought, positive_thought)
    VALUES (?, ?, ?)"
);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Database query preparation failed."
    ]);
    exit();
}

$stmt->bind_param(
    "iss",
    $userId,
    $negativeThought,
    $positiveThought
);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Positive thought saved successfully.",
        "thought_id" => $stmt->insert_id
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to save positive thought."
    ]);
}

$stmt->close();
$conn->close();