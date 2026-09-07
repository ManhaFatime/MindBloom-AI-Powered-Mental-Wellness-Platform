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

$moodId = (int) ($data["mood_id"] ?? 0);
$adminEmail = trim($data["admin_email"] ?? "");

if ($moodId <= 0 || $adminEmail === "") {
    echo json_encode([
        "success" => false,
        "message" => "Mood ID and administrator email are required"
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
        "message" => "You are not authorized to delete mood records"
    ]);

    $conn->close();
    exit;
}

/*
|--------------------------------------------------------------------------
| Check selected mood record
|--------------------------------------------------------------------------
*/

$findStmt = $conn->prepare(
    "SELECT id
     FROM mood_entries
     WHERE id = ?
     LIMIT 1"
);

if (!$findStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to process mood request"
    ]);

    exit;
}

$findStmt->bind_param("i", $moodId);
$findStmt->execute();

$findResult = $findStmt->get_result();

if ($findResult->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Selected mood record was not found"
    ]);

    $findStmt->close();
    $conn->close();
    exit;
}

$findStmt->close();

/*
|--------------------------------------------------------------------------
| Delete mood record
|--------------------------------------------------------------------------
*/

$deleteStmt = $conn->prepare(
    "DELETE FROM mood_entries WHERE id = ?"
);

if (!$deleteStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare delete request"
    ]);

    exit;
}

$deleteStmt->bind_param("i", $moodId);

if ($deleteStmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Mood record deleted successfully"
    ]);
} else {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Mood record could not be deleted"
    ]);
}

$deleteStmt->close();
$conn->close();