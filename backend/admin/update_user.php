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
$fullname = trim($data["fullname"] ?? "");
$email = trim($data["email"] ?? "");
$adminEmail = trim($data["admin_email"] ?? "");

if (
    $userId <= 0 ||
    $fullname === "" ||
    $email === "" ||
    $adminEmail === ""
) {
    echo json_encode([
        "success" => false,
        "message" => "User ID, name, email and administrator email are required"
    ]);

    exit;
}

if (strlen($fullname) < 3) {
    echo json_encode([
        "success" => false,
        "message" => "Full name must contain at least 3 characters"
    ]);

    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "success" => false,
        "message" => "Please enter a valid email address"
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
        "message" => "You are not authorized to update users"
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
    "SELECT id, email, role
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
        "message" => "The primary MindBloom administrator cannot be modified"
    ]);

    $conn->close();
    exit;
}

if ($selectedUser["role"] === "admin") {
    echo json_encode([
        "success" => false,
        "message" => "Administrator accounts cannot be modified from this page"
    ]);

    $conn->close();
    exit;
}

/*
|--------------------------------------------------------------------------
| Check whether email belongs to another account
|--------------------------------------------------------------------------
*/

$emailStmt = $conn->prepare(
    "SELECT id
     FROM users
     WHERE email = ?
       AND id != ?
     LIMIT 1"
);

if (!$emailStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to validate email address"
    ]);

    exit;
}

$emailStmt->bind_param(
    "si",
    $email,
    $userId
);

$emailStmt->execute();

$emailResult = $emailStmt->get_result();

if ($emailResult->num_rows > 0) {
    echo json_encode([
        "success" => false,
        "message" => "Another account already uses this email address"
    ]);

    $emailStmt->close();
    $conn->close();
    exit;
}

$emailStmt->close();

/*
|--------------------------------------------------------------------------
| Update user
|--------------------------------------------------------------------------
*/

$updateStmt = $conn->prepare(
    "UPDATE users
     SET fullname = ?, email = ?
     WHERE id = ?"
);

if (!$updateStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare update request"
    ]);

    exit;
}

$updateStmt->bind_param(
    "ssi",
    $fullname,
    $email,
    $userId
);

if ($updateStmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "User information updated successfully",
        "user" => [
            "id" => $userId,
            "fullname" => $fullname,
            "email" => $email
        ]
    ]);
} else {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "User information could not be updated"
    ]);
}

$updateStmt->close();
$conn->close();