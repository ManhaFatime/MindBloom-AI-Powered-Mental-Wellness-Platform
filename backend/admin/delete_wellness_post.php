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

$postId = (int) (
    $data["post_id"] ?? 0
);

$adminId = (int) (
    $data["admin_id"] ?? 0
);

if (
    $postId <= 0 ||
    $adminId <= 0
) {
    echo json_encode([
        "success" => false,
        "message" => "Post ID and administrator ID are required"
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Verify administrator
|--------------------------------------------------------------------------
*/

$adminStmt = $conn->prepare(
    "SELECT id
     FROM users
     WHERE id = ?
       AND role = 'admin'
     LIMIT 1"
);

if (!$adminStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to verify administrator"
    ]);

    $conn->close();
    exit;
}

$adminStmt->bind_param(
    "i",
    $adminId
);

$adminStmt->execute();

$adminResult =
    $adminStmt->get_result();

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
| Load post
|--------------------------------------------------------------------------
*/

$postStmt = $conn->prepare(
    "SELECT
        id,
        title,
        image
     FROM wellness_hub_posts
     WHERE id = ?
     LIMIT 1"
);

if (!$postStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to verify Wellness Hub post"
    ]);

    $conn->close();
    exit;
}

$postStmt->bind_param(
    "i",
    $postId
);

$postStmt->execute();

$postResult =
    $postStmt->get_result();

if ($postResult->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Wellness Hub post was not found"
    ]);

    $postStmt->close();
    $conn->close();

    exit;
}

$post =
    $postResult->fetch_assoc();

$postStmt->close();

/*
|--------------------------------------------------------------------------
| Delete database record
|--------------------------------------------------------------------------
*/

$deleteStmt = $conn->prepare(
    "DELETE FROM wellness_hub_posts
     WHERE id = ?"
);

if (!$deleteStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare post deletion"
    ]);

    $conn->close();
    exit;
}

$deleteStmt->bind_param(
    "i",
    $postId
);

if (!$deleteStmt->execute()) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Wellness Hub post could not be deleted"
    ]);

    $deleteStmt->close();
    $conn->close();

    exit;
}

$deleteStmt->close();

/*
|--------------------------------------------------------------------------
| Delete image file
|--------------------------------------------------------------------------
*/

$imagePath =
    $post["image"] ?? "";

if ($imagePath !== "") {
    $imageFile =
        __DIR__ .
        "/../" .
        $imagePath;

    if (file_exists($imageFile)) {
        unlink($imageFile);
    }
}

$conn->close();

echo json_encode([
    "success" => true,
    "message" => "Wellness Hub post deleted successfully",
    "deleted_post" => [
        "id" => $postId,
        "title" => $post["title"]
    ]
]);