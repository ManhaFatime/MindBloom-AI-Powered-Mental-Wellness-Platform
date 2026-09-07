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

$assessmentId = isset(
    $data["assessment_id"]
)
    ? (int) $data["assessment_id"]
    : 0;

/*
|--------------------------------------------------------------------------
| Basic Validation
|--------------------------------------------------------------------------
*/

if ($userId <= 0) {
    http_response_code(422);

    echo json_encode([
        "success" => false,
        "message" =>
            "Valid user ID is required."
    ]);

    exit;
}

if ($assessmentId <= 0) {
    http_response_code(422);

    echo json_encode([
        "success" => false,
        "message" =>
            "Valid assessment ID is required."
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Gemini API Key
|--------------------------------------------------------------------------
| Apni assessment_recommendations.php wali same key yahan paste karein.
|--------------------------------------------------------------------------
*/

$apiKey = defined("GEMINI_API_KEY")
    ? trim(GEMINI_API_KEY)
    : "";

/*
|--------------------------------------------------------------------------
| Verify User
|--------------------------------------------------------------------------
*/

$userStmt = $conn->prepare(
    "SELECT id, fullname, email
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

$user = $userResult->fetch_assoc();

$userStmt->close();

/*
|--------------------------------------------------------------------------
| Load Assessment
|--------------------------------------------------------------------------
*/

$assessmentStmt = $conn->prepare(
    "SELECT
        id,
        user_id,
        category,
        category_name,
        score,
        wellness_level,
        level_key,
        answers,
        ai_summary,
        recommendations,
        recommendation_source,
        created_at
     FROM assessment_history
     WHERE id = ?
       AND user_id = ?
     LIMIT 1"
);

if (!$assessmentStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "Could not prepare assessment query.",
        "error" => $conn->error
    ]);

    exit;
}

$assessmentStmt->bind_param(
    "ii",
    $assessmentId,
    $userId
);

$assessmentStmt->execute();

$assessmentResult =
    $assessmentStmt->get_result();

if (
    $assessmentResult->num_rows === 0
) {
    $assessmentStmt->close();

    http_response_code(404);

    echo json_encode([
        "success" => false,
        "message" =>
            "Assessment was not found for this user."
    ]);

    exit;
}

$assessment =
    $assessmentResult->fetch_assoc();

$assessmentStmt->close();

/*
|--------------------------------------------------------------------------
| Check Existing Active Plan
|--------------------------------------------------------------------------
| A user can have only one active seven-day plan at a time.
| Completed plans remain in history and do not block a new plan.
|--------------------------------------------------------------------------
*/

$existingPlanStmt = $conn->prepare(
    "SELECT
        id,
        assessment_id,
        plan_title,
        start_date,
        end_date,
        status,
        progress_percentage
     FROM wellness_plans
     WHERE user_id = ?
       AND status = 'active'
     ORDER BY id DESC
     LIMIT 1"
);

if (!$existingPlanStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "Could not check the active wellness plan.",
        "error" => $conn->error
    ]);

    $conn->close();
    exit;
}

$existingPlanStmt->bind_param(
    "i",
    $userId
);

$existingPlanStmt->execute();

$existingPlanResult =
    $existingPlanStmt->get_result();

if ($existingPlanResult->num_rows > 0) {
    $existingPlan =
        $existingPlanResult->fetch_assoc();

    $existingPlanStmt->close();
    $conn->close();

    echo json_encode([
        "success" => true,
        "already_exists" => true,
        "message" =>
            "You already have an active seven-day wellness plan. Complete it before creating another plan.",
        "plan_id" =>
            (int) $existingPlan["id"],
        "plan" => [
            "id" =>
                (int) $existingPlan["id"],
            "assessment_id" =>
                $existingPlan["assessment_id"] !== null
                    ? (int) $existingPlan["assessment_id"]
                    : null,
            "plan_title" =>
                $existingPlan["plan_title"],
            "start_date" =>
                $existingPlan["start_date"],
            "end_date" =>
                $existingPlan["end_date"],
            "status" =>
                $existingPlan["status"],
            "progress_percentage" =>
                (int) $existingPlan[
                    "progress_percentage"
                ]
        ]
    ], JSON_UNESCAPED_UNICODE |
       JSON_UNESCAPED_SLASHES);

    exit;
}

$existingPlanStmt->close();

