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
$title = trim($data["title"] ?? "New Conversation");

if ($userId <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid user."
    ]);
    exit;
}

if ($title === "") {
    $title = "New Conversation";
}

try {
    $stmt = $conn->prepare("
        INSERT INTO chat_conversations (user_id, title)
        VALUES (?, ?)
    ");

    $stmt->bind_param("is", $userId, $title);
    $stmt->execute();

    echo json_encode([
        "success" => true,
        "conversation_id" => $stmt->insert_id,
        "title" => $title
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to create conversation."
    ]);
}