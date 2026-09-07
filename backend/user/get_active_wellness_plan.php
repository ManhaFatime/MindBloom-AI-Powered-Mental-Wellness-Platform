<?php

date_default_timezone_set("Asia/Karachi");

error_reporting(E_ALL);
ini_set("display_errors", 1);

header("Access-Control-Allow-Origin: *");
header(
    "Access-Control-Allow-Headers: Content-Type, Authorization"
);
header(
    "Access-Control-Allow-Methods: POST, OPTIONS"
);
header(
    "Content-Type: application/json; charset=UTF-8"
);

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" =>
            "Only POST requests are allowed."
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
        "message" =>
            "Invalid JSON data received."
    ]);

    exit;
}

$userId = isset($data["user_id"])
    ? (int) $data["user_id"]
    : 0;

if ($userId <= 0) {
    http_response_code(422);

    echo json_encode([
        "success" => false,
        "message" =>
            "Valid user ID is required."
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Check User Exists
|--------------------------------------------------------------------------
*/

$userStmt = $conn->prepare(
    "SELECT id
     FROM users
     WHERE id = ?
     LIMIT 1"
);

if (!$userStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "Could not prepare user query.",
        "error" => $conn->error
    ]);

    exit;
}

$userStmt->bind_param(
    "i",
    $userId
);

$userStmt->execute();

$userResult =
    $userStmt->get_result();

if ($userResult->num_rows === 0) {
    $userStmt->close();

    http_response_code(404);

    echo json_encode([
        "success" => false,
        "message" =>
            "User was not found."
    ]);

    exit;
}

$userStmt->close();

/*
|--------------------------------------------------------------------------
| Load Latest Active Plan
|--------------------------------------------------------------------------
*/

$planStmt = $conn->prepare(
    "SELECT
        id,
        user_id,
        assessment_id,
        plan_title,
        category,
        category_name,
        assessment_score,
        wellness_level,
        ai_summary,
        start_date,
        end_date,
        status,
        progress_percentage,
        recommendation_source,
        created_at,
        updated_at
     FROM wellness_plans
     WHERE user_id = ?
       AND status IN ('active', 'completed')
     ORDER BY
        CASE
            WHEN status = 'active' THEN 1
            WHEN status = 'completed' THEN 2
            ELSE 3
        END,
        id DESC
     LIMIT 1"
);

if (!$planStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "Could not prepare wellness plan query.",
        "error" => $conn->error
    ]);

    exit;
}

$planStmt->bind_param(
    "i",
    $userId
);

$planStmt->execute();

$planResult =
    $planStmt->get_result();

if ($planResult->num_rows === 0) {
    $planStmt->close();
    $conn->close();

    echo json_encode([
        "success" => true,
        "has_plan" => false,
        "message" =>
            "No active wellness plan was found.",
        "plan" => null
    ]);

    exit;
}

$plan = $planResult->fetch_assoc();

$planStmt->close();

$planId = (int) $plan["id"];

/*
|--------------------------------------------------------------------------
| Load Plan Tasks
|--------------------------------------------------------------------------
*/

$taskStmt = $conn->prepare(
    "SELECT
        id,
        plan_id,
        user_id,
        day_number,
        task_date,
        task_title,
        task_description,
        activity_type,
        duration_minutes,
        status,
        completed_at,
        created_at,
        updated_at
     FROM wellness_plan_tasks
     WHERE plan_id = ?
       AND user_id = ?
     ORDER BY day_number ASC"
);

if (!$taskStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "Could not prepare wellness task query.",
        "error" => $conn->error
    ]);

    exit;
}

$taskStmt->bind_param(
    "ii",
    $planId,
    $userId
);

$taskStmt->execute();

$taskResult =
    $taskStmt->get_result();

$tasks = [];

$completedTasks = 0;
$pendingTasks = 0;
$skippedTasks = 0;

$today = date("Y-m-d");

