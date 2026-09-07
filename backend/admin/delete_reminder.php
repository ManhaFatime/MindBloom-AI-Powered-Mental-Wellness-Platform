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

$reminderId = (int) ($data["reminder_id"] ?? 0);

$adminEmail = strtolower(
    trim($data["admin_email"] ?? "")
);

if (
    $reminderId <= 0 ||
    $adminEmail === ""
) {
    echo json_encode([
        "success" => false,
        "message" => "Reminder ID and administrator email are required"
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

$adminResult = $adminStmt->get_result();

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
| Verify reminder exists
|--------------------------------------------------------------------------
*/

$reminderStmt = $conn->prepare(
    "SELECT
        reminders.id,
        reminders.title,
        users.fullname AS user_name
     FROM reminders
     INNER JOIN users
        ON users.id = reminders.user_id
     WHERE reminders.id = ?
     LIMIT 1"
);

if (!$reminderStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to verify reminder"
    ]);

    $conn->close();
    exit;
}

$reminderStmt->bind_param(
    "i",
    $reminderId
);

$reminderStmt->execute();

$reminderResult =
    $reminderStmt->get_result();

if ($reminderResult->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Reminder was not found"
    ]);

    $reminderStmt->close();
    $conn->close();

    exit;
}

$reminder = $reminderResult->fetch_assoc();

$reminderStmt->close();

/*
|--------------------------------------------------------------------------
| Delete reminder
|--------------------------------------------------------------------------
*/

$deleteStmt = $conn->prepare(
    "DELETE FROM reminders
     WHERE id = ?"
);

if (!$deleteStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare reminder deletion"
    ]);

    $conn->close();
    exit;
}

$deleteStmt->bind_param(
    "i",
    $reminderId
);

if (!$deleteStmt->execute()) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Reminder could not be deleted"
    ]);

    $deleteStmt->close();
    $conn->close();

    exit;
}

$deleteStmt->close();
$conn->close();

echo json_encode([
    "success" => true,
    "message" => "Reminder deleted successfully",
    "deleted_reminder" => [
        "id" => $reminderId,
        "title" => $reminder["title"],
        "user_name" => $reminder["user_name"]
    ]
]);