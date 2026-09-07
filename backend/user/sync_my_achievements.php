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

date_default_timezone_set("Asia/Karachi");

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

$userId = (int) ($data["user_id"] ?? 0);

$userEmail = strtolower(
    trim($data["email"] ?? "")
);

if ($userId <= 0 || $userEmail === "") {
    echo json_encode([
        "success" => false,
        "message" => "User ID and email are required"
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Verify user
|--------------------------------------------------------------------------
*/

$userStmt = $conn->prepare(
    "SELECT id, fullname, email
     FROM users
     WHERE id = ?
       AND email = ?
       AND role = 'user'
     LIMIT 1"
);

if (!$userStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to verify user"
    ]);

    $conn->close();
    exit;
}

$userStmt->bind_param(
    "is",
    $userId,
    $userEmail
);

$userStmt->execute();

$userResult = $userStmt->get_result();

if ($userResult->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "User account could not be verified"
    ]);

    $userStmt->close();
    $conn->close();

    exit;
}

$user = $userResult->fetch_assoc();

$userStmt->close();

/*
|--------------------------------------------------------------------------
| Helper: safely count records in one table
|--------------------------------------------------------------------------
*/

function getTableCount(
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

    $stmt = $conn->prepare(
        "SELECT COUNT(*) AS total
         FROM {$table}
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

/*
|--------------------------------------------------------------------------
| Helper: calculate longest consecutive active-day streak
|--------------------------------------------------------------------------
*/

function calculateLongestStreak(
    array $dates
): int {
    if (count($dates) === 0) {
        return 0;
    }

    $timestamps = [];

    foreach ($dates as $date) {
        $timestamp = strtotime($date);

        if ($timestamp !== false) {
            $timestamps[] = strtotime(
                date("Y-m-d", $timestamp)
            );
        }
    }

    $timestamps = array_values(
        array_unique($timestamps)
    );

    sort($timestamps);

    if (count($timestamps) === 0) {
        return 0;
    }

    $longest = 1;
    $current = 1;

    for (
        $index = 1;
        $index < count($timestamps);
        $index++
    ) {
        $difference =
            ($timestamps[$index] -
             $timestamps[$index - 1])
            / 86400;

        if ((int) $difference === 1) {
            $current++;
            $longest = max(
                $longest,
                $current
            );
        } else {
            $current = 1;
        }
    }

    return $longest;
}

/*
|--------------------------------------------------------------------------
| Helper: generate unique certificate number
|--------------------------------------------------------------------------
*/

function generateCertificateNumber(
    int $userId
): string {
    return
        "MB-" .
        date("Y") .
        "-" .
        str_pad(
            (string) $userId,
            5,
            "0",
            STR_PAD_LEFT
        ) .
        "-" .
        strtoupper(
            substr(
                bin2hex(
                    random_bytes(5)
                ),
                0,
                10
            )
        );
}

/*
|--------------------------------------------------------------------------
| Helper: create earned achievement once
|--------------------------------------------------------------------------
*/

function createAchievementIfEarned(
    mysqli $conn,
    int $userId,
    string $key,
    string $title,
    string $description,
    bool $condition
): array {
    if (!$condition) {
        return [
            "key" => $key,
            "earned" => false,
            "created" => false
        ];
    }

    $checkStmt = $conn->prepare(
        "SELECT
            id,
            certificate_number,
            earned_date
         FROM achievements
         WHERE user_id = ?
           AND achievement_key = ?
         LIMIT 1"
    );

    if (!$checkStmt) {
        throw new Exception(
            "Unable to check achievement: {$key}"
        );
    }

    $checkStmt->bind_param(
        "is",
        $userId,
        $key
    );

    $checkStmt->execute();

    $checkResult =
        $checkStmt->get_result();

    if ($checkResult->num_rows > 0) {
        $existing =
            $checkResult->fetch_assoc();

        $checkStmt->close();

        return [
            "key" => $key,
            "earned" => true,
            "created" => false,
            "achievement_id" =>
                (int) $existing["id"],
            "certificate_number" =>
                $existing["certificate_number"],
            "earned_date" =>
                $existing["earned_date"]
        ];
    }

    $checkStmt->close();

    $certificateNumber =
        generateCertificateNumber(
            $userId
        );

    $earnedDate = date("Y-m-d");

    $insertStmt = $conn->prepare(
        "INSERT INTO achievements
            (
                user_id,
                achievement_key,
                achievement_title,
                achievement_description,
                certificate_number,
                earned_date,
                status
            )
         VALUES
            (?, ?, ?, ?, ?, ?, 'earned')"
    );

    if (!$insertStmt) {
        throw new Exception(
            "Unable to prepare achievement: {$key}"
        );
    }

    $insertStmt->bind_param(
        "isssss",
        $userId,
        $key,
        $title,
        $description,
        $certificateNumber,
        $earnedDate
    );

    if (!$insertStmt->execute()) {
        $insertStmt->close();

        throw new Exception(
            "Unable to create achievement: {$key}"
        );
    }

    $achievementId =
        $insertStmt->insert_id;

    $insertStmt->close();

    return [
        "key" => $key,
        "earned" => true,
        "created" => true,
        "achievement_id" =>
            $achievementId,
        "certificate_number" =>
            $certificateNumber,
        "earned_date" =>
            $earnedDate
    ];
}

/*
|--------------------------------------------------------------------------
| Count records from all wellness tables
|--------------------------------------------------------------------------
*/

$dailyChallengeCount = getTableCount(
    $conn,
    "daily_challenges",
    $userId
);

$gratitudeCount = getTableCount(
    $conn,
    "gratitude_entries",
    $userId
);

$mindfulnessCount = getTableCount(
    $conn,
    "mindfulness_entries",
    $userId
);

$moodCount = getTableCount(
    $conn,
    "mood_entries",
    $userId
);

$positiveThoughtCount = getTableCount(
    $conn,
    "positive_thoughts",
    $userId
);

$reflectionCount = getTableCount(
    $conn,
    "reflection_entries",
    $userId
);

$totalActivities =
    $dailyChallengeCount +
    $gratitudeCount +
    $mindfulnessCount +
    $moodCount +
    $positiveThoughtCount +
    $reflectionCount;

/*
|--------------------------------------------------------------------------
| Load all distinct active dates
|--------------------------------------------------------------------------
*/

$datesStmt = $conn->prepare(
    "SELECT activity_date
     FROM (
        SELECT challenge_date AS activity_date
        FROM daily_challenges
        WHERE user_id = ?

        UNION

        SELECT DATE(created_at) AS activity_date
        FROM gratitude_entries
        WHERE user_id = ?

        UNION

        SELECT DATE(created_at) AS activity_date
        FROM mindfulness_entries
        WHERE user_id = ?

        UNION

        SELECT DATE(created_at) AS activity_date
        FROM mood_entries
        WHERE user_id = ?

        UNION

        SELECT DATE(created_at) AS activity_date
        FROM positive_thoughts
        WHERE user_id = ?

        UNION

        SELECT DATE(created_at) AS activity_date
        FROM reflection_entries
        WHERE user_id = ?
     ) AS active_dates
     WHERE activity_date IS NOT NULL
     ORDER BY activity_date ASC"
);

if (!$datesStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "Unable to prepare activity dates"
    ]);

    $conn->close();
    exit;
}

