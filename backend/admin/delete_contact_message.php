<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Only POST requests are allowed"
    ]);

    exit;
}

require_once __DIR__ . "/../config.php";

$data = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($data)) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request data"
    ]);

    exit;
}

$messageId = (int) (
    $data["message_id"] ?? 0
);

$adminEmail = strtolower(
    trim($data["admin_email"] ?? "")
);

if (
    $messageId <= 0 ||
    $adminEmail === ""
) {
    echo json_encode([
        "success" => false,
        "message" => "Message ID and administrator email are required"
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Verify administrator
|--------------------------------------------------------------------------
*/

$adminStmt = $conn->prepare(
    "SELECT id
     FROM users
     WHERE email = ?
       AND role = 'admin'
     LIMIT 1"
);

if (!$adminStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to verify administrator"
    ]);

    $conn->close();
    exit;
}

$adminStmt->bind_param(
    "s",
    $adminEmail
);

$adminStmt->execute();

$adminResult =
    $adminStmt->get_result();

if ($adminResult->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Administrator access was not verified"
    ]);

    $adminStmt->close();
    $conn->close();

    exit;
}

$adminStmt->close();

/*
|--------------------------------------------------------------------------
| Verify contact message exists
|--------------------------------------------------------------------------
*/

$messageStmt = $conn->prepare(
    "SELECT
        id,
        fullname,
        email,
        subject
     FROM contact_messages
     WHERE id = ?
     LIMIT 1"
);

if (!$messageStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to verify contact message"
    ]);

    $conn->close();
    exit;
}

$messageStmt->bind_param(
    "i",
    $messageId
);

$messageStmt->execute();

$messageResult =
    $messageStmt->get_result();

if ($messageResult->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Contact message was not found"
    ]);

    $messageStmt->close();
    $conn->close();

    exit;
}

$messageRecord =
    $messageResult->fetch_assoc();

$messageStmt->close();

/*
|--------------------------------------------------------------------------
| Delete contact message
|--------------------------------------------------------------------------
*/

$deleteStmt = $conn->prepare(
    "DELETE FROM contact_messages
     WHERE id = ?"
);

if (!$deleteStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare message deletion"
    ]);

    $conn->close();
    exit;
}

$deleteStmt->bind_param(
    "i",
    $messageId
);

if (!$deleteStmt->execute()) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Contact message could not be deleted"
    ]);

    $deleteStmt->close();
    $conn->close();

    exit;
}

$deleteStmt->close();
$conn->close();

echo json_encode([
    "success" => true,
    "message" => "Contact message deleted successfully",
    "deleted_message" => [
        "id" => $messageId,
        "fullname" => $messageRecord["fullname"],
        "email" => $messageRecord["email"],
        "subject" => $messageRecord["subject"]
    ]
]);