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
        "message" =>
            "Invalid JSON data received."
    ]);

    $conn->close();
    exit;
}

/*
|--------------------------------------------------------------------------
| Receive Values
|--------------------------------------------------------------------------
*/

$userId = isset($data["user_id"])
    ? (int) $data["user_id"]
    : 0;

$planId = isset($data["plan_id"])
    ? (int) $data["plan_id"]
    : 0;

$taskId = isset($data["task_id"])
    ? (int) $data["task_id"]
    : 0;

$responseText = trim(
    $data["response_text"] ?? ""
);

$completionConfirmed =
    isset($data["completion_confirmed"])
        ? (int) $data["completion_confirmed"]
        : 0;

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

if ($userId <= 0) {
    http_response_code(422);

    echo json_encode([
        "success" => false,
        "message" =>
            "Valid user ID is required."
    ]);

    $conn->close();
    exit;
}

if ($planId <= 0) {
    http_response_code(422);

    echo json_encode([
        "success" => false,
        "message" =>
            "Valid wellness plan ID is required."
    ]);

    $conn->close();
    exit;
}

if ($taskId <= 0) {
    http_response_code(422);

    echo json_encode([
        "success" => false,
        "message" =>
            "Valid wellness task ID is required."
    ]);

    $conn->close();
    exit;
}

if (mb_strlen($responseText) < 5) {
    http_response_code(422);

    echo json_encode([
        "success" => false,
        "message" =>
            "Please add a short reflection before completing the task."
    ]);

    $conn->close();
    exit;
}

if (mb_strlen($responseText) > 2000) {
    http_response_code(422);

    echo json_encode([
        "success" => false,
        "message" =>
            "Your reflection must not exceed 2000 characters."
    ]);

    $conn->close();
    exit;
}

if ($completionConfirmed !== 1) {
    http_response_code(422);

    echo json_encode([
        "success" => false,
        "message" =>
            "Please confirm that you completed the wellness activity."
    ]);

    $conn->close();
    exit;
}

/*
|--------------------------------------------------------------------------
| Verify Wellness Plan
|--------------------------------------------------------------------------
*/

$planStmt = $conn->prepare(
    "SELECT
        id,
        status
     FROM wellness_plans
     WHERE id = ?
       AND user_id = ?
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

    $conn->close();
    exit;
}

$planStmt->bind_param(
    "ii",
    $planId,
    $userId
);

$planStmt->execute();

$planResult =
    $planStmt->get_result();

if ($planResult->num_rows === 0) {
    $planStmt->close();

    http_response_code(404);

    echo json_encode([
        "success" => false,
        "message" =>
            "Wellness plan was not found."
    ]);

    $conn->close();
    exit;
}

$plan = $planResult->fetch_assoc();

$planStmt->close();

if ($plan["status"] === "cancelled") {
    http_response_code(422);

    echo json_encode([
        "success" => false,
        "message" =>
            "A cancelled wellness plan cannot be updated."
    ]);

    $conn->close();
    exit;
}

/*
|--------------------------------------------------------------------------
| Verify Wellness Task
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
        completed_at
     FROM wellness_plan_tasks
     WHERE id = ?
       AND plan_id = ?
       AND user_id = ?
     LIMIT 1"
);

if (!$taskStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "Could not prepare wellness task query.",
        "error" => $conn->error
    ]);

    $conn->close();
    exit;
}

$taskStmt->bind_param(
    "iii",
    $taskId,
    $planId,
    $userId
);

$taskStmt->execute();

$taskResult =
    $taskStmt->get_result();

if ($taskResult->num_rows === 0) {
    $taskStmt->close();

    http_response_code(404);

    echo json_encode([
        "success" => false,
        "message" =>
            "Wellness task was not found."
    ]);

    $conn->close();
    exit;
}

$task = $taskResult->fetch_assoc();

$taskStmt->close();

/*
|--------------------------------------------------------------------------
| Return Existing State When Task Is Already Completed
|--------------------------------------------------------------------------
*/

if ($task["status"] === "completed") {
    $progressStmt = $conn->prepare(
        "SELECT
            COUNT(*) AS total_tasks,
            SUM(
                CASE
                    WHEN status = 'completed'
                    THEN 1
                    ELSE 0
                END
            ) AS completed_tasks
         FROM wellness_plan_tasks
         WHERE plan_id = ?
           AND user_id = ?"
    );

    if (!$progressStmt) {
        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" =>
                "Could not prepare progress query.",
            "error" => $conn->error
        ]);

        $conn->close();
        exit;
    }

    $progressStmt->bind_param(
        "ii",
        $planId,
        $userId
    );

    $progressStmt->execute();

    $progressResult =
        $progressStmt->get_result();

    $progressRow =
        $progressResult->fetch_assoc();

    $progressStmt->close();

    $totalTasks =
        (int) (
            $progressRow["total_tasks"]
            ?? 0
        );

    $completedTasks =
        (int) (
            $progressRow["completed_tasks"]
            ?? 0
        );

    $progressPercentage =
        $totalTasks > 0
            ? (int) round(
                (
                    $completedTasks /
                    $totalTasks
                ) * 100
            )
            : 0;

    echo json_encode([
        "success" => true,
        "already_completed" => true,
        "message" =>
            "This wellness task is already complete.",
        "task" => [
            "id" => $taskId,
            "plan_id" => $planId,
            "day_number" =>
                (int) $task["day_number"],
            "task_title" =>
                $task["task_title"],
            "status" => "completed",
            "completed_at" =>
                $task["completed_at"]
        ],
        "plan" => [
            "id" => $planId,
            "completed_tasks" =>
                $completedTasks,
            "total_tasks" =>
                $totalTasks,
            "progress_percentage" =>
                $progressPercentage
        ]
    ], JSON_UNESCAPED_UNICODE |
       JSON_UNESCAPED_SLASHES);

    $conn->close();
    exit;
}