$datesStmt->bind_param(
    "iiiiii",
    $userId,
    $userId,
    $userId,
    $userId,
    $userId,
    $userId
);

$datesStmt->execute();

$datesResult =
    $datesStmt->get_result();

$activeDates = [];

while (
    $dateRow =
        $datesResult->fetch_assoc()
) {
    $activeDates[] =
        $dateRow["activity_date"];
}

$datesStmt->close();

$totalActiveDays =
    count($activeDates);

$longestStreak =
    calculateLongestStreak(
        $activeDates
    );

/*
|--------------------------------------------------------------------------
| Achievement conditions
|--------------------------------------------------------------------------
|
| Journey Starter:
| User owns a verified MindBloom account.
|
| 7-Day Streak:
| Activity recorded on 7 consecutive dates.
|
| 30-Day Consistency:
| Activity recorded on at least 30 different dates.
|
| Self-Care Champion:
| At least 50 total records across all six wellness tables.
|
| Mindfulness Explorer:
| At least 5 mindfulness exercises saved.
|
| Wellness Legend:
| Activity recorded on 90 consecutive dates.
|--------------------------------------------------------------------------
*/

try {
    $conn->begin_transaction();

    $results = [];

    $results[] =
        createAchievementIfEarned(
            $conn,
            $userId,
            "mindbloom_journey_started",
            "MindBloom Wellness Journey",
            "Awarded for beginning a personal wellness journey with MindBloom.",
            true
        );

    $results[] =
        createAchievementIfEarned(
            $conn,
            $userId,
            "seven_day_streak",
            "7-Day Wellness Streak",
            "Awarded for completing MindBloom wellness activities on seven consecutive days.",
            $longestStreak >= 7
        );

    $results[] =
        createAchievementIfEarned(
            $conn,
            $userId,
            "thirty_day_consistency",
            "30-Day Consistency",
            "Awarded for staying engaged with MindBloom on thirty different days.",
            $totalActiveDays >= 30
        );

    $results[] =
        createAchievementIfEarned(
            $conn,
            $userId,
            "self_care_champion",
            "Self-Care Champion",
            "Awarded for completing fifty personal wellness activities with MindBloom.",
            $totalActivities >= 50
        );

    $results[] =
        createAchievementIfEarned(
            $conn,
            $userId,
            "mindfulness_explorer",
            "Mindfulness Explorer",
            "Awarded for completing five mindfulness grounding exercises.",
            $mindfulnessCount >= 5
        );

    $results[] =
        createAchievementIfEarned(
            $conn,
            $userId,
            "wellness_legend",
            "Wellness Legend",
            "Awarded for maintaining an exceptional ninety-day consecutive wellness streak.",
            $longestStreak >= 90
        );

    $conn->commit();
} catch (Throwable $error) {
    $conn->rollback();

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "Achievements could not be synchronized",
        "error" =>
            $error->getMessage()
    ]);

    $conn->close();
    exit;
}

