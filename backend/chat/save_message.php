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

$conversationId = intval($data["conversation_id"] ?? 0);
$userId = intval($data["user_id"] ?? 0);
$sender = trim($data["sender"] ?? "");
$message = trim($data["message"] ?? "");

if ($conversationId <= 0 || $userId <= 0 || $message === "") {
    echo json_encode([
        "success" => false,
        "message" => "Missing required data."
    ]);
    exit;
}

if ($sender !== "user" && $sender !== "bot") {
    echo json_encode([
        "success" => false,
        "message" => "Invalid sender."
    ]);
    exit;
}

try {
    $stmt = $conn->prepare("
        INSERT INTO chat_messages
        (conversation_id, user_id, sender, message)
        VALUES (?, ?, ?, ?)
    ");

    $stmt->bind_param(
        "iiss",
        $conversationId,
        $userId,
        $sender,
        $message
    );

    $stmt->execute();

    echo json_encode([
        "success" => true,
        "message_id" => $stmt->insert_id
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to save message."
    ]);
}