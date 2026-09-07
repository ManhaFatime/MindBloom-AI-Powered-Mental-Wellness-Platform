<?php

error_reporting(E_ALL);
ini_set("display_errors", 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once "../config.php";

$data = json_decode(file_get_contents("php://input"), true);

$userId = intval($data["user_id"] ?? 0);
$conversationId = intval($data["conversation_id"] ?? 0);

if ($userId <= 0 || $conversationId <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request."
    ]);
    exit;
}

try {
    $stmt = $conn->prepare("
        DELETE FROM chat_conversations
        WHERE id = ? AND user_id = ?
    ");

    $stmt->bind_param(
        "ii",
        $conversationId,
        $userId
    );

    $stmt->execute();

    if ($stmt->affected_rows === 0) {
        echo json_encode([
            "success" => false,
            "message" => "Conversation not found."
        ]);
        exit;
    }

    echo json_encode([
        "success" => true,
        "message" => "Conversation deleted successfully."
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to delete conversation."
    ]);
}