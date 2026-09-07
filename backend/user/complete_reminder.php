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

$userId = (int) ($data["user_id"] ?? 0);
$userEmail = strtolower(
    trim($data["email"] ?? "")
);
$reminderId = (int) ($data["reminder_id"] ?? 0);

if (
    $userId <= 0 ||
    $reminderId <= 0 ||
    $userEmail === ""
) {
    echo json_encode([
        "success" => false,
        "message" => "User and reminder information are required"
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Verify user
|--------------------------------------------------------------------------
*/

$userStmt = $conn->prepare(
    "SELECT id
     FROM users
     WHERE id = ?
       AND email = ?
       AND role = 'user'
     LIMIT 1"
);

if (!$userStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to verify user"
    ]);

    $conn->close();
    exit;
}

$userStmt->bind_param(
    "is",
    $userId,
    $userEmail
);

$userStmt->execute();

$userResult = $userStmt->get_result();

if ($userResult->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "User account was not found"
    ]);

    $userStmt->close();
    $conn->close();

    exit;
}

$userStmt->close();

/*
|--------------------------------------------------------------------------
| Verify reminder belongs to user
|--------------------------------------------------------------------------
*/

$reminderStmt = $conn->prepare(
    "SELECT
        id,
        status
     FROM reminders
     WHERE id = ?
       AND user_id = ?
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
    "ii",
    $reminderId,
    $userId
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

if ($reminder["status"] === "completed") {
    echo json_encode([
        "success" => true,
        "message" => "Reminder is already completed",
        "reminder_id" => $reminderId,
        "status" => "completed"
    ]);

    $conn->close();
    exit;
}

/*
|--------------------------------------------------------------------------
| Mark reminder as completed
|--------------------------------------------------------------------------
*/

$updateStmt = $conn->prepare(
    "UPDATE reminders
     SET status = 'completed'
     WHERE id = ?
       AND user_id = ?"
);

if (!$updateStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare reminder update"
    ]);

    $conn->close();
    exit;
}

$updateStmt->bind_param(
    "ii",
    $reminderId,
    $userId
);

if (!$updateStmt->execute()) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Reminder could not be completed"
    ]);

    $updateStmt->close();
    $conn->close();

    exit;
}

$updateStmt->close();
$conn->close();

echo json_encode([
    "success" => true,
    "message" => "Reminder completed successfully",
    "reminder_id" => $reminderId,
    "status" => "completed"
]);