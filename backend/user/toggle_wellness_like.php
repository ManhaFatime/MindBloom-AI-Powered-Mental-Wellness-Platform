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

if ($userId <= 0 || $postId <= 0) {
    echo json_encode(["success"=>false,"message"=>"Login is required to like this article"]);
    exit;
}

$userStmt = $conn->prepare("SELECT id FROM users WHERE id = ? AND role = 'user' LIMIT 1");
$userStmt->bind_param("i", $userId);
$userStmt->execute();

if ($userStmt->get_result()->num_rows === 0) {
    echo json_encode(["success"=>false,"message"=>"User account was not verified"]);
    $userStmt->close();
    $conn->close();
    exit;
}
$userStmt->close();

$checkStmt = $conn->prepare("SELECT id FROM wellness_post_likes WHERE user_id = ? AND post_id = ? LIMIT 1");
$checkStmt->bind_param("ii", $userId, $postId);
$checkStmt->execute();
$exists = $checkStmt->get_result()->num_rows > 0;
$checkStmt->close();

if ($exists) {
    $stmt = $conn->prepare("DELETE FROM wellness_post_likes WHERE user_id = ? AND post_id = ?");
    $stmt->bind_param("ii", $userId, $postId);
    $stmt->execute();
    $stmt->close();
    $liked = false;
    $message = "Article removed from likes";
} else {
    $stmt = $conn->prepare("INSERT INTO wellness_post_likes (user_id, post_id) VALUES (?, ?)");
    $stmt->bind_param("ii", $userId, $postId);
    $stmt->execute();
    $stmt->close();
    $liked = true;
    $message = "Article liked successfully";
}

$countStmt = $conn->prepare("SELECT COUNT(*) AS total FROM wellness_post_likes WHERE post_id = ?");
$countStmt->bind_param("i", $postId);
$countStmt->execute();
$countRow = $countStmt->get_result()->fetch_assoc();
$likeCount = (int)($countRow["total"] ?? 0);
$countStmt->close();
$conn->close();

echo json_encode([
    "success"=>true,
    "message"=>$message,
    "liked"=>$liked,
    "like_count"=>$likeCount
]);
