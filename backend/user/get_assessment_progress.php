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
| Read JSON Input
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
    : 20;

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

if ($limit < 2) {
    $limit = 20;
}

if ($limit > 100) {
    $limit = 100;
}

/*
|--------------------------------------------------------------------------
| Load Assessment Records
|--------------------------------------------------------------------------
*/

if ($category !== "") {
    $stmt = $conn->prepare(
        "SELECT
            id,
            category,
            category_name,
            score,
            wellness_level,
            created_at
        FROM assessment_history
        WHERE user_id = ?
        AND category = ?
        ORDER BY created_at ASC, id ASC
        LIMIT ?"
    );

    if (!$stmt) {
        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Could not prepare progress query.",
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
            category,
            category_name,
            score,
            wellness_level,
            created_at
        FROM assessment_history
        WHERE user_id = ?
        ORDER BY created_at ASC, id ASC
        LIMIT ?"
    );

    if (!$stmt) {
        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Could not prepare progress query.",
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
        "message" => "Could not load assessment progress.",
        "error" => $stmt->error
    ]);

    $stmt->close();
    $conn->close();
    exit;
}

$result = $stmt->get_result();

$records = [];

while ($row = $result->fetch_assoc()) {
    $records[] = [
        "id" => (int) $row["id"],
        "category" => $row["category"],
        "category_name" => $row["category_name"],
        "score" => (float) $row["score"],
        "wellness_level" => $row["wellness_level"],
        "created_at" => $row["created_at"],
        "date_label" => date(
            "d M",
            strtotime($row["created_at"])
        )
    ];
}

$stmt->close();

/*
|--------------------------------------------------------------------------
| Group Records by Category
|--------------------------------------------------------------------------
*/

$grouped = [];

foreach ($records as $record) {
    $key = $record["category"];

    if (!isset($grouped[$key])) {
        $grouped[$key] = [
            "category" => $key,
            "category_name" => $record["category_name"],
            "records" => []
        ];
    }

    $grouped[$key]["records"][] = $record;
}

/*
|--------------------------------------------------------------------------
| Calculate Category Progress
|--------------------------------------------------------------------------
*/

$categoryProgress = [];

foreach ($grouped as $group) {
    $categoryRecords = $group["records"];
    $recordCount = count($categoryRecords);

    $firstScore = $recordCount > 0
        ? $categoryRecords[0]["score"]
        : 0;

    $latestScore = $recordCount > 0
        ? $categoryRecords[$recordCount - 1]["score"]
        : 0;

    $previousScore = $recordCount > 1
        ? $categoryRecords[$recordCount - 2]["score"]
        : null;

    $overallChange = round(
        $latestScore - $firstScore,
        2
    );

    $latestChange = $previousScore !== null
        ? round($latestScore - $previousScore, 2)
        : 0;

    if ($overallChange > 0) {
        $trend = "improved";
    } elseif ($overallChange < 0) {
        $trend = "declined";
    } else {
        $trend = "stable";
    }

    $categoryProgress[] = [
        "category" => $group["category"],
        "category_name" => $group["category_name"],
        "total_assessments" => $recordCount,
        "first_score" => $firstScore,
        "previous_score" => $previousScore,
        "latest_score" => $latestScore,
        "overall_change" => $overallChange,
        "latest_change" => $latestChange,
        "trend" => $trend,
        "records" => $categoryRecords
    ];
}

/*
|--------------------------------------------------------------------------
| Find Latest Assessment Overall
|--------------------------------------------------------------------------
*/

$latestAssessment = null;

if (count($records) > 0) {
    $latestAssessment = $records[count($records) - 1];
}

/*
|--------------------------------------------------------------------------
| Create Progress Message
|--------------------------------------------------------------------------
*/

$progressMessage = "Complete more assessments to see your wellness progress.";

if ($category !== "" && count($categoryProgress) > 0) {
    $progress = $categoryProgress[0];
    $change = $progress["overall_change"];

    if ($progress["total_assessments"] === 1) {
        $progressMessage =
            "This is your first " .
            $progress["category_name"] .
            " assessment.";
    } elseif ($change > 0) {
        $progressMessage =
            "Your " .
            strtolower($progress["category_name"]) .
            " wellness score improved by " .
            abs($change) .
            " points.";
    } elseif ($change < 0) {
        $progressMessage =
            "Your " .
            strtolower($progress["category_name"]) .
            " wellness score changed by " .
            abs($change) .
            " points. Consider focusing on the recommended activities.";
    } else {
        $progressMessage =
            "Your " .
            strtolower($progress["category_name"]) .
            " wellness score is currently stable.";
    }
}

/*
|--------------------------------------------------------------------------
| Success Response
|--------------------------------------------------------------------------
*/

echo json_encode([
    "success" => true,
    "message" => count($records) > 0
        ? "Assessment progress loaded successfully."
        : "No assessment progress found.",
    "progress_message" => $progressMessage,
    "latest_assessment" => $latestAssessment,
    "total_records" => count($records),
    "categories" => $categoryProgress,
    "chart_data" => $records
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

$conn->close();