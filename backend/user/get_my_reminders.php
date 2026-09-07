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

if ($userId <= 0 || $userEmail === "") {
    echo json_encode([
        "success" => false,
        "message" => "User ID and email are required"
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
| Load user reminders
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare(
    "SELECT
        id,
        reminder_type,
        title,
        description,
        reminder_date,
        reminder_time,
        status,
        email_sent,
        created_at
     FROM reminders
     WHERE user_id = ?
     ORDER BY
        CASE
            WHEN status = 'pending' THEN 0
            ELSE 1
        END,
        reminder_date ASC,
        reminder_time ASC,
        id DESC"
);

if (!$stmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to load reminders"
    ]);

    $conn->close();
    exit;
}

$stmt->bind_param(
    "i",
    $userId
);

$stmt->execute();

$result = $stmt->get_result();

$reminders = [];

date_default_timezone_set("Asia/Karachi");

$today = date("Y-m-d");

while ($row = $result->fetch_assoc()) {
    $reminderDate = $row["reminder_date"];

    $dateStatus = "upcoming";

    if ($reminderDate === $today) {
        $dateStatus = "today";
    } elseif ($reminderDate < $today) {
        $dateStatus = "overdue";
    }

    $reminders[] = [
        "id" => (int) $row["id"],
        "reminder_type" => $row["reminder_type"],
        "title" => $row["title"],
        "description" => $row["description"] ?? "",
        "reminder_date" => $row["reminder_date"],
        "reminder_time" => $row["reminder_time"],
        "status" => $row["status"],
        "date_status" => $dateStatus,
        "email_sent" => (int) $row["email_sent"],
        "created_at" => $row["created_at"]
    ];
}

$stmt->close();
$conn->close();

echo json_encode([
    "success" => true,
    "today" => $today,
    "reminders" => $reminders
]);