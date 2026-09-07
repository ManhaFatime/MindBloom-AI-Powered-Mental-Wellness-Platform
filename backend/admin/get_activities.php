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
| Combined activities query
|--------------------------------------------------------------------------
|
| Different activity tables have different columns, so UNION ALL converts
| them into one common structure.
|
*/

$sql = "
    SELECT
        CONCAT('daily_challenge_', dc.id) AS unique_id,
        dc.id AS record_id,
        dc.user_id,
        'daily_challenge' AS activity_type,
        'Daily Challenge' AS activity_title,
        dc.challenge_text AS primary_text,
        COALESCE(dc.answer, '') AS secondary_text,
        dc.challenge_date AS activity_date,
        dc.completed_at AS created_at,
        COALESCE(u.fullname, 'Unknown User') AS user_name,
        COALESCE(u.email, 'Not Available') AS user_email,
        COALESCE(u.profile_image, '') AS profile_image
    FROM daily_challenges dc
    LEFT JOIN users u ON u.id = dc.user_id

    UNION ALL

    SELECT
        CONCAT('gratitude_', ge.id) AS unique_id,
        ge.id AS record_id,
        ge.user_id,
        'gratitude' AS activity_type,
        'Gratitude Journal' AS activity_title,
        CONCAT(
            '1. ', ge.entry_one,
            '\n2. ', ge.entry_two,
            '\n3. ', ge.entry_three
        ) AS primary_text,
        '' AS secondary_text,
        DATE(ge.created_at) AS activity_date,
        ge.created_at,
        COALESCE(u.fullname, 'Unknown User') AS user_name,
        COALESCE(u.email, 'Not Available') AS user_email,
        COALESCE(u.profile_image, '') AS profile_image
    FROM gratitude_entries ge
    LEFT JOIN users u ON u.id = ge.user_id

    UNION ALL

    SELECT
        CONCAT('mindfulness_', me.id) AS unique_id,
        me.id AS record_id,
        me.user_id,
        'mindfulness' AS activity_type,
        'Mindfulness Exercise' AS activity_title,
        CONCAT(
            'Seen: ', me.seen_items,
            '\nFelt: ', me.felt_items,
            '\nHeard: ', me.heard_items,
            '\nSmelled: ', me.smelled_items,
            '\nTasted: ', me.tasted_item
        ) AS primary_text,
        '' AS secondary_text,
        DATE(me.created_at) AS activity_date,
        me.created_at,
        COALESCE(u.fullname, 'Unknown User') AS user_name,
        COALESCE(u.email, 'Not Available') AS user_email,
        COALESCE(u.profile_image, '') AS profile_image
    FROM mindfulness_entries me
    LEFT JOIN users u ON u.id = me.user_id

    UNION ALL

    SELECT
        CONCAT('positive_thought_', pt.id) AS unique_id,
        pt.id AS record_id,
        pt.user_id,
        'positive_thought' AS activity_type,
        'Positive Thought Reframing' AS activity_title,
        pt.negative_thought AS primary_text,
        pt.positive_thought AS secondary_text,
        DATE(pt.created_at) AS activity_date,
        pt.created_at,
        COALESCE(u.fullname, 'Unknown User') AS user_name,
        COALESCE(u.email, 'Not Available') AS user_email,
        COALESCE(u.profile_image, '') AS profile_image
    FROM positive_thoughts pt
    LEFT JOIN users u ON u.id = pt.user_id

    UNION ALL

    SELECT
        CONCAT('reflection_', re.id) AS unique_id,
        re.id AS record_id,
        re.user_id,
        'reflection' AS activity_type,
        'Wellness Reflection' AS activity_title,
        CONCAT(
            'Mood: ', re.mood,
            '\nReflection: ', re.reflection
        ) AS primary_text,
        re.ai_response AS secondary_text,
        DATE(re.created_at) AS activity_date,
        re.created_at,
        COALESCE(u.fullname, 'Unknown User') AS user_name,
        COALESCE(u.email, 'Not Available') AS user_email,
        COALESCE(u.profile_image, '') AS profile_image
    FROM reflection_entries re
    LEFT JOIN users u ON u.id = re.user_id

    ORDER BY created_at DESC
";

$result = $conn->query($sql);

if (!$result) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to load activity records",
        "error" => $conn->error
    ]);

    $conn->close();
    exit;
}

$activities = [];

while ($row = $result->fetch_assoc()) {
    $activities[] = [
        "unique_id" => $row["unique_id"],
        "record_id" => (int) $row["record_id"],
        "user_id" => (int) $row["user_id"],
        "activity_type" => $row["activity_type"],
        "activity_title" => $row["activity_title"],
        "primary_text" => $row["primary_text"] ?? "",
        "secondary_text" => $row["secondary_text"] ?? "",
        "activity_date" => $row["activity_date"],
        "created_at" => $row["created_at"],
        "user_name" => $row["user_name"],
        "user_email" => $row["user_email"],
        "profile_image" => $row["profile_image"] ?? ""
    ];
}

echo json_encode([
    "success" => true,
    "total" => count($activities),
    "activities" => $activities
]);

$conn->close();