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

require_once __DIR__ . "/../config.php";

/*
|--------------------------------------------------------------------------
| Read Input
|--------------------------------------------------------------------------
*/

$data = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($data)) {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON data received."
    ]);
    exit;
}

$userId = isset($data["user_id"])
    ? (int) $data["user_id"]
    : 0;

$category = trim($data["category"] ?? "");

$limit = isset($data["limit"])
    ? (int) $data["limit"]
    : 50;

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

if ($limit < 1) {
    $limit = 50;
}

if ($limit > 100) {
    $limit = 100;
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
| Get Assessment History
|--------------------------------------------------------------------------
*/

if ($category !== "") {
    $stmt = $conn->prepare(
        "SELECT
            id,
            user_id,
            category,
            category_name,
            score,
            wellness_level,
            level_key,
            answers,
            ai_summary,
            recommendations,
            recommendation_source,
            created_at
        FROM assessment_history
        WHERE user_id = ?
        AND category = ?
        ORDER BY created_at DESC, id DESC
        LIMIT ?"
    );

    if (!$stmt) {
        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Could not prepare assessment history query.",
            "error" => $conn->error
        ]);
        exit;
    }

    $stmt->bind_param(
        "isi",
        $userId,
        $category,
        $limit
    );
} else {
    $stmt = $conn->prepare(
        "SELECT
            id,
            user_id,
            category,
            category_name,
            score,
            wellness_level,
            level_key,
            answers,
            ai_summary,
            recommendations,
            recommendation_source,
            created_at
        FROM assessment_history
        WHERE user_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT ?"
    );

    if (!$stmt) {
        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Could not prepare assessment history query.",
            "error" => $conn->error
        ]);
        exit;
    }

    $stmt->bind_param(
        "ii",
        $userId,
        $limit
    );
}

if (!$stmt->execute()) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Could not load assessment history.",
        "error" => $stmt->error
    ]);

    $stmt->close();
    $conn->close();
    exit;
}

$result = $stmt->get_result();

$history = [];

while ($row = $result->fetch_assoc()) {
    $answers = [];

    if (!empty($row["answers"])) {
        $decodedAnswers = json_decode(
            $row["answers"],
            true
        );

        if (is_array($decodedAnswers)) {
            $answers = $decodedAnswers;
        }
    }

    $recommendations = [];

    if (!empty($row["recommendations"])) {
        $decodedRecommendations = json_decode(
            $row["recommendations"],
            true
        );

        if (is_array($decodedRecommendations)) {
            $recommendations = $decodedRecommendations;
        }
    }

    $history[] = [
        "id" => (int) $row["id"],
        "user_id" => (int) $row["user_id"],
        "category" => $row["category"],
        "category_name" => $row["category_name"],
        "score" => (float) $row["score"],
        "wellness_level" => $row["wellness_level"],
        "level_key" => $row["level_key"],
        "answers" => $answers,
        "ai_summary" => $row["ai_summary"],
        "recommendations" => $recommendations,
        "recommendation_source" =>
            $row["recommendation_source"],
        "created_at" => $row["created_at"]
    ];
}

$stmt->close();

/*
|--------------------------------------------------------------------------
| Calculate Summary
|--------------------------------------------------------------------------
*/

$totalAssessments = count($history);

$latestAssessment = $totalAssessments > 0
    ? $history[0]
    : null;

$categoryNames = [];

foreach ($history as $assessment) {
    $categoryNames[
        $assessment["category"]
    ] = $assessment["category_name"];
}

$categories = [];

foreach ($categoryNames as $key => $name) {
    $categories[] = [
        "key" => $key,
        "name" => $name
    ];
}

/*
|--------------------------------------------------------------------------
| Success Response
|--------------------------------------------------------------------------
*/

echo json_encode([
    "success" => true,
    "message" => $totalAssessments > 0
        ? "Assessment history loaded successfully."
        : "No assessment history found.",
    "total" => $totalAssessments,
    "latest_assessment" => $latestAssessment,
    "categories" => $categories,
    "history" => $history
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

$conn->close();