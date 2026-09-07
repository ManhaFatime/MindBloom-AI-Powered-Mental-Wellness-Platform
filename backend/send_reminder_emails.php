<?php

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/config.php";
require_once __DIR__ . "/mail_config.php";

date_default_timezone_set("Asia/Karachi");

$today = date("Y-m-d");

$response = [
    "success" => true,
    "date" => $today,
    "checked" => 0,
    "sent" => 0,
    "failed" => 0,
    "skipped" => 0,
    "results" => []
];

/*
|--------------------------------------------------------------------------
| Load today's pending reminders that have not received an email
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare(
    "SELECT
        reminders.id,
        reminders.user_id,
        reminders.reminder_type,
        reminders.title,
        reminders.description,
        reminders.reminder_date,
        reminders.reminder_time,
        users.fullname,
        users.email
     FROM reminders
     INNER JOIN users
        ON users.id = reminders.user_id
     WHERE reminders.reminder_date = ?
       AND reminders.status = 'pending'
       AND reminders.email_sent = 0
       AND users.role = 'user'
     ORDER BY
        reminders.reminder_time ASC,
        reminders.id ASC"
);

if (!$stmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare reminder email records"
    ]);

    $conn->close();
    exit;
}

$stmt->bind_param("s", $today);
$stmt->execute();

$result = $stmt->get_result();

while ($reminder = $result->fetch_assoc()) {
    $response["checked"]++;

    $reminderId = (int) $reminder["id"];
    $userName = trim($reminder["fullname"] ?? "");
    $userEmail = trim($reminder["email"] ?? "");
    $reminderType = trim($reminder["reminder_type"] ?? "general");
    $title = trim($reminder["title"] ?? "Wellness Reminder");
    $description = trim($reminder["description"] ?? "");
    $reminderTime = trim($reminder["reminder_time"] ?? "");

    if ($userEmail === "" || !filter_var($userEmail, FILTER_VALIDATE_EMAIL)) {
        $response["skipped"]++;

        $response["results"][] = [
            "reminder_id" => $reminderId,
            "email" => $userEmail,
            "status" => "skipped",
            "message" => "Invalid user email address"
        ];

        continue;
    }

    $typeLabel = "Wellness Reminder";
    $typeEmoji = "🌸";

    if ($reminderType === "exercise") {
        $typeLabel = "Exercise Reminder";
        $typeEmoji = "🧘";
    } elseif ($reminderType === "assessment") {
        $typeLabel = "Assessment Reminder";
        $typeEmoji = "📝";
    }

    $formattedTime = "";

    if ($reminderTime !== "") {
        $timeObject = DateTime::createFromFormat("H:i:s", $reminderTime);

        if ($timeObject) {
            $formattedTime = $timeObject->format("g:i A");
        }
    }

    $safeName = htmlspecialchars(
        $userName !== "" ? $userName : "MindBloom Member",
        ENT_QUOTES,
        "UTF-8"
    );

    $safeTitle = htmlspecialchars($title, ENT_QUOTES, "UTF-8");
    $safeDescription = nl2br(
        htmlspecialchars($description, ENT_QUOTES, "UTF-8")
    );

    $timeHtml = "";

    if ($formattedTime !== "") {
        $timeHtml = "
            <p style=\"margin:8px 0 0;color:#68748b;font-size:14px;\">
                <strong>Scheduled time:</strong> {$formattedTime}
            </p>
        ";
    }

    $descriptionHtml = "";

    if ($description !== "") {
        $descriptionHtml = "
            <div style=\"margin-top:18px;padding:16px;border-radius:16px;background:#f7f5ff;color:#59657b;font-size:14px;line-height:1.7;\">
                {$safeDescription}
            </div>
        ";
    }

    $subject = "{$typeEmoji} {$typeLabel}: {$title}";

    $htmlBody = "
    <!DOCTYPE html>
    <html lang=\"en\">
    <head>
        <meta charset=\"UTF-8\">
        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
        <title>{$typeLabel}</title>
    </head>
    <body style=\"margin:0;padding:0;background:#f2f5fb;font-family:Arial,sans-serif;\">
        <div style=\"max-width:620px;margin:0 auto;padding:28px 16px;\">
            <div style=\"overflow:hidden;border-radius:28px;background:#ffffff;box-shadow:0 18px 50px rgba(120,126,190,0.14);\">
                <div style=\"padding:30px;background:linear-gradient(135deg,#f0edff,#edf7ff,#eaf9f4);\">
                    <div style=\"display:inline-block;padding:8px 14px;border-radius:999px;background:#ffffff;color:#776bc8;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;\">
                        MindBloom Wellness
                    </div>

                    <h1 style=\"margin:22px 0 8px;color:#273149;font-size:30px;line-height:1.25;\">
                        {$typeEmoji} {$typeLabel}
                    </h1>

                    <p style=\"margin:0;color:#68748b;font-size:15px;line-height:1.7;\">
                        Hello {$safeName}, this is your scheduled MindBloom reminder for today.
                    </p>
                </div>

                <div style=\"padding:30px;\">
                    <h2 style=\"margin:0;color:#273149;font-size:24px;\">
                        {$safeTitle}
                    </h2>

                    {$timeHtml}
                    {$descriptionHtml}

                    <div style=\"margin-top:24px;padding:18px;border-radius:18px;background:linear-gradient(135deg,#f3f1ff,#edf7ff);\">
                        <p style=\"margin:0;color:#59657b;font-size:14px;line-height:1.7;\">
                            Take a calm moment, complete your task, and mark it as completed in your wellness plan.
                        </p>
                    </div>

                    <a
                        href=\"http://localhost:8080/wellness-plan\"
                        style=\"display:inline-block;margin-top:24px;padding:13px 22px;border-radius:14px;background:linear-gradient(90deg,#a397ed,#84aaeb,#62bbe0);color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;\"
                    >
                        Open Today's Wellness Plan
                    </a>

                    <p style=\"margin:28px 0 0;color:#8a94a8;font-size:12px;line-height:1.6;\">
                        This email was sent automatically by MindBloom because a wellness reminder was assigned to your account.
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
    ";

    $plainBody =
        "{$typeLabel}\n\n" .
        "Hello " . ($userName !== "" ? $userName : "MindBloom Member") . ",\n\n" .
        "Today's task: {$title}\n" .
        ($formattedTime !== "" ? "Scheduled time: {$formattedTime}\n" : "") .
        ($description !== "" ? "\n{$description}\n" : "") .
        "\nOpen your wellness plan: http://localhost:8080/wellness-plan";

    try {
        $mail = createMindBloomMailer();

        $mail->addAddress(
            $userEmail,
            $userName !== "" ? $userName : "MindBloom Member"
        );

        $mail->Subject = $subject;
        $mail->Body = $htmlBody;
        $mail->AltBody = $plainBody;

        $mail->send();

        $updateStmt = $conn->prepare(
            "UPDATE reminders
             SET email_sent = 1
             WHERE id = ?
               AND email_sent = 0"
        );

        if (!$updateStmt) {
            throw new Exception(
                "Email was sent but email status could not be updated"
            );
        }

        $updateStmt->bind_param("i", $reminderId);
        $updateStmt->execute();
        $updateStmt->close();

        $response["sent"]++;

        $response["results"][] = [
            "reminder_id" => $reminderId,
            "email" => $userEmail,
            "status" => "sent"
        ];
    } catch (Throwable $error) {
        $response["failed"]++;

        $response["results"][] = [
            "reminder_id" => $reminderId,
            "email" => $userEmail,
            "status" => "failed",
            "message" => $error->getMessage()
        ];
    }
}

$stmt->close();
$conn->close();

if ($response["failed"] > 0) {
    $response["success"] = false;
}

echo json_encode(
    $response,
    JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
);