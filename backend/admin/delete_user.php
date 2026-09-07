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

$userId = (int) ($data["user_id"] ?? 0);
$adminEmail = trim($data["admin_email"] ?? "");

if ($userId <= 0 || $adminEmail === "") {
    echo json_encode([
        "success" => false,
        "message" => "User ID and administrator email are required"
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
        "message" => "You are not authorized to delete users"
    ]);

    $conn->close();
    exit;
}

/*
|--------------------------------------------------------------------------
| Find selected user
|--------------------------------------------------------------------------
*/

$userStmt = $conn->prepare(
    "SELECT id, fullname, email, role, profile_image
     FROM users
     WHERE id = ?
     LIMIT 1"
);

if (!$userStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to process user request"
    ]);

    exit;
}

$userStmt->bind_param("i", $userId);
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

$selectedUser = $userResult->fetch_assoc();
$userStmt->close();

/*
|--------------------------------------------------------------------------
| Protect primary administrator
|--------------------------------------------------------------------------
*/

if ($selectedUser["email"] === "admin@mindbloom.com") {
    echo json_encode([
        "success" => false,
        "message" => "The primary MindBloom administrator cannot be deleted"
    ]);

    $conn->close();
    exit;
}

if ($selectedUser["role"] === "admin") {
    echo json_encode([
        "success" => false,
        "message" => "Administrator accounts cannot be deleted from this page"
    ]);

    $conn->close();
    exit;
}

/*
|--------------------------------------------------------------------------
| Delete selected user
|--------------------------------------------------------------------------
*/

$deleteStmt = $conn->prepare(
    "DELETE FROM users WHERE id = ?"
);

if (!$deleteStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare delete request"
    ]);

    exit;
}

$deleteStmt->bind_param("i", $userId);

if ($deleteStmt->execute()) {
    if (
        !empty($selectedUser["profile_image"]) &&
        file_exists(
            __DIR__ . "/../" . $selectedUser["profile_image"]
        )
    ) {
        unlink(
            __DIR__ . "/../" . $selectedUser["profile_image"]
        );
    }

    echo json_encode([
        "success" => true,
        "message" =>
            $selectedUser["fullname"] .
            " was deleted successfully"
    ]);
} else {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "User could not be deleted"
    ]);
}

$deleteStmt->close();
$conn->close();