/*
|--------------------------------------------------------------------------
| Prevent Reusing an Assessment
|--------------------------------------------------------------------------
| A completed assessment can create only one wellness plan. After completing
| a plan, the user must take a new assessment before generating another plan.
|--------------------------------------------------------------------------
*/

$usedAssessmentStmt = $conn->prepare(
    "SELECT
        id,
        plan_title,
        status,
        progress_percentage,
        created_at
     FROM wellness_plans
     WHERE user_id = ?
       AND assessment_id = ?
     ORDER BY id DESC
     LIMIT 1"
);

if (!$usedAssessmentStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "Could not verify whether this assessment was already used.",
        "error" => $conn->error
    ]);

    $conn->close();
    exit;
}

$usedAssessmentStmt->bind_param(
    "ii",
    $userId,
    $assessmentId
);

$usedAssessmentStmt->execute();

$usedAssessmentResult =
    $usedAssessmentStmt->get_result();

if ($usedAssessmentResult->num_rows > 0) {
    $usedPlan =
        $usedAssessmentResult->fetch_assoc();

    $usedAssessmentStmt->close();
    $conn->close();

    http_response_code(409);

    echo json_encode([
        "success" => false,
        "already_used" => true,
        "message" =>
            "This assessment has already been used for a wellness plan. Please complete a new assessment to create your next seven-day plan.",
        "plan" => [
            "id" =>
                (int) $usedPlan["id"],
            "plan_title" =>
                $usedPlan["plan_title"],
            "status" =>
                $usedPlan["status"],
            "progress_percentage" =>
                (int) $usedPlan[
                    "progress_percentage"
                ],
            "created_at" =>
                $usedPlan["created_at"]
        ]
    ], JSON_UNESCAPED_UNICODE |
       JSON_UNESCAPED_SLASHES);

    exit;
}

$usedAssessmentStmt->close();

/*
|--------------------------------------------------------------------------
| Assessment Details
|--------------------------------------------------------------------------
*/

$category =
    trim($assessment["category"]);

$categoryName =
    trim($assessment["category_name"]);

$score =
    (int) round(
        (float) $assessment["score"]
    );

$wellnessLevel =
    trim(
        $assessment["wellness_level"]
    );

$assessmentSummary =
    trim(
        $assessment["ai_summary"] ?? ""
    );

$answers = [];

if (!empty($assessment["answers"])) {
    $decodedAnswers = json_decode(
        $assessment["answers"],
        true
    );

    if (is_array($decodedAnswers)) {
        $answers = $decodedAnswers;
    }
}

/*
|--------------------------------------------------------------------------
| Prepare Assessment Answers for Prompt
|--------------------------------------------------------------------------
*/

$answerDetails = "";

foreach (
    $answers as $index => $answer
) {
    $question = trim(
        $answer["question"] ?? ""
    );

    $selectedAnswer = trim(
        $answer["answer"] ?? ""
    );

    if (
        $question === "" &&
        $selectedAnswer === ""
    ) {
        continue;
    }

    $answerDetails .=
        ($index + 1) .
        ". Question: " .
        $question .
        "\nAnswer: " .
        $selectedAnswer .
        "\n\n";
}

if ($answerDetails === "") {
    $answerDetails =
        "Detailed answers are not available.";
}

/*
|--------------------------------------------------------------------------
| Score Guidance
|--------------------------------------------------------------------------
| Higher score means better wellness.
|--------------------------------------------------------------------------
*/

if ($score >= 80) {
    $scoreInstruction = "
The user currently has strong wellness.
Create a maintenance and growth-focused plan.
";
} elseif ($score >= 60) {
    $scoreInstruction = "
The user appears generally stable but has
some areas that need gentle improvement.
";
} elseif ($score >= 40) {
    $scoreInstruction = "
The user has moderate wellness concerns.
Create a structured but manageable self-care plan.
";
} elseif ($score >= 20) {
    $scoreInstruction = "
The user has high wellness concerns.
Use supportive language and include safe,
gentle tasks. Encourage trusted human support.
";
} else {
    $scoreInstruction = "
The user has very high wellness concerns.
Use calm, supportive language and very gentle
tasks. Encourage trusted-person and qualified
professional support without making a diagnosis.
";
}

/*
|--------------------------------------------------------------------------
| Gemini Prompt
|--------------------------------------------------------------------------
*/

