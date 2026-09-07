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
$seenItems = trim($data["seen_items"] ?? "");
$feltItems = trim($data["felt_items"] ?? "");
$heardItems = trim($data["heard_items"] ?? "");
$smelledItems = trim($data["smelled_items"] ?? "");
$tastedItem = trim($data["tasted_item"] ?? "");

if ($userId <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid user."
    ]);
    exit();
}

if (
    $seenItems === "" ||
    $feltItems === "" ||
    $heardItems === "" ||
    $smelledItems === "" ||
    $tastedItem === ""
) {
    echo json_encode([
        "success" => false,
        "message" => "Please complete all mindfulness steps."
    ]);
    exit();
}

$stmt = $conn->prepare(
    "INSERT INTO mindfulness_entries
    (
        user_id,
        seen_items,
        felt_items,
        heard_items,
        smelled_items,
        tasted_item
    )
    VALUES (?, ?, ?, ?, ?, ?)"
);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Database query preparation failed."
    ]);
    exit();
}

$stmt->bind_param(
    "isssss",
    $userId,
    $seenItems,
    $feltItems,
    $heardItems,
    $smelledItems,
    $tastedItem
);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Mindfulness exercise saved successfully.",
        "entry_id" => $stmt->insert_id
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to save mindfulness exercise."
    ]);
}

$stmt->close();
$conn->close();