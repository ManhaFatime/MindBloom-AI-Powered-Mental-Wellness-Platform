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

require_once "../config.php";

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$recordId = (int) ($data["record_id"] ?? 0);
$activityType = trim($data["activity_type"] ?? "");
$adminEmail = trim($data["admin_email"] ?? "");

if (
    $recordId <= 0 ||
    $activityType === "" ||
    $adminEmail === ""
) {
    echo json_encode([
        "success" => false,
        "message" => "Activity ID, activity type and administrator email are required"
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Verify administrator
|--------------------------------------------------------------------------
*/

$adminStmt = $conn->prepare(
    "SELECT id, role
     FROM users
     WHERE email = ?
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

$adminStmt->bind_param("s", $adminEmail);
$adminStmt->execute();

$adminResult = $adminStmt->get_result();

if ($adminResult->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Administrator account was not found"
    ]);

    $adminStmt->close();
    $conn->close();
    exit;
}

$admin = $adminResult->fetch_assoc();

$adminStmt->close();

if ($admin["role"] !== "admin") {
    echo json_encode([
        "success" => false,
        "message" => "You are not authorized to delete activity records"
    ]);

    $conn->close();
    exit;
}

/*
|--------------------------------------------------------------------------
| Match activity type with database table
|--------------------------------------------------------------------------
*/

$allowedTables = [
    "daily_challenge" => "daily_challenges",
    "gratitude" => "gratitude_entries",
    "mindfulness" => "mindfulness_entries",
    "positive_thought" => "positive_thoughts",
    "reflection" => "reflection_entries"
];

if (!isset($allowedTables[$activityType])) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid activity type"
    ]);

    $conn->close();
    exit;
}

$tableName = $allowedTables[$activityType];

/*
|--------------------------------------------------------------------------
| Confirm activity exists
|--------------------------------------------------------------------------
*/

$findSql = "SELECT id FROM `$tableName` WHERE id = ? LIMIT 1";

$findStmt = $conn->prepare($findSql);

if (!$findStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to process activity request"
    ]);

    $conn->close();
    exit;
}

$findStmt->bind_param("i", $recordId);
$findStmt->execute();

$findResult = $findStmt->get_result();

if ($findResult->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Selected activity record was not found"
    ]);

    $findStmt->close();
    $conn->close();
    exit;
}

$findStmt->close();

/*
|--------------------------------------------------------------------------
| Delete activity
|--------------------------------------------------------------------------
*/

$deleteSql = "DELETE FROM `$tableName` WHERE id = ?";

$deleteStmt = $conn->prepare($deleteSql);

if (!$deleteStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare delete request"
    ]);

    $conn->close();
    exit;
}

$deleteStmt->bind_param("i", $recordId);

if ($deleteStmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Activity record deleted successfully"
    ]);
} else {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Activity record could not be deleted"
    ]);
}

$deleteStmt->close();
$conn->close();