$userName =
    trim($user["fullname"] ?? "User");

$prompt = <<<PROMPT
You are MindBloom's wellness-plan assistant.

Create a personalized 7-day general wellness plan.

User name: $userName
Assessment category: $categoryName
Wellness score: $score out of 100
Wellness level: $wellnessLevel
Existing assessment summary: $assessmentSummary

Important scoring rule:
A higher score means better wellness.
A lower score means greater concern.

$scoreInstruction

Assessment answers:

$answerDetails

Requirements:
- Use simple English.
- Do not diagnose any illness.
- Do not recommend medicine.
- Create exactly 7 tasks.
- One task must be provided for each day from Day 1 to Day 7.
- Tasks must match the assessment category and answers.
- Each task should be realistic and safe.
- Duration should be between 2 and 30 minutes.
- Use different but connected activities across the week.
- Task title should be short.
- Description should contain one clear instruction.
- Activity type should be a short lowercase value such as:
  breathing, journaling, mindfulness, walking,
  gratitude, sleep, reflection, connection.
- Give one short personalized plan summary.
- Do not use markdown.
- Return only valid JSON.

Return this exact JSON structure:

{
  "plan_title": "7-Day Category Wellness Plan",
  "summary": "Short personalized summary.",
  "tasks": [
    {
      "day_number": 1,
      "title": "Short task title",
      "description": "One clear practical instruction.",
      "activity_type": "breathing",
      "duration_minutes": 5
    },
    {
      "day_number": 2,
      "title": "Short task title",
      "description": "One clear practical instruction.",
      "activity_type": "journaling",
      "duration_minutes": 10
    },
    {
      "day_number": 3,
      "title": "Short task title",
      "description": "One clear practical instruction.",
      "activity_type": "mindfulness",
      "duration_minutes": 5
    },
    {
      "day_number": 4,
      "title": "Short task title",
      "description": "One clear practical instruction.",
      "activity_type": "walking",
      "duration_minutes": 10
    },
    {
      "day_number": 5,
      "title": "Short task title",
      "description": "One clear practical instruction.",
      "activity_type": "gratitude",
      "duration_minutes": 5
    },
    {
      "day_number": 6,
      "title": "Short task title",
      "description": "One clear practical instruction.",
      "activity_type": "reflection",
      "duration_minutes": 10
    },
    {
      "day_number": 7,
      "title": "Short task title",
      "description": "One clear practical instruction.",
      "activity_type": "review",
      "duration_minutes": 10
    }
  ]
}
PROMPT;

/*
|--------------------------------------------------------------------------
| Safe Category-Based Fallback Plans
|--------------------------------------------------------------------------
*/

