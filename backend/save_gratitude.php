<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

require_once "config.php";

$data = json_decode(file_get_contents("php://input"), true);

$userId = intval($data["user_id"] ?? 0);
$entryOne = trim($data["entry_one"] ?? "");
$entryTwo = trim($data["entry_two"] ?? "");
$entryThree = trim($data["entry_three"] ?? "");

if ($userId <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid user."
    ]);
    exit();
}

if ($entryOne === "" || $entryTwo === "" || $entryThree === "") {
    echo json_encode([
        "success" => false,
        "message" => "Please write all three gratitude entries."
    ]);
    exit();
}

$stmt = $conn->prepare(
    "INSERT INTO gratitude_entries
    (user_id, entry_one, entry_two, entry_three)
    VALUES (?, ?, ?, ?)"
);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to prepare database query."
    ]);
    exit();
}

$stmt->bind_param(
    "isss",
    $userId,
    $entryOne,
    $entryTwo,
    $entryThree
);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Gratitude journal saved successfully.",
        "entry_id" => $stmt->insert_id
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to save gratitude journal."
    ]);
}

$stmt->close();
$conn->close();