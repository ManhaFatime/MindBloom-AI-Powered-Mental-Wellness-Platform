<?php

error_reporting(E_ALL);
ini_set("display_errors", 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Only POST requests are allowed."
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| Database Connection
|--------------------------------------------------------------------------
*/

require_once __DIR__ . "/../config.php";

/*
|--------------------------------------------------------------------------
| Read JSON Data
|--------------------------------------------------------------------------
*/

$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

if (!is_array($data)) {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON data received."
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| Receive Values
|--------------------------------------------------------------------------
*/

$userId = isset($data["user_id"])
    ? (int) $data["user_id"]
    : 0;

$category = trim($data["category"] ?? "");

$categoryName = trim(
    $data["category_name"] ?? ""
);

$score = isset($data["score"])
    ? (float) $data["score"]
    : -1;

$wellnessLevel = trim(
    $data["wellness_level"] ??
    $data["level_title"] ??
    ""
);

$levelKey = trim(
    $data["level_key"] ??
    $data["level"] ??
    ""
);

$answers = $data["answers"] ?? [];

$aiSummary = trim(
    $data["ai_summary"] ??
    $data["summary"] ??
    ""
);

$recommendations = $data["recommendations"] ?? [];

$recommendationSource = strtolower(
    trim($data["recommendation_source"] ?? "fallback")
);

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

if ($userId <= 0) {
    http_response_code(422);

    echo json_encode([
        "success" => false,
        "message" => "Valid user ID is required."
    ]);
    exit;
}

if ($category === "") {
    http_response_code(422);

    echo json_encode([
        "success" => false,
        "message" => "Assessment category is required."
    ]);
    exit;
}

if ($categoryName === "") {
    http_response_code(422);

    echo json_encode([
        "success" => false,
        "message" => "Assessment category name is required."
    ]);
    exit;
}

if ($score < 0 || $score > 100) {
    http_response_code(422);

    echo json_encode([
        "success" => false,
        "message" => "Assessment score must be between 0 and 100."
    ]);
    exit;
}

if ($wellnessLevel === "") {
    http_response_code(422);

    echo json_encode([
        "success" => false,
        "message" => "Wellness level is required."
    ]);
    exit;
}

if (!is_array($answers)) {
    http_response_code(422);

    echo json_encode([
        "success" => false,
        "message" => "Assessment answers must be an array."
    ]);
    exit;
}

if (!is_array($recommendations)) {
    http_response_code(422);

    echo json_encode([
        "success" => false,
        "message" => "Recommendations must be an array."
    ]);
    exit;
}

if (
    $recommendationSource !== "ai" &&
    $recommendationSource !== "fallback"
) {
    $recommendationSource = "fallback";
}

/*
|--------------------------------------------------------------------------
| Check User Exists
|--------------------------------------------------------------------------
*/

$userCheck = $conn->prepare(
    "SELECT id
     FROM users
     WHERE id = ?
     LIMIT 1"
);

if (!$userCheck) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Could not prepare user validation query.",
        "error" => $conn->error
    ]);
    exit;
}

$userCheck->bind_param("i", $userId);
$userCheck->execute();

$userResult = $userCheck->get_result();

if ($userResult->num_rows === 0) {
    $userCheck->close();

    http_response_code(404);

    echo json_encode([
        "success" => false,
        "message" => "User was not found."
    ]);
    exit;
}

$userCheck->close();

/*
|--------------------------------------------------------------------------
| Convert Arrays to JSON
|--------------------------------------------------------------------------
*/

$answersJson = json_encode(
    $answers,
    JSON_UNESCAPED_UNICODE |
    JSON_UNESCAPED_SLASHES
);

$recommendationsJson = json_encode(
    $recommendations,
    JSON_UNESCAPED_UNICODE |
    JSON_UNESCAPED_SLASHES
);

if ($answersJson === false) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Could not process assessment answers."
    ]);
    exit;
}

if ($recommendationsJson === false) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Could not process recommendations."
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| Save Assessment
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare(
    "INSERT INTO assessment_history (
        user_id,
        category,
        category_name,
        score,
        wellness_level,
        level_key,
        answers,
        ai_summary,
        recommendations,
        recommendation_source
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
);

if (!$stmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Could not prepare assessment save query.",
        "error" => $conn->error
    ]);
    exit;
}

$stmt->bind_param(
    "issdssssss",
    $userId,
    $category,
    $categoryName,
    $score,
    $wellnessLevel,
    $levelKey,
    $answersJson,
    $aiSummary,
    $recommendationsJson,
    $recommendationSource
);

if (!$stmt->execute()) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Assessment result could not be saved.",
        "error" => $stmt->error
    ]);

    $stmt->close();
    $conn->close();
    exit;
}

$assessmentId = $stmt->insert_id;

$stmt->close();
$conn->close();

/*
|--------------------------------------------------------------------------
| Success Response
|--------------------------------------------------------------------------
*/

echo json_encode([
    "success" => true,
    "message" => "Assessment result saved successfully.",
    "assessment_id" => $assessmentId
]);