/*
|--------------------------------------------------------------------------
| Validate Current Task Status
|--------------------------------------------------------------------------
*/

if ($task["status"] === "skipped") {
    http_response_code(422);

    echo json_encode([
        "success" => false,
        "message" =>
            "A skipped wellness task cannot be completed."
    ]);

    $conn->close();
    exit;
}

/*
|--------------------------------------------------------------------------
| Restrict Task to Its Assigned 24-Hour Date
|--------------------------------------------------------------------------
*/

$today = date("Y-m-d");
$taskDate = $task["task_date"];

if ($taskDate > $today) {
    http_response_code(422);

    echo json_encode([
        "success" => false,
        "message" =>
            "This task is locked until " .
            date(
                "d M Y",
                strtotime($taskDate)
            ) .
            "."
    ]);

    $conn->close();
    exit;
}

if ($taskDate < $today) {
    http_response_code(422);

    echo json_encode([
        "success" => false,
        "message" =>
            "The 24-hour completion window for this task has ended."
    ]);

    $conn->close();
    exit;
}

/*
|--------------------------------------------------------------------------
| Save Response and Complete Task
|--------------------------------------------------------------------------
*/

$conn->begin_transaction();

try {
    /*
    |--------------------------------------------------------------------------
    | Make Sure Response Does Not Already Exist
    |--------------------------------------------------------------------------
    */

    $existingResponseStmt = $conn->prepare(
        "SELECT id
         FROM wellness_task_responses
         WHERE user_id = ?
           AND plan_id = ?
           AND task_id = ?
         LIMIT 1"
    );

    if (!$existingResponseStmt) {
        throw new Exception(
            "Could not prepare response verification query: " .
            $conn->error
        );
    }

    $existingResponseStmt->bind_param(
        "iii",
        $userId,
        $planId,
        $taskId
    );

    if (!$existingResponseStmt->execute()) {
        throw new Exception(
            "Could not verify existing task response: " .
            $existingResponseStmt->error
        );
    }

    $existingResponseResult =
        $existingResponseStmt->get_result();

    if (
        $existingResponseResult->num_rows > 0
    ) {
        $existingResponseStmt->close();

        throw new Exception(
            "A response for this wellness task has already been submitted."
        );
    }

    $existingResponseStmt->close();

    /*
    |--------------------------------------------------------------------------
    | Save Reflection and Activity Details
    |--------------------------------------------------------------------------
    */

    $activityType =
        $task["activity_type"];

    $durationMinutes =
        $task["duration_minutes"] !== null
            ? (int) $task[
                "duration_minutes"
            ]
            : null;

    $responseStmt = $conn->prepare(
        "INSERT INTO wellness_task_responses (
            user_id,
            plan_id,
            task_id,
            response_text,
            activity_type,
            duration_minutes,
            completion_confirmed,
            submitted_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())"
    );

    if (!$responseStmt) {
        throw new Exception(
            "Could not prepare task response query: " .
            $conn->error
        );
    }

    $responseStmt->bind_param(
        "iiissii",
        $userId,
        $planId,
        $taskId,
        $responseText,
        $activityType,
        $durationMinutes,
        $completionConfirmed
    );

    if (!$responseStmt->execute()) {
        throw new Exception(
            "Could not save task response: " .
            $responseStmt->error
        );
    }

    $responseId =
        $responseStmt->insert_id;

    $responseStmt->close();

    /*
    |--------------------------------------------------------------------------
    | Mark Task as Completed
    |--------------------------------------------------------------------------
    */

    $completeStmt = $conn->prepare(
        "UPDATE wellness_plan_tasks
         SET
            status = 'completed',
            completed_at = NOW()
         WHERE id = ?
           AND plan_id = ?
           AND user_id = ?
           AND status = 'pending'"
    );

    if (!$completeStmt) {
        throw new Exception(
            "Could not prepare task update query: " .
            $conn->error
        );
    }

    $completeStmt->bind_param(
        "iii",
        $taskId,
        $planId,
        $userId
    );

    if (!$completeStmt->execute()) {
        throw new Exception(
            "Could not complete wellness task: " .
            $completeStmt->error
        );
    }

    if ($completeStmt->affected_rows === 0) {
        $completeStmt->close();

        throw new Exception(
            "This wellness task could not be marked as completed."
        );
    }

    $completeStmt->close();

    /*
    |--------------------------------------------------------------------------
    | Calculate Updated Progress
    |--------------------------------------------------------------------------
    */

    $progressStmt = $conn->prepare(
        "SELECT
            COUNT(*) AS total_tasks,
            SUM(
                CASE
                    WHEN status = 'completed'
                    THEN 1
                    ELSE 0
                END
            ) AS completed_tasks,
            SUM(
                CASE
                    WHEN status = 'pending'
                    THEN 1
                    ELSE 0
                END
            ) AS pending_tasks,
            SUM(
                CASE
                    WHEN status = 'skipped'
                    THEN 1
                    ELSE 0
                END
            ) AS skipped_tasks
         FROM wellness_plan_tasks
         WHERE plan_id = ?
           AND user_id = ?"
    );

    if (!$progressStmt) {
        throw new Exception(
            "Could not prepare progress query: " .
            $conn->error
        );
    }

    $progressStmt->bind_param(
        "ii",
        $planId,
        $userId
    );

    if (!$progressStmt->execute()) {
        throw new Exception(
            "Could not calculate plan progress: " .
            $progressStmt->error
        );
    }

    $progressResult =
        $progressStmt->get_result();

    $progressRow =
        $progressResult->fetch_assoc();

    $progressStmt->close();

    $totalTasks =
        (int) (
            $progressRow["total_tasks"]
            ?? 0
        );

    $completedTasks =
        (int) (
            $progressRow["completed_tasks"]
            ?? 0
        );

    $pendingTasks =
        (int) (
            $progressRow["pending_tasks"]
            ?? 0
        );

    $skippedTasks =
        (int) (
            $progressRow["skipped_tasks"]
            ?? 0
        );

    $progressPercentage =
        $totalTasks > 0
            ? (int) round(
                (
                    $completedTasks /
                    $totalTasks
                ) * 100
            )
            : 0;

    $planStatus =
        $completedTasks >= $totalTasks &&
        $totalTasks > 0
            ? "completed"
            : "active";

    /*
    |--------------------------------------------------------------------------
    | Update Main Wellness Plan
    |--------------------------------------------------------------------------
    */

    $updatePlanStmt =
        $conn->prepare(
            "UPDATE wellness_plans
             SET
                progress_percentage = ?,
                status = ?
             WHERE id = ?
               AND user_id = ?"
        );

    if (!$updatePlanStmt) {
        throw new Exception(
            "Could not prepare plan progress update: " .
            $conn->error
        );
    }

    $updatePlanStmt->bind_param(
        "isii",
        $progressPercentage,
        $planStatus,
        $planId,
        $userId
    );

    if (!$updatePlanStmt->execute()) {
        throw new Exception(
            "Could not update wellness plan: " .
            $updatePlanStmt->error
        );
    }

    $updatePlanStmt->close();

    /*
    |--------------------------------------------------------------------------
    | Commit All Database Changes
    |--------------------------------------------------------------------------
    */

    $conn->commit();

    $completedAt =
        date("Y-m-d H:i:s");

    echo json_encode([
        "success" => true,
        "already_completed" => false,
        "message" =>
            $planStatus === "completed"
                ? "Wonderful! You completed your seven-day wellness plan."
                : "Well done! Your wellness task and reflection were saved successfully.",
        "response" => [
            "id" =>
                (int) $responseId,
            "response_text" =>
                $responseText,
            "activity_type" =>
                $activityType,
            "duration_minutes" =>
                $durationMinutes,
            "completion_confirmed" =>
                true,
            "submitted_at" =>
                $completedAt
        ],
        "task" => [
            "id" => $taskId,
            "plan_id" => $planId,
            "day_number" =>
                (int) $task["day_number"],
            "task_date" =>
                $task["task_date"],
            "task_title" =>
                $task["task_title"],
            "status" => "completed",
            "completed_at" =>
                $completedAt
        ],
        "plan" => [
            "id" => $planId,
            "status" =>
                $planStatus,
            "completed_tasks" =>
                $completedTasks,
            "pending_tasks" =>
                $pendingTasks,
            "skipped_tasks" =>
                $skippedTasks,
            "total_tasks" =>
                $totalTasks,
            "progress_percentage" =>
                $progressPercentage
        ]
    ], JSON_UNESCAPED_UNICODE |
       JSON_UNESCAPED_SLASHES);
} catch (Throwable $error) {
    $conn->rollback();

    $errorMessage =
        $error->getMessage();

    $isDuplicateResponse =
        str_contains(
            strtolower($errorMessage),
            "duplicate"
        ) ||
        str_contains(
            strtolower($errorMessage),
            "already been submitted"
        );

    http_response_code(
        $isDuplicateResponse
            ? 409
            : 500
    );

    echo json_encode([
        "success" => false,
        "message" =>
            $isDuplicateResponse
                ? "A response for this wellness task has already been submitted."
                : "The wellness task could not be completed.",
        "error" =>
            $errorMessage
    ]);
}

$conn->close();