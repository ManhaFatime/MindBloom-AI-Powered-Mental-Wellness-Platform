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

if ($userId <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Valid user ID is required"
    ]);

    exit;
}

$userStmt = $conn->prepare(
    "SELECT
        id,
        fullname,
        email,
        role,
        profile_image,
        created_at
     FROM users
     WHERE id = ?
       AND role = 'user'
     LIMIT 1"
);

if (!$userStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare user request"
    ]);

    exit;
}

$userStmt->bind_param("i", $userId);
$userStmt->execute();

$userResult = $userStmt->get_result();

if ($userResult->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "User account was not found"
    ]);

    $userStmt->close();
    $conn->close();
    exit;
}

$user = $userResult->fetch_assoc();
$userStmt->close();

function countUserRecords(
    mysqli $conn,
    string $table,
    int $userId
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

    $stmt = $conn->prepare(
        "SELECT COUNT(*) AS total
         FROM `$table`
         WHERE user_id = ?"
    );

    if (!$stmt) {
        return 0;
    }

    $stmt->bind_param("i", $userId);
    $stmt->execute();

    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    $stmt->close();

    return (int) ($row["total"] ?? 0);
}

$dailyChallenges = countUserRecords(
    $conn,
    "daily_challenges",
    $userId
);

$gratitudeEntries = countUserRecords(
    $conn,
    "gratitude_entries",
    $userId
);

$mindfulnessEntries = countUserRecords(
    $conn,
    "mindfulness_entries",
    $userId
);

$moodEntries = countUserRecords(
    $conn,
    "mood_entries",
    $userId
);

$positiveThoughts = countUserRecords(
    $conn,
    "positive_thoughts",
    $userId
);

$reflectionEntries = countUserRecords(
    $conn,
    "reflection_entries",
    $userId
);

$totalActivities =
    $dailyChallenges +
    $gratitudeEntries +
    $mindfulnessEntries +
    $positiveThoughts +
    $reflectionEntries;

$latestMood = null;

$moodStmt = $conn->prepare(
    "SELECT
        mood,
        note,
        created_at
     FROM mood_entries
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 1"
);

if ($moodStmt) {
    $moodStmt->bind_param("i", $userId);
    $moodStmt->execute();

    $moodResult = $moodStmt->get_result();

    if ($moodResult->num_rows > 0) {
        $moodRow = $moodResult->fetch_assoc();

        $latestMood = [
            "mood" => $moodRow["mood"],
            "note" => $moodRow["note"] ?? "",
            "created_at" => $moodRow["created_at"]
        ];
    }

    $moodStmt->close();
}

$recentActivities = [];

$recentSql = "
    SELECT *
    FROM (
        SELECT
            'Daily Challenge' AS title,
            challenge_text AS details,
            completed_at AS created_at
        FROM daily_challenges
        WHERE user_id = ?

        UNION ALL

        SELECT
            'Gratitude Journal' AS title,
            entry_one AS details,
            created_at
        FROM gratitude_entries
        WHERE user_id = ?

        UNION ALL

        SELECT
            'Mindfulness Exercise' AS title,
            seen_items AS details,
            created_at
        FROM mindfulness_entries
        WHERE user_id = ?

        UNION ALL

        SELECT
            'Positive Thought' AS title,
            positive_thought AS details,
            created_at
        FROM positive_thoughts
        WHERE user_id = ?

        UNION ALL

        SELECT
            'Wellness Reflection' AS title,
            reflection AS details,
            created_at
        FROM reflection_entries
        WHERE user_id = ?
    ) AS recent_records

    ORDER BY created_at DESC
    LIMIT 5
";

$recentStmt = $conn->prepare($recentSql);

if ($recentStmt) {
    $recentStmt->bind_param(
        "iiiii",
        $userId,
        $userId,
        $userId,
        $userId,
        $userId
    );

    $recentStmt->execute();

    $recentResult = $recentStmt->get_result();

    while ($row = $recentResult->fetch_assoc()) {
        $recentActivities[] = [
            "title" => $row["title"],
            "details" => $row["details"] ?? "",
            "created_at" => $row["created_at"]
        ];
    }

    $recentStmt->close();
}

echo json_encode([
    "success" => true,
    "user" => [
        "id" => (int) $user["id"],
        "fullname" => $user["fullname"],
        "email" => $user["email"],
        "profile_image" => $user["profile_image"] ?? "",
        "created_at" => $user["created_at"]
    ],
    "stats" => [
        "total_activities" => $totalActivities,
        "daily_challenges" => $dailyChallenges,
        "gratitude_entries" => $gratitudeEntries,
        "mindfulness_entries" => $mindfulnessEntries,
        "mood_entries" => $moodEntries,
        "positive_thoughts" => $positiveThoughts,
        "reflection_entries" => $reflectionEntries
    ],
    "latest_mood" => $latestMood,
    "recent_activities" => $recentActivities
]);

$conn->close();