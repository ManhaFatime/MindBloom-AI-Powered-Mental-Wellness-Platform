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

require_once "../config.php";

$stmt = $conn->prepare(
    "SELECT
        id,
        fullname,
        email,
        role,
        profile_image,
        created_at
     FROM users
     ORDER BY id DESC"
);

if (!$stmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare users request"
    ]);

    exit;
}

$stmt->execute();

$result = $stmt->get_result();

$users = [];

while ($row = $result->fetch_assoc()) {
    $users[] = [
        "id" => (int) $row["id"],
        "fullname" => $row["fullname"],
        "email" => $row["email"],
        "role" => $row["role"],
        "profile_image" => $row["profile_image"] ?? "",
        "created_at" => $row["created_at"]
    ];
}

echo json_encode([
    "success" => true,
    "users" => $users
]);

$stmt->close();
$conn->close();