$fallbackPlans = [
    "anxiety" => [
        [
            "title" =>
                "Slow Breathing Reset",
            "description" =>
                "Practice slow breathing for five minutes and gently lengthen each exhale.",
            "activity_type" =>
                "breathing",
            "duration_minutes" => 5
        ],
        [
            "title" =>
                "Name What You Notice",
            "description" =>
                "Write down three thoughts or feelings you notice without judging them.",
            "activity_type" =>
                "journaling",
            "duration_minutes" => 8
        ],
        [
            "title" =>
                "Five-Senses Grounding",
            "description" =>
                "Notice five things you see, four you feel, three you hear, two you smell and one you taste.",
            "activity_type" =>
                "grounding",
            "duration_minutes" => 5
        ],
        [
            "title" =>
                "Gentle Mindful Walk",
            "description" =>
                "Take a short walk and focus on your breathing and surroundings.",
            "activity_type" =>
                "walking",
            "duration_minutes" => 10
        ],
        [
            "title" =>
                "Worry Release Page",
            "description" =>
                "Write one current worry and one small action that is within your control.",
            "activity_type" =>
                "journaling",
            "duration_minutes" => 10
        ],
        [
            "title" =>
                "Relax Your Body",
            "description" =>
                "Slowly relax your shoulders, jaw, hands and legs while breathing gently.",
            "activity_type" =>
                "relaxation",
            "duration_minutes" => 8
        ],
        [
            "title" =>
                "Weekly Calm Review",
            "description" =>
                "Review which activity helped you feel calmer and choose one to continue next week.",
            "activity_type" =>
                "reflection",
            "duration_minutes" => 10
        ]
    ],

    "stress" => [
        [
            "title" =>
                "Breathing Pause",
            "description" =>
                "Take five minutes away from your tasks and practice slow breathing.",
            "activity_type" =>
                "breathing",
            "duration_minutes" => 5
        ],
        [
            "title" =>
                "Simplify Your Tasks",
            "description" =>
                "Write your three main tasks and choose only one to start first.",
            "activity_type" =>
                "planning",
            "duration_minutes" => 8
        ],
        [
            "title" =>
                "Mindful Break",
            "description" =>
                "Sit quietly and bring your attention back to your breathing whenever your mind wanders.",
            "activity_type" =>
                "mindfulness",
            "duration_minutes" => 7
        ],
        [
            "title" =>
                "Movement Reset",
            "description" =>
                "Take a gentle ten-minute walk without checking work or study messages.",
            "activity_type" =>
                "walking",
            "duration_minutes" => 10
        ],
        [
            "title" =>
                "Release Physical Tension",
            "description" =>
                "Stretch your neck, shoulders and back slowly while breathing normally.",
            "activity_type" =>
                "stretching",
            "duration_minutes" => 8
        ],
        [
            "title" =>
                "Ask for Support",
            "description" =>
                "Share one source of stress with someone you trust.",
            "activity_type" =>
                "connection",
            "duration_minutes" => 10
        ],
        [
            "title" =>
                "Stress Pattern Review",
            "description" =>
                "Write what increased your stress and what helped reduce it this week.",
            "activity_type" =>
                "reflection",
            "duration_minutes" => 10
        ]
    ],

    "mood" => [
        [
            "title" =>
                "Gentle Mood Check",
            "description" =>
                "Name your current mood and write one possible reason for it.",
            "activity_type" =>
                "mood",
            "duration_minutes" => 5
        ],
        [
            "title" =>
                "Small Enjoyable Activity",
            "description" =>
                "Spend ten minutes doing one simple activity you usually enjoy.",
            "activity_type" =>
                "self_care",
            "duration_minutes" => 10
        ],
        [
            "title" =>
                "Gratitude Moment",
            "description" =>
                "Write three small things that brought comfort or support today.",
            "activity_type" =>
                "gratitude",
            "duration_minutes" => 7
        ],
        [
            "title" =>
                "Fresh-Air Walk",
            "description" =>
                "Take a short walk and notice the light, sounds and movement around you.",
            "activity_type" =>
                "walking",
            "duration_minutes" => 10
        ],
        [
            "title" =>
                "Supportive Self-Talk",
            "description" =>
                "Write one kind sentence you would say to a close friend in your situation.",
            "activity_type" =>
                "reflection",
            "duration_minutes" => 5
        ],
        [
            "title" =>
                "Connect With Someone",
            "description" =>
                "Send a message or speak with someone who helps you feel supported.",
            "activity_type" =>
                "connection",
            "duration_minutes" => 10
        ],
        [
            "title" =>
                "Mood Progress Review",
            "description" =>
                "Review your week and identify one activity that supported your mood.",
            "activity_type" =>
                "review",
            "duration_minutes" => 10
        ]
    ],

    "sleep" => [
        [
            "title" =>
                "Set a Sleep Time",
            "description" =>
                "Choose a realistic bedtime and wake-up time for the next seven days.",
            "activity_type" =>
                "sleep",
            "duration_minutes" => 5
        ],
        [
            "title" =>
                "Screen-Free Wind Down",
            "description" =>
                "Put screens away for at least twenty minutes before bedtime.",
            "activity_type" =>
                "sleep",
            "duration_minutes" => 20
        ],
        [
            "title" =>
                "Evening Breathing",
            "description" =>
                "Practice slow breathing while lying or sitting comfortably before sleep.",
            "activity_type" =>
                "breathing",
            "duration_minutes" => 5
        ],
        [
            "title" =>
                "Prepare a Calm Space",
            "description" =>
                "Reduce unnecessary light and noise in your sleeping area.",
            "activity_type" =>
                "sleep",
            "duration_minutes" => 10
        ],
        [
            "title" =>
                "Caffeine Check",
            "description" =>
                "Avoid caffeine later in the day and notice whether sleep feels different.",
            "activity_type" =>
                "habit",
            "duration_minutes" => 5
        ],
        [
            "title" =>
                "Sleep Reflection",
            "description" =>
                "Write what helped or interrupted your sleep last night.",
            "activity_type" =>
                "journaling",
            "duration_minutes" => 8
        ],
        [
            "title" =>
                "Weekly Sleep Review",
            "description" =>
                "Review your sleep routine and choose one helpful habit to continue.",
            "activity_type" =>
                "review",
            "duration_minutes" => 10
        ]
    ],

    "self-esteem" => [
        [
            "title" =>
                "Name One Strength",
            "description" =>
                "Write one personal strength and one example of when you used it.",
            "activity_type" =>
                "journaling",
            "duration_minutes" => 7
        ],
        [
            "title" =>
                "Gentle Self-Talk",
            "description" =>
                "Replace one harsh thought with a more balanced and supportive sentence.",
            "activity_type" =>
                "reflection",
            "duration_minutes" => 8
        ],
        [
            "title" =>
                "Complete a Small Goal",
            "description" =>
                "Choose one manageable task and acknowledge yourself after completing it.",
            "activity_type" =>
                "goal",
            "duration_minutes" => 15
        ],
        [
            "title" =>
                "Appreciate Your Effort",
            "description" =>
                "Write three efforts you made recently, even if the results were not perfect.",
            "activity_type" =>
                "gratitude",
            "duration_minutes" => 8
        ],
        [
            "title" =>
                "Reduce Comparison",
            "description" =>
                "Take a short break from content that causes unhealthy comparison.",
            "activity_type" =>
                "self_care",
            "duration_minutes" => 15
        ],
        [
            "title" =>
                "Positive Connection",
            "description" =>
                "Spend time with someone who treats you with respect and encouragement.",
            "activity_type" =>
                "connection",
            "duration_minutes" => 15
        ],
        [
            "title" =>
                "Strengths Review",
            "description" =>
                "Review what you handled well this week and choose one strength to keep developing.",
            "activity_type" =>
                "review",
            "duration_minutes" => 10
        ]
    ]
];

