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

$sql = "
    SELECT
        me.id,
        me.user_id,
        me.mood,
        me.note,
        me.created_at,
        COALESCE(u.fullname, 'Unknown User') AS user_name,
        COALESCE(u.email, 'Not Available') AS user_email,
        COALESCE(u.profile_image, '') AS profile_image
    FROM mood_entries me
    LEFT JOIN users u
        ON u.id = me.user_id
    ORDER BY me.created_at DESC
";

$result = $conn->query($sql);

if (!$result) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to load mood records"
    ]);

    $conn->close();
    exit;
}

$moods = [];

while ($row = $result->fetch_assoc()) {
    $moods[] = [
        "id" => (int) $row["id"],
        "user_id" => (int) $row["user_id"],
        "mood" => $row["mood"],
        "note" => $row["note"] ?? "",
        "created_at" => $row["created_at"],
        "user_name" => $row["user_name"],
        "user_email" => $row["user_email"],
        "profile_image" => $row["profile_image"] ?? ""
    ];
}

echo json_encode([
    "success" => true,
    "total" => count($moods),
    "moods" => $moods
]);

$conn->close();