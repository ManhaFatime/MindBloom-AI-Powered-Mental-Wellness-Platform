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

require_once __DIR__ . "/config.php";
require_once __DIR__ . "/mail_config.php";

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

$fullname = trim(
    $data["fullname"] ?? ""
);

$email = strtolower(
    trim($data["email"] ?? "")
);

$subject = trim(
    $data["subject"] ?? ""
);

$message = trim(
    $data["message"] ?? ""
);

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

if (
    $fullname === "" ||
    $email === "" ||
    $subject === "" ||
    $message === ""
) {
    echo json_encode([
        "success" => false,
        "message" => "Name, email, subject and message are required"
    ]);

    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "success" => false,
        "message" => "Please enter a valid email address"
    ]);

    exit;
}

if (strlen($fullname) > 120) {
    echo json_encode([
        "success" => false,
        "message" => "Name is too long"
    ]);

    exit;
}

if (strlen($subject) > 180) {
    echo json_encode([
        "success" => false,
        "message" => "Subject is too long"
    ]);

    exit;
}

if (strlen($message) < 10) {
    echo json_encode([
        "success" => false,
        "message" => "Message must contain at least 10 characters"
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Verify optional logged-in user
|--------------------------------------------------------------------------
*/

$verifiedUserId = null;

if ($userId > 0) {
    $userStmt = $conn->prepare(
        "SELECT id
         FROM users
         WHERE id = ?
           AND role = 'user'
         LIMIT 1"
    );

    if ($userStmt) {
        $userStmt->bind_param(
            "i",
            $userId
        );

        $userStmt->execute();

        $userResult =
            $userStmt->get_result();

        if ($userResult->num_rows > 0) {
            $verifiedUserId = $userId;
        }

        $userStmt->close();
    }
}

/*
|--------------------------------------------------------------------------
| Save message in database
|--------------------------------------------------------------------------
*/

$insertStmt = $conn->prepare(
    "INSERT INTO contact_messages
        (
            user_id,
            fullname,
            email,
            subject,
            message,
            status
        )
     VALUES
        (?, ?, ?, ?, ?, 'unread')"
);

if (!$insertStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare contact message"
    ]);

    $conn->close();
    exit;
}

$insertStmt->bind_param(
    "issss",
    $verifiedUserId,
    $fullname,
    $email,
    $subject,
    $message
);

if (!$insertStmt->execute()) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Your message could not be saved"
    ]);

    $insertStmt->close();
    $conn->close();

    exit;
}

$messageId = $insertStmt->insert_id;

$insertStmt->close();

/*
|--------------------------------------------------------------------------
| Send email to MindBloom Gmail
|--------------------------------------------------------------------------
*/

$emailSent = false;
$emailError = "";

try {
    $mail = createMindBloomMailer();

    $mail->addAddress(
        "mindbloomaichatbot@gmail.com",
        "MindBloom Administration"
    );

    $mail->addReplyTo(
        $email,
        $fullname
    );

    $mail->Subject =
        "New Contact Message: " . $subject;

    $safeName = htmlspecialchars(
        $fullname,
        ENT_QUOTES,
        "UTF-8"
    );

    $safeEmail = htmlspecialchars(
        $email,
        ENT_QUOTES,
        "UTF-8"
    );

    $safeSubject = htmlspecialchars(
        $subject,
        ENT_QUOTES,
        "UTF-8"
    );

    $safeMessage = nl2br(
        htmlspecialchars(
            $message,
            ENT_QUOTES,
            "UTF-8"
        )
    );

    $submittedAt = date(
        "d M Y, h:i A"
    );

    $mail->Body = "
    <!DOCTYPE html>
    <html lang=\"en\">
    <head>
        <meta charset=\"UTF-8\">
        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
        <title>New Contact Message</title>
    </head>

    <body style=\"margin:0;padding:0;background:#f2f5fb;font-family:Arial,sans-serif;\">
        <div style=\"max-width:640px;margin:0 auto;padding:28px 16px;\">
            <div style=\"overflow:hidden;border-radius:26px;background:#ffffff;box-shadow:0 18px 50px rgba(120,126,190,0.14);\">

                <div style=\"padding:30px;background:linear-gradient(135deg,#f0edff,#edf7ff,#eaf9f4);\">
                    <div style=\"display:inline-block;padding:8px 14px;border-radius:999px;background:#ffffff;color:#776bc8;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;\">
                        MindBloom Contact
                    </div>

                    <h1 style=\"margin:22px 0 8px;color:#273149;font-size:30px;\">
                        New Contact Message
                    </h1>

                    <p style=\"margin:0;color:#68748b;font-size:15px;line-height:1.7;\">
                        A new message was submitted through the MindBloom website.
                    </p>
                </div>

                <div style=\"padding:30px;\">
                    <div style=\"padding:18px;border-radius:18px;background:#f7f5ff;\">
                        <p style=\"margin:0 0 10px;color:#59657b;font-size:14px;\">
                            <strong>Name:</strong> {$safeName}
                        </p>

                        <p style=\"margin:0 0 10px;color:#59657b;font-size:14px;\">
                            <strong>Email:</strong> {$safeEmail}
                        </p>

                        <p style=\"margin:0 0 10px;color:#59657b;font-size:14px;\">
                            <strong>Subject:</strong> {$safeSubject}
                        </p>

                        <p style=\"margin:0;color:#59657b;font-size:14px;\">
                            <strong>Submitted:</strong> {$submittedAt}
                        </p>
                    </div>

                    <div style=\"margin-top:20px;padding:20px;border-radius:18px;background:#edf7ff;color:#4f5b73;font-size:14px;line-height:1.8;\">
                        {$safeMessage}
                    </div>

                    <p style=\"margin:24px 0 0;color:#8a94a8;font-size:12px;line-height:1.6;\">
                        This message is also saved in the MindBloom admin dashboard.
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
    ";

    $mail->AltBody =
        "New MindBloom Contact Message\n\n" .
        "Name: {$fullname}\n" .
        "Email: {$email}\n" .
        "Subject: {$subject}\n\n" .
        "Message:\n{$message}\n\n" .
        "Submitted: {$submittedAt}";

    $mail->send();

    $emailSent = true;
} catch (Throwable $error) {
    $emailError = $error->getMessage();
}

$conn->close();

echo json_encode([
    "success" => true,
    "message" => "Your message has been sent successfully",
    "message_id" => $messageId,
    "email_sent" => $emailSent,
    "email_error" => $emailSent
        ? ""
        : $emailError
]);