$defaultFallbackTasks = [
    [
        "title" =>
            "Mindful Breathing",
        "description" =>
            "Practice slow breathing and gently return your attention whenever your mind wanders.",
        "activity_type" =>
            "breathing",
        "duration_minutes" => 5
    ],
    [
        "title" =>
            "Daily Reflection",
        "description" =>
            "Write how you feel today and one thing that may support you.",
        "activity_type" =>
            "journaling",
        "duration_minutes" => 8
    ],
    [
        "title" =>
            "Present-Moment Pause",
        "description" =>
            "Spend a few minutes noticing your breathing, body and surroundings.",
        "activity_type" =>
            "mindfulness",
        "duration_minutes" => 5
    ],
    [
        "title" =>
            "Gentle Movement",
        "description" =>
            "Take a short walk or complete gentle stretching.",
        "activity_type" =>
            "walking",
        "duration_minutes" => 10
    ],
    [
        "title" =>
            "Gratitude Practice",
        "description" =>
            "Write three small things you appreciate today.",
        "activity_type" =>
            "gratitude",
        "duration_minutes" => 7
    ],
    [
        "title" =>
            "Trusted Connection",
        "description" =>
            "Speak with someone you trust about how your week has been.",
        "activity_type" =>
            "connection",
        "duration_minutes" => 10
    ],
    [
        "title" =>
            "Weekly Progress Review",
        "description" =>
            "Review your week and choose one helpful habit to continue.",
        "activity_type" =>
            "review",
        "duration_minutes" => 10
    ]
];

/*
|--------------------------------------------------------------------------
| Normalize Category Key for Fallback
|--------------------------------------------------------------------------
*/

$normalizedCategory =
    strtolower($category);

$normalizedCategory =
    str_replace(
        ["_", " "],
        "-",
        $normalizedCategory
    );

$fallbackTasks =
    $fallbackPlans[$normalizedCategory]
    ?? $defaultFallbackTasks;

$fallbackSummary =
    "This seven-day plan provides small, practical steps to support your " .
    strtolower($categoryName) .
    " wellness.";

$fallbackTitle =
    "7-Day " .
    $categoryName .
    " Wellness Plan";

/*
|--------------------------------------------------------------------------
| Gemini Request
|--------------------------------------------------------------------------
*/

$generatedPlan = null;
$recommendationSource = "fallback";

