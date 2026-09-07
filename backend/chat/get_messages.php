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
$conversationId = intval($_GET["conversation_id"] ?? 0);

if ($userId <= 0 || $conversationId <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request."
    ]);
    exit;
}

try {
    $checkStmt = $conn->prepare("
        SELECT id
        FROM chat_conversations
        WHERE id = ? AND user_id = ?
        LIMIT 1
    ");

    $checkStmt->bind_param("ii", $conversationId, $userId);
    $checkStmt->execute();

    $checkResult = $checkStmt->get_result();

    if ($checkResult->num_rows === 0) {
        echo json_encode([
            "success" => false,
            "message" => "Conversation not found."
        ]);
        exit;
    }

    $stmt = $conn->prepare("
        SELECT
            id,
            conversation_id,
            user_id,
            sender,
            message,
            created_at
        FROM chat_messages
        WHERE conversation_id = ? AND user_id = ?
        ORDER BY created_at ASC, id ASC
    ");

    $stmt->bind_param("ii", $conversationId, $userId);
    $stmt->execute();

    $result = $stmt->get_result();

    $messages = [];

    while ($row = $result->fetch_assoc()) {
        $messages[] = $row;
    }

    echo json_encode([
        "success" => true,
        "messages" => $messages
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to load messages."
    ]);
}