$newAchievements = array_values(
    array_filter(
        $results,
        fn ($result) =>
            ($result["created"] ?? false)
            === true
    )
);

$conn->close();

echo json_encode([
    "success" => true,
    "message" =>
        count($newAchievements) > 0
            ? "New achievements unlocked successfully"
            : "Achievements are already up to date",
    "recipient_name" =>
        $user["fullname"],
    "stats" => [
        "daily_challenges" =>
            $dailyChallengeCount,
        "gratitude_entries" =>
            $gratitudeCount,
        "mindfulness_entries" =>
            $mindfulnessCount,
        "mood_entries" =>
            $moodCount,
        "positive_thoughts" =>
            $positiveThoughtCount,
        "reflection_entries" =>
            $reflectionCount,
        "total_activities" =>
            $totalActivities,
        "total_active_days" =>
            $totalActiveDays,
        "longest_streak" =>
            $longestStreak
    ],
    "progress" => [
        "seven_day_streak" => [
            "current" =>
                min($longestStreak, 7),
            "required" => 7,
            "earned" =>
                $longestStreak >= 7
        ],
        "thirty_day_consistency" => [
            "current" =>
                min($totalActiveDays, 30),
            "required" => 30,
            "earned" =>
                $totalActiveDays >= 30
        ],
        "self_care_champion" => [
            "current" =>
                min($totalActivities, 50),
            "required" => 50,
            "earned" =>
                $totalActivities >= 50
        ],
        "mindfulness_explorer" => [
            "current" =>
                min($mindfulnessCount, 5),
            "required" => 5,
            "earned" =>
                $mindfulnessCount >= 5
        ],
        "wellness_legend" => [
            "current" =>
                min($longestStreak, 90),
            "required" => 90,
            "earned" =>
                $longestStreak >= 90
        ]
    ],
    "new_achievements" =>
        $newAchievements,
    "all_results" =>
        $results
]);