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

$reminderType = trim(
    $data["reminder_type"] ?? ""
);

$title = trim(
    $data["title"] ?? ""
);

$description = trim(
    $data["description"] ?? ""
);

$reminderDate = trim(
    $data["reminder_date"] ?? ""
);

$reminderTime = trim(
    $data["reminder_time"] ?? ""
);

$adminEmail = strtolower(
    trim($data["admin_email"] ?? "")
);

/*
|--------------------------------------------------------------------------
| Required fields
|--------------------------------------------------------------------------
*/

if (
    $userId <= 0 ||
    $reminderType === "" ||
    $title === "" ||
    $reminderDate === "" ||
    $adminEmail === ""
) {
    echo json_encode([
        "success" => false,
        "message" => "User, reminder type, title and date are required"
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Validate reminder type
|--------------------------------------------------------------------------
*/

$allowedTypes = [
    "exercise",
    "assessment",
    "general"
];

if (!in_array($reminderType, $allowedTypes, true)) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid reminder type"
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Validate date
|--------------------------------------------------------------------------
*/

$dateObject = DateTime::createFromFormat(
    "Y-m-d",
    $reminderDate
);

if (
    !$dateObject ||
    $dateObject->format("Y-m-d") !== $reminderDate
) {
    echo json_encode([
        "success" => false,
        "message" => "Please enter a valid reminder date"
    ]);

    exit;
}

$today = new DateTime("today");

if ($dateObject < $today) {
    echo json_encode([
        "success" => false,
        "message" => "Reminder date cannot be in the past"
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Validate optional time
|--------------------------------------------------------------------------
*/

if ($reminderTime !== "") {
    $timeObject = DateTime::createFromFormat(
        "H:i",
        $reminderTime
    );

    if (
        !$timeObject ||
        $timeObject->format("H:i") !== $reminderTime
    ) {
        echo json_encode([
            "success" => false,
            "message" => "Please enter a valid reminder time"
        ]);

        exit;
    }

    $reminderTime .= ":00";
} else {
    $reminderTime = null;
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
| Verify selected user
|--------------------------------------------------------------------------
*/

$userStmt = $conn->prepare(
    "SELECT
        id,
        fullname,
        email
     FROM users
     WHERE id = ?
       AND role = 'user'
     LIMIT 1"
);

if (!$userStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to verify selected user"
    ]);

    $conn->close();
    exit;
}

$userStmt->bind_param(
    "i",
    $userId
);

$userStmt->execute();

$userResult = $userStmt->get_result();

if ($userResult->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Selected user was not found"
    ]);

    $userStmt->close();
    $conn->close();

    exit;
}

$user = $userResult->fetch_assoc();

$userStmt->close();

/*
|--------------------------------------------------------------------------
| Insert reminder
|--------------------------------------------------------------------------
*/

$insertStmt = $conn->prepare(
    "INSERT INTO reminders
        (
            user_id,
            reminder_type,
            title,
            description,
            reminder_date,
            reminder_time,
            status,
            email_sent
        )
     VALUES
        (?, ?, ?, ?, ?, ?, 'pending', 0)"
);

if (!$insertStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare reminder"
    ]);

    $conn->close();
    exit;
}

$insertStmt->bind_param(
    "isssss",
    $userId,
    $reminderType,
    $title,
    $description,
    $reminderDate,
    $reminderTime
);

if (!$insertStmt->execute()) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Reminder could not be created"
    ]);

    $insertStmt->close();
    $conn->close();

    exit;
}

$reminderId = $insertStmt->insert_id;

$insertStmt->close();
$conn->close();

echo json_encode([
    "success" => true,
    "message" => "Reminder assigned successfully",
    "reminder" => [
        "id" => $reminderId,
        "user_id" => $userId,
        "user_name" => $user["fullname"],
        "user_email" => $user["email"],
        "reminder_type" => $reminderType,
        "title" => $title,
        "description" => $description,
        "reminder_date" => $reminderDate,
        "reminder_time" => $reminderTime,
        "status" => "pending"
    ]
]);