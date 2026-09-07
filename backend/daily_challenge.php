<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

require_once "config.php";

$data = json_decode(file_get_contents("php://input"), true);

$userId = intval($data["user_id"] ?? 0);
$action = trim($data["action"] ?? "get");
$answer = trim($data["answer"] ?? "");

if ($userId <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid user."
    ]);
    exit();
}

$challenges = [
    "Take a 10-minute walk without using your phone.",
    "Drink a full glass of water slowly and mindfully.",
    "Write one kind sentence about yourself.",
    "Send a thoughtful message to someone you appreciate.",
    "Spend 5 minutes sitting quietly and noticing your breath.",
    "Organize one small area around you.",
    "Do one activity today without rushing.",
    "Step outside and notice three things in nature.",
    "Take a short break from social media.",
    "Compliment someone sincerely today.",
    "Stretch your body gently for 5 minutes.",
    "Write down one thing you handled well today.",
    "Listen to a calming song with full attention.",
    "Do one small helpful thing for another person."
];

$today = date("Y-m-d");

$challengeIndex = intval(date("z")) % count($challenges);
$todayChallenge = $challenges[$challengeIndex];

/*
|--------------------------------------------------------------------------
| COMPLETE CHALLENGE
|--------------------------------------------------------------------------
*/

if ($action === "complete") {
    if ($answer === "") {
        echo json_encode([
            "success" => false,
            "message" => "Please write your answer before completing the challenge."
        ]);
        exit();
    }

    $stmt = $conn->prepare(
        "INSERT INTO daily_challenges
        (user_id, challenge_text, answer, challenge_date)
        VALUES (?, ?, ?, ?)"
    );

    if (!$stmt) {
        echo json_encode([
            "success" => false,
            "message" => "Database query preparation failed."
        ]);
        exit();
    }

    $stmt->bind_param(
        "isss",
        $userId,
        $todayChallenge,
        $answer,
        $today
    );

    if (!$stmt->execute()) {
        if ($stmt->errno === 1062) {
            $stmt->close();

            $existingStmt = $conn->prepare(
                "SELECT challenge_text, answer, challenge_date
                 FROM daily_challenges
                 WHERE user_id = ?
                   AND challenge_date = ?
                 LIMIT 1"
            );

            $existingStmt->bind_param("is", $userId, $today);
            $existingStmt->execute();

            $existingResult = $existingStmt->get_result();
            $existingRow = $existingResult->fetch_assoc();

            echo json_encode([
                "success" => true,
                "already_completed" => true,
                "message" => "Today's challenge is already completed.",
                "challenge" => $existingRow["challenge_text"] ?? $todayChallenge,
                "answer" => $existingRow["answer"] ?? "",
                "challenge_date" => $existingRow["challenge_date"] ?? $today
            ]);

            $existingStmt->close();
            $conn->close();
            exit();
        }

        echo json_encode([
            "success" => false,
            "message" => "Failed to complete today's challenge.",
            "database_error" => $stmt->error
        ]);

        $stmt->close();
        $conn->close();
        exit();
    }

    $stmt->close();
}

/*
|--------------------------------------------------------------------------
| GET TODAY'S CHALLENGE AND SAVED ANSWER
|--------------------------------------------------------------------------
*/

$checkStmt = $conn->prepare(
    "SELECT id, challenge_text, answer, challenge_date
     FROM daily_challenges
     WHERE user_id = ?
       AND challenge_date = ?
     LIMIT 1"
);

$checkStmt->bind_param("is", $userId, $today);
$checkStmt->execute();

$todayResult = $checkStmt->get_result();
$todayRow = $todayResult->fetch_assoc();

$completedToday = $todayRow !== null;
$savedAnswer = $todayRow["answer"] ?? "";

$checkStmt->close();

/*
|--------------------------------------------------------------------------
| STREAK HISTORY
|--------------------------------------------------------------------------
*/

$historyStmt = $conn->prepare(
    "SELECT challenge_date
     FROM daily_challenges
     WHERE user_id = ?
     ORDER BY challenge_date DESC"
);

$historyStmt->bind_param("i", $userId);
$historyStmt->execute();

$historyResult = $historyStmt->get_result();
$completedDates = [];

while ($row = $historyResult->fetch_assoc()) {
    $completedDates[] = $row["challenge_date"];
}

$historyStmt->close();

/*
|--------------------------------------------------------------------------
| CALCULATE STREAK
|--------------------------------------------------------------------------
*/

$streak = 0;
$expectedDate = new DateTime($today);

foreach ($completedDates as $completedDate) {
    if ($completedDate === $expectedDate->format("Y-m-d")) {
        $streak++;
        $expectedDate->modify("-1 day");
    } elseif ($completedDate < $expectedDate->format("Y-m-d")) {
        break;
    }
}

/*
|--------------------------------------------------------------------------
| FINAL RESPONSE
|--------------------------------------------------------------------------
*/

echo json_encode([
    "success" => true,
    "message" => $action === "complete"
        ? "Daily challenge completed successfully."
        : "Daily challenge loaded successfully.",
    "challenge" => $todayRow["challenge_text"] ?? $todayChallenge,
    "answer" => $savedAnswer,
    "challenge_date" => $today,
    "completed_today" => $completedToday,
    "streak" => $streak
]);

$conn->close();