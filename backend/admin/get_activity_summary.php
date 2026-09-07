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

/*
|--------------------------------------------------------------------------
| Safely count records from an existing table
|--------------------------------------------------------------------------
*/

function getTableCount(mysqli $conn, string $table): int
{
    $allowedTables = [
        "daily_challenges",
        "gratitude_entries",
        "mindfulness_entries",
        "mood_entries",
        "positive_thoughts",
        "reflection_entries"
    ];

    if (!in_array($table, $allowedTables, true)) {
        return 0;
    }

    $tableCheck = $conn->query(
        "SHOW TABLES LIKE '$table'"
    );

    if (
        !$tableCheck ||
        $tableCheck->num_rows === 0
    ) {
        return 0;
    }

    $result = $conn->query(
        "SELECT COUNT(*) AS total FROM `$table`"
    );

    if (!$result) {
        return 0;
    }

    $row = $result->fetch_assoc();

    return (int) ($row["total"] ?? 0);
}

/*
|--------------------------------------------------------------------------
| Count every activity category
|--------------------------------------------------------------------------
*/

$dailyChallenges = getTableCount(
    $conn,
    "daily_challenges"
);

$gratitudeEntries = getTableCount(
    $conn,
    "gratitude_entries"
);

$mindfulnessEntries = getTableCount(
    $conn,
    "mindfulness_entries"
);

$moodEntries = getTableCount(
    $conn,
    "mood_entries"
);

$positiveThoughts = getTableCount(
    $conn,
    "positive_thoughts"
);

$reflectionEntries = getTableCount(
    $conn,
    "reflection_entries"
);

$totalActivities =
    $dailyChallenges +
    $gratitudeEntries +
    $mindfulnessEntries +
    $positiveThoughts +
    $reflectionEntries;

/*
|--------------------------------------------------------------------------
| Return summary
|--------------------------------------------------------------------------
*/

echo json_encode([
    "success" => true,
    "summary" => [
        "total_activities" => $totalActivities,
        "daily_challenges" => $dailyChallenges,
        "gratitude_entries" => $gratitudeEntries,
        "mindfulness_entries" => $mindfulnessEntries,
        "mood_entries" => $moodEntries,
        "positive_thoughts" => $positiveThoughts,
        "reflection_entries" => $reflectionEntries
    ]
]);

$conn->close();