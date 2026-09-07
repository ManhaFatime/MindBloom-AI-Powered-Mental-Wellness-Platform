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

/*
|--------------------------------------------------------------------------
| Load all reminders with user details
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare(
    "SELECT
        reminders.id,
        reminders.user_id,
        reminders.reminder_type,
        reminders.title,
        reminders.description,
        reminders.reminder_date,
        reminders.reminder_time,
        reminders.status,
        reminders.email_sent,
        reminders.created_at,
        users.fullname AS user_name,
        users.email AS user_email,
        users.profile_image
     FROM reminders
     INNER JOIN users
        ON users.id = reminders.user_id
     WHERE users.role = 'user'
     ORDER BY
        reminders.reminder_date ASC,
        reminders.reminder_time ASC,
        reminders.id DESC"
);

if (!$stmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare reminder records"
    ]);

    $conn->close();
    exit;
}

$stmt->execute();

$result = $stmt->get_result();

$reminders = [];

while ($row = $result->fetch_assoc()) {
    $reminders[] = [
        "id" => (int) $row["id"],
        "user_id" => (int) $row["user_id"],
        "user_name" => $row["user_name"],
        "user_email" => $row["user_email"],
        "profile_image" => $row["profile_image"] ?? "",
        "reminder_type" => $row["reminder_type"],
        "title" => $row["title"],
        "description" => $row["description"] ?? "",
        "reminder_date" => $row["reminder_date"],
        "reminder_time" => $row["reminder_time"],
        "status" => $row["status"],
        "email_sent" => (int) $row["email_sent"],
        "created_at" => $row["created_at"]
    ];
}

$stmt->close();
$conn->close();

echo json_encode([
    "success" => true,
    "reminders" => $reminders
]);