while ($task = $taskResult->fetch_assoc()) {
    $status = $task["status"];
    $taskDate = $task["task_date"];

    /*
    |--------------------------------------------------------------------------
    | Task Availability
    |--------------------------------------------------------------------------
    */

    if ($status === "completed") {
        $availabilityStatus = "completed";
    } elseif ($taskDate === $today) {
        $availabilityStatus = "available_today";
    } elseif ($taskDate > $today) {
        $availabilityStatus = "locked";
    } else {
        $availabilityStatus = "missed";
    }

    /*
    |--------------------------------------------------------------------------
    | Task Counts
    |--------------------------------------------------------------------------
    */

    if ($status === "completed") {
        $completedTasks++;
    } elseif ($status === "skipped") {
        $skippedTasks++;
    } else {
        $pendingTasks++;
    }

    /*
    |--------------------------------------------------------------------------
    | Add Task Once
    |--------------------------------------------------------------------------
    */

    $tasks[] = [
        "id" =>
            (int) $task["id"],

        "plan_id" =>
            (int) $task["plan_id"],

        "user_id" =>
            (int) $task["user_id"],

        "day_number" =>
            (int) $task["day_number"],

        "task_date" =>
            $task["task_date"],

        "task_title" =>
            $task["task_title"],

        "task_description" =>
            $task["task_description"],

        "activity_type" =>
            $task["activity_type"],

        "duration_minutes" =>
            $task["duration_minutes"] !== null
                ? (int) $task["duration_minutes"]
                : null,

        "status" =>
            $task["status"],

        "availability_status" =>
            $availabilityStatus,

        "completed_at" =>
            $task["completed_at"],

        "created_at" =>
            $task["created_at"],

        "updated_at" =>
            $task["updated_at"]
    ];
}

$taskStmt->close();

/*
|--------------------------------------------------------------------------
| Calculate Accurate Progress
|--------------------------------------------------------------------------
*/

$totalTasks = count($tasks);

$calculatedProgress =
    $totalTasks > 0
        ? (int) round(
            ($completedTasks /
                $totalTasks) * 100
        )
        : 0;

if (
    $calculatedProgress !==
    (int) $plan["progress_percentage"]
) {
    $updateStmt = $conn->prepare(
        "UPDATE wellness_plans
         SET progress_percentage = ?
         WHERE id = ?
           AND user_id = ?"
    );

    if ($updateStmt) {
        $updateStmt->bind_param(
            "iii",
            $calculatedProgress,
            $planId,
            $userId
        );

        $updateStmt->execute();
        $updateStmt->close();
    }
}

/*
|--------------------------------------------------------------------------
| Today Information
|--------------------------------------------------------------------------
*/

$currentTask = null;

foreach ($tasks as $task) {
    if (
        $task["task_date"] === $today
    ) {
        $currentTask = $task;
        break;
    }
}

/*
|--------------------------------------------------------------------------
| Success Response
|--------------------------------------------------------------------------
*/

echo json_encode([
    "success" => true,
    "has_plan" => true,
    "message" =>
        "Active wellness plan loaded successfully.",
    "today" => $today,
    "plan" => [
        "id" =>
            $planId,
        "user_id" =>
            (int) $plan["user_id"],
        "assessment_id" =>
            $plan["assessment_id"] !== null
                ? (int) $plan[
                    "assessment_id"
                ]
                : null,
        "plan_title" =>
            $plan["plan_title"],
        "category" =>
            $plan["category"],
        "category_name" =>
            $plan["category_name"],
        "assessment_score" =>
            (float) $plan[
                "assessment_score"
            ],
        "wellness_level" =>
            $plan["wellness_level"],
        "summary" =>
            $plan["ai_summary"],
        "start_date" =>
            $plan["start_date"],
        "end_date" =>
            $plan["end_date"],
        "status" =>
            $plan["status"],
        "progress_percentage" =>
            $calculatedProgress,
        "recommendation_source" =>
            $plan[
                "recommendation_source"
            ],
        "created_at" =>
            $plan["created_at"],
        "updated_at" =>
            $plan["updated_at"],
        "total_tasks" =>
            $totalTasks,
        "completed_tasks" =>
            $completedTasks,
        "pending_tasks" =>
            $pendingTasks,
        "skipped_tasks" =>
            $skippedTasks,
        "current_task" =>
            $currentTask,
        "tasks" =>
            $tasks
    ]
], JSON_UNESCAPED_UNICODE |
   JSON_UNESCAPED_SLASHES);

$conn->close();