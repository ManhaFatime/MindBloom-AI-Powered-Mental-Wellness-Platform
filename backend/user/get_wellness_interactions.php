<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { http_response_code(200); exit; }
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success"=>false,"message"=>"Only POST requests are allowed"]);
    exit;
}

require_once __DIR__ . "/../config.php";

$data = json_decode(file_get_contents("php://input"), true);
$userId = (int)($data["user_id"] ?? 0);
$postId = (int)($data["post_id"] ?? 0);

if ($postId <= 0) {
    echo json_encode(["success"=>false,"message"=>"Invalid Wellness Hub post"]);
    exit;
}

$countStmt = $conn->prepare("SELECT COUNT(*) AS total FROM wellness_post_likes WHERE post_id = ?");
$countStmt->bind_param("i", $postId);
$countStmt->execute();
$countRow = $countStmt->get_result()->fetch_assoc();
$likeCount = (int)($countRow["total"] ?? 0);
$countStmt->close();

$liked = false;
$bookmarked = false;

if ($userId > 0) {
    $likeStmt = $conn->prepare("SELECT id FROM wellness_post_likes WHERE user_id = ? AND post_id = ? LIMIT 1");
    $likeStmt->bind_param("ii", $userId, $postId);
    $likeStmt->execute();
    $liked = $likeStmt->get_result()->num_rows > 0;
    $likeStmt->close();

    $bookmarkStmt = $conn->prepare("SELECT id FROM wellness_post_bookmarks WHERE user_id = ? AND post_id = ? LIMIT 1");
    $bookmarkStmt->bind_param("ii", $userId, $postId);
    $bookmarkStmt->execute();
    $bookmarked = $bookmarkStmt->get_result()->num_rows > 0;
    $bookmarkStmt->close();
}

$conn->close();

echo json_encode([
    "success"=>true,
    "liked"=>$liked,
    "bookmarked"=>$bookmarked,
    "like_count"=>$likeCount
]);
