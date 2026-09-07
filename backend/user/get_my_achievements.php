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

if ($userId <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "A valid user ID is required"
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Verify user
|--------------------------------------------------------------------------
*/

$userStmt = $conn->prepare(
    "SELECT
        id,
        fullname,
        email,
        profile_image
     FROM users
     WHERE id = ?
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
    "i",
    $userId
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

$user = $userResult->fetch_assoc();

$userStmt->close();

/*
|--------------------------------------------------------------------------
| Load user achievements
|--------------------------------------------------------------------------
*/

$achievementStmt = $conn->prepare(
    "SELECT
        id,
        achievement_key,
        achievement_title,
        achievement_description,
        certificate_number,
        earned_date,
        status,
        created_at
     FROM achievements
     WHERE user_id = ?
     ORDER BY
        earned_date DESC,
        id DESC"
);

if (!$achievementStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare achievements"
    ]);

    $conn->close();
    exit;
}

$achievementStmt->bind_param(
    "i",
    $userId
);

$achievementStmt->execute();

$achievementResult =
    $achievementStmt->get_result();

$achievements = [];

while (
    $achievement =
        $achievementResult->fetch_assoc()
) {
    $achievements[] = [
        "id" => (int) $achievement["id"],
        "achievement_key" =>
            $achievement["achievement_key"],
        "achievement_title" =>
            $achievement["achievement_title"],
        "achievement_description" =>
            $achievement["achievement_description"],
        "certificate_number" =>
            $achievement["certificate_number"],
        "earned_date" =>
            $achievement["earned_date"],
        "status" =>
            $achievement["status"],
        "created_at" =>
            $achievement["created_at"]
    ];
}

$achievementStmt->close();
$conn->close();

echo json_encode([
    "success" => true,
    "user" => [
        "id" => (int) $user["id"],
        "fullname" => $user["fullname"],
        "email" => $user["email"],
        "profile_image" =>
            $user["profile_image"] ?? ""
    ],
    "total_achievements" =>
        count($achievements),
    "achievements" => $achievements
]);