if (
    $apiKey !== "" &&
    $apiKey !==
        "PASTE_YOUR_GEMINI_API_KEY_HERE"
) {
    $url =
        "https://generativelanguage.googleapis.com/v1beta/models/" .
        "gemini-2.5-flash:generateContent?key=" .
        urlencode($apiKey);

    $payload = [
        "contents" => [
            [
                "parts" => [
                    [
                        "text" => $prompt
                    ]
                ]
            ]
        ],
        "generationConfig" => [
            "temperature" => 0.7,
            "responseMimeType" =>
                "application/json"
        ]
    ];

    $options = [
        "http" => [
            "header" =>
                "Content-Type: application/json\r\n",
            "method" => "POST",
            "content" =>
                json_encode($payload),
            "ignore_errors" => true,
            "timeout" => 45
        ]
    ];

    $context =
        stream_context_create($options);

    $response =
        @file_get_contents(
            $url,
            false,
            $context
        );

    if ($response !== false) {
        $result =
            json_decode($response, true);

        $aiText =
            $result["candidates"][0]
                ["content"]["parts"][0]
                ["text"]
            ?? "";

        $aiText = trim($aiText);

        $aiText = preg_replace(
            '/^```json\s*|\s*```$/',
            "",
            $aiText
        );

        $parsedPlan =
            json_decode($aiText, true);

        if (
            is_array($parsedPlan) &&
            !empty(
                $parsedPlan["plan_title"]
            ) &&
            !empty(
                $parsedPlan["summary"]
            ) &&
            isset(
                $parsedPlan["tasks"]
            ) &&
            is_array(
                $parsedPlan["tasks"]
            ) &&
            count(
                $parsedPlan["tasks"]
            ) === 7
        ) {
            $generatedPlan =
                $parsedPlan;

            $recommendationSource =
                "ai";
        }
    }
}

/*
|--------------------------------------------------------------------------
| Use Fallback When AI Fails
|--------------------------------------------------------------------------
*/

if ($generatedPlan === null) {
    $generatedPlan = [
        "plan_title" =>
            $fallbackTitle,
        "summary" =>
            $fallbackSummary,
        "tasks" => []
    ];

    foreach (
        $fallbackTasks as $index => $task
    ) {
        $generatedPlan["tasks"][] = [
            "day_number" =>
                $index + 1,
            "title" =>
                $task["title"],
            "description" =>
                $task["description"],
            "activity_type" =>
                $task["activity_type"],
            "duration_minutes" =>
                $task["duration_minutes"]
        ];
    }

    $recommendationSource =
        "fallback";
}

/*
|--------------------------------------------------------------------------
| Validate and Sanitize Seven Tasks
|--------------------------------------------------------------------------
*/

$sanitizedTasks = [];

foreach (
    $generatedPlan["tasks"] as
    $index => $task
) {
    if ($index >= 7) {
        break;
    }

    $dayNumber = $index + 1;

    $taskTitle = trim(
        $task["title"] ??
        "Wellness Activity"
    );

    $taskDescription = trim(
        $task["description"] ??
        "Complete a short wellness activity today."
    );

    $activityType = strtolower(
        trim(
            $task["activity_type"] ??
            "general"
        )
    );

    $activityType = preg_replace(
        '/[^a-z0-9_-]/',
        "_",
        $activityType
    );

    $durationMinutes =
        (int) (
            $task[
                "duration_minutes"
            ] ?? 5
        );

    if ($durationMinutes < 2) {
        $durationMinutes = 2;
    }

    if ($durationMinutes > 30) {
        $durationMinutes = 30;
    }

    $sanitizedTasks[] = [
        "day_number" =>
            $dayNumber,
        "title" =>
            mb_substr(
                $taskTitle,
                0,
                180
            ),
        "description" =>
            $taskDescription,
        "activity_type" =>
            mb_substr(
                $activityType,
                0,
                60
            ),
        "duration_minutes" =>
            $durationMinutes
    ];
}

if (count($sanitizedTasks) !== 7) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "The wellness plan could not produce seven valid tasks."
    ]);

    $conn->close();
    exit;
}

/*
|--------------------------------------------------------------------------
| Plan Dates
|--------------------------------------------------------------------------
*/

$startDate =
    date("Y-m-d");

$endDate =
    date(
        "Y-m-d",
        strtotime(
            $startDate . " +6 days"
        )
    );

