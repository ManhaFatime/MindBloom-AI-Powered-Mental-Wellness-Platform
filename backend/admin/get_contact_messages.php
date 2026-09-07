<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Only GET requests are allowed"
    ]);

    exit;
}

require_once __DIR__ . "/../config.php";

$stmt = $conn->prepare(
    "SELECT
        contact_messages.id,
        contact_messages.user_id,
        contact_messages.fullname,
        contact_messages.email,
        contact_messages.subject,
        contact_messages.message,
        contact_messages.status,
        contact_messages.created_at,
        users.profile_image
     FROM contact_messages
     LEFT JOIN users
        ON users.id = contact_messages.user_id
     ORDER BY
        CASE
            WHEN contact_messages.status = 'unread' THEN 0
            ELSE 1
        END,
        contact_messages.created_at DESC,
        contact_messages.id DESC"
);

if (!$stmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare contact messages"
    ]);

    $conn->close();
    exit;
}

$stmt->execute();

$result = $stmt->get_result();

$messages = [];
$unreadCount = 0;

while ($row = $result->fetch_assoc()) {
    if ($row["status"] === "unread") {
        $unreadCount++;
    }

    $messages[] = [
        "id" => (int) $row["id"],
        "user_id" => $row["user_id"] !== null
            ? (int) $row["user_id"]
            : null,
        "fullname" => $row["fullname"],
        "email" => $row["email"],
        "subject" => $row["subject"],
        "message" => $row["message"],
        "status" => $row["status"],
        "profile_image" => $row["profile_image"] ?? "",
        "created_at" => $row["created_at"]
    ];
}

$stmt->close();
$conn->close();

echo json_encode([
    "success" => true,
    "total_messages" => count($messages),
    "unread_messages" => $unreadCount,
    "messages" => $messages
]);