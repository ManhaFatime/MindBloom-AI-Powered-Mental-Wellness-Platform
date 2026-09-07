<?php

error_reporting(E_ALL);
ini_set("display_errors", 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once "../config.php";

$userId = intval($_GET["user_id"] ?? 0);

if ($userId <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid user."
    ]);
    exit;
}

try {
    $stmt = $conn->prepare("
        SELECT
            id,
            title,
            created_at,
            updated_at
        FROM chat_conversations
        WHERE user_id = ?
        ORDER BY updated_at DESC
    ");

    $stmt->bind_param("i", $userId);
    $stmt->execute();

    $result = $stmt->get_result();

    $conversations = [];

    while ($row = $result->fetch_assoc()) {
        $conversations[] = $row;
    }

    echo json_encode([
        "success" => true,
        "conversations" => $conversations
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to load conversations."
    ]);
}