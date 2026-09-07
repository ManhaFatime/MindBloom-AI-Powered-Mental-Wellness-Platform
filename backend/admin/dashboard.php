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
| Safely count records from an allowed table
|--------------------------------------------------------------------------
*/

function getTableCount(
    mysqli $conn,
    string $table
): int {
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
| Count normal users
|--------------------------------------------------------------------------
*/

$userStmt = $conn->prepare(
    "SELECT COUNT(*) AS total
     FROM users
     WHERE role = 'user'"
);

if (!$userStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to load dashboard statistics"
    ]);

    exit;
}

$userStmt->execute();

$userResult = $userStmt->get_result();
$userRow = $userResult->fetch_assoc();

$totalUsers = (int) ($userRow["total"] ?? 0);

$userStmt->close();

/*
|--------------------------------------------------------------------------
| Count wellness activities
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
| Count mood records separately
|--------------------------------------------------------------------------
*/

$totalMoodRecords = getTableCount(
    $conn,
    "mood_entries"
);

/*
|--------------------------------------------------------------------------
| Count today's wellness activities
|--------------------------------------------------------------------------
*/

$todayActivities = 0;

$todayQueries = [
    "SELECT COUNT(*) AS total FROM daily_challenges WHERE DATE(completed_at) = CURDATE()",
    "SELECT COUNT(*) AS total FROM gratitude_entries WHERE DATE(created_at) = CURDATE()",
    "SELECT COUNT(*) AS total FROM mindfulness_entries WHERE DATE(created_at) = CURDATE()",
    "SELECT COUNT(*) AS total FROM positive_thoughts WHERE DATE(created_at) = CURDATE()",
    "SELECT COUNT(*) AS total FROM reflection_entries WHERE DATE(created_at) = CURDATE()"
];

foreach ($todayQueries as $query) {
    $result = $conn->query($query);

    if ($result) {
        $row = $result->fetch_assoc();
        $todayActivities += (int) ($row["total"] ?? 0);
    }
}

/*
|--------------------------------------------------------------------------
| Return dashboard statistics
|--------------------------------------------------------------------------
*/

echo json_encode([
    "success" => true,
    "stats" => [
        "total_users" => $totalUsers,
        "total_activities" => $totalActivities,
        "total_mood_records" => $totalMoodRecords,
        "today_activities" => $todayActivities
    ]
]);

$conn->close();