$planTitle = trim(
    $generatedPlan["plan_title"] ??
    $fallbackTitle
);

$planSummary = trim(
    $generatedPlan["summary"] ??
    $fallbackSummary
);

if ($planTitle === "") {
    $planTitle = $fallbackTitle;
}

if ($planSummary === "") {
    $planSummary =
        $fallbackSummary;
}

/*
|--------------------------------------------------------------------------
| Save Plan and Tasks Using Transaction
|--------------------------------------------------------------------------
*/

$conn->begin_transaction();

try {
    $planStmt = $conn->prepare(
        "INSERT INTO wellness_plans (
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
            recommendation_source
        )
        VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
            'active', 0, ?
        )"
    );

    if (!$planStmt) {
        throw new Exception(
            "Could not prepare wellness plan query: " .
            $conn->error
        );
    }

    $assessmentScore =
        (float) $assessment["score"];

    $planStmt->bind_param(
        "iisssdsssss",
        $userId,
        $assessmentId,
        $planTitle,
        $category,
        $categoryName,
        $assessmentScore,
        $wellnessLevel,
        $planSummary,
        $startDate,
        $endDate,
        $recommendationSource
    );

    if (!$planStmt->execute()) {
        throw new Exception(
            "Could not save wellness plan: " .
            $planStmt->error
        );
    }

    $planId =
        $planStmt->insert_id;

    $planStmt->close();

    $taskStmt = $conn->prepare(
        "INSERT INTO wellness_plan_tasks (
            plan_id,
            user_id,
            day_number,
            task_date,
            task_title,
            task_description,
            activity_type,
            duration_minutes,
            status
        )
        VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?,
            'pending'
        )"
    );

    if (!$taskStmt) {
        throw new Exception(
            "Could not prepare plan task query: " .
            $conn->error
        );
    }

    $savedTasks = [];

    foreach (
        $sanitizedTasks as $task
    ) {
        $dayNumber =
            (int) $task["day_number"];

        $taskDate =
            date(
                "Y-m-d",
                strtotime(
                    $startDate .
                    " +" .
                    ($dayNumber - 1) .
                    " days"
                )
            );

        $taskTitle =
            $task["title"];

        $taskDescription =
            $task["description"];

        $activityType =
            $task["activity_type"];

        $durationMinutes =
            (int) $task[
                "duration_minutes"
            ];

        $taskStmt->bind_param(
            "iiissssi",
            $planId,
            $userId,
            $dayNumber,
            $taskDate,
            $taskTitle,
            $taskDescription,
            $activityType,
            $durationMinutes
        );

        if (!$taskStmt->execute()) {
            throw new Exception(
                "Could not save Day " .
                $dayNumber .
                " task: " .
                $taskStmt->error
            );
        }

        $savedTasks[] = [
            "id" =>
                $taskStmt->insert_id,
            "day_number" =>
                $dayNumber,
            "task_date" =>
                $taskDate,
            "title" =>
                $taskTitle,
            "description" =>
                $taskDescription,
            "activity_type" =>
                $activityType,
            "duration_minutes" =>
                $durationMinutes,
            "status" => "pending"
        ];
    }

    $taskStmt->close();

    $conn->commit();

    echo json_encode([
        "success" => true,
        "already_exists" => false,
        "message" =>
            "Your personalized 7-day wellness plan was created successfully.",
        "source" =>
            $recommendationSource,
        "plan" => [
            "id" => $planId,
            "assessment_id" =>
                $assessmentId,
            "plan_title" =>
                $planTitle,
            "category" =>
                $category,
            "category_name" =>
                $categoryName,
            "assessment_score" =>
                $assessmentScore,
            "wellness_level" =>
                $wellnessLevel,
            "summary" =>
                $planSummary,
            "start_date" =>
                $startDate,
            "end_date" =>
                $endDate,
            "status" => "active",
            "progress_percentage" => 0,
            "recommendation_source" =>
                $recommendationSource,
            "tasks" =>
                $savedTasks
        ]
    ], JSON_UNESCAPED_UNICODE |
       JSON_UNESCAPED_SLASHES);
} catch (Throwable $error) {
    $conn->rollback();

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "The wellness plan could not be saved.",
        "error" =>
            $error->getMessage()
    ]);
}

$conn->close();