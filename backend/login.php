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

$email = strtolower(
    trim($data["email"] ?? "")
);

$password = $data["password"] ?? "";

if ($email === "" || $password === "") {
    echo json_encode([
        "success" => false,
        "message" => "Email and password are required"
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

/*
|--------------------------------------------------------------------------
| Find User
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare(
    "SELECT
        id,
        fullname,
        email,
        password,
        role,
        profile_image
     FROM users
     WHERE email = ?
     LIMIT 1"
);

if (!$stmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to process login request"
    ]);

    exit;
}

$stmt->bind_param("s", $email);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $stmt->close();
    $conn->close();

    echo json_encode([
        "success" => false,
        "message" => "Invalid email or password"
    ]);

    exit;
}

$user = $result->fetch_assoc();

/*
|--------------------------------------------------------------------------
| Verify Password
|--------------------------------------------------------------------------
*/

if (!password_verify($password, $user["password"])) {
    $stmt->close();
    $conn->close();

    echo json_encode([
        "success" => false,
        "message" => "Invalid email or password"
    ]);

    exit;
}

$stmt->close();
$conn->close();

/*
|--------------------------------------------------------------------------
| Prepare Login Information
|--------------------------------------------------------------------------
*/

date_default_timezone_set("Asia/Karachi");

$loginDate = date("d F Y");
$loginTime = date("h:i A");

$ipAddress =
    $_SERVER["HTTP_X_FORWARDED_FOR"] ??
    $_SERVER["REMOTE_ADDR"] ??
    "Unavailable";

if (str_contains($ipAddress, ",")) {
    $ipAddress = trim(
        explode(",", $ipAddress)[0]
    );
}

$browserInfo =
    $_SERVER["HTTP_USER_AGENT"] ??
    "Unknown browser or device";

$emailSent = false;

/*
|--------------------------------------------------------------------------
| Send Login Notification Email
|--------------------------------------------------------------------------
*/

try {
    $safeName = htmlspecialchars(
        $user["fullname"],
        ENT_QUOTES,
        "UTF-8"
    );

    $safeEmail = htmlspecialchars(
        $user["email"],
        ENT_QUOTES,
        "UTF-8"
    );

    $safeRole = htmlspecialchars(
        ucfirst($user["role"]),
        ENT_QUOTES,
        "UTF-8"
    );

    $safeIpAddress = htmlspecialchars(
        $ipAddress,
        ENT_QUOTES,
        "UTF-8"
    );

    $safeBrowserInfo = htmlspecialchars(
        $browserInfo,
        ENT_QUOTES,
        "UTF-8"
    );

    $mail = createMindBloomMailer();

    $mail->addAddress(
        $user["email"],
        $user["fullname"]
    );

    $mail->Subject =
        "New Login to Your MindBloom Account";

    $mail->Body = '
        <div style="
            margin: 0;
            padding: 35px 15px;
            background-color: #f4f2ff;
            font-family: Arial, Helvetica, sans-serif;
        ">
            <div style="
                max-width: 620px;
                margin: 0 auto;
                overflow: hidden;
                border: 1px solid #e2def5;
                border-radius: 26px;
                background-color: #ffffff;
                box-shadow: 0 18px 45px rgba(120,126,190,0.14);
            ">
                <div style="
                    padding: 34px 30px;
                    text-align: center;
                    background: linear-gradient(
                        135deg,
                        #f0edff,
                        #edf7ff,
                        #eaf9f4
                    );
                ">
                    <div style="
                        display: inline-block;
                        padding: 10px 18px;
                        border-radius: 999px;
                        background-color: rgba(255,255,255,0.78);
                        color: #8174d2;
                        font-size: 13px;
                        font-weight: bold;
                    ">
                        ACCOUNT SECURITY
                    </div>

                    <h1 style="
                        margin: 22px 0 8px;
                        color: #273149;
                        font-size: 32px;
                        line-height: 1.2;
                    ">
                        New Login Detected
                    </h1>

                    <p style="
                        margin: 0;
                        color: #65718a;
                        font-size: 15px;
                        line-height: 1.7;
                    ">
                        Your MindBloom account was accessed successfully.
                    </p>
                </div>

                <div style="
                    padding: 34px 32px;
                ">
                    <h2 style="
                        margin: 0;
                        color: #273149;
                        font-size: 22px;
                    ">
                        Hello ' . $safeName . ',
                    </h2>

                    <p style="
                        margin: 18px 0 0;
                        color: #65718a;
                        font-size: 15px;
                        line-height: 1.8;
                    ">
                        We are letting you know that a successful login
                        was made to your MindBloom account.
                    </p>

                    <div style="
                        margin-top: 26px;
                        padding: 22px;
                        border: 1px solid #e2def5;
                        border-radius: 18px;
                        background: linear-gradient(
                            135deg,
                            #f8f6ff,
                            #f3f9ff,
                            #f1faf7
                        );
                    ">
                        <table style="
                            width: 100%;
                            border-collapse: collapse;
                            color: #65718a;
                            font-size: 14px;
                        ">
                            <tr>
                                <td style="
                                    padding: 8px 0;
                                    font-weight: bold;
                                    color: #4f5b73;
                                ">
                                    Account
                                </td>

                                <td style="
                                    padding: 8px 0;
                                    text-align: right;
                                ">
                                    ' . $safeEmail . '
                                </td>
                            </tr>

                            <tr>
                                <td style="
                                    padding: 8px 0;
                                    font-weight: bold;
                                    color: #4f5b73;
                                ">
                                    Role
                                </td>

                                <td style="
                                    padding: 8px 0;
                                    text-align: right;
                                ">
                                    ' . $safeRole . '
                                </td>
                            </tr>

                            <tr>
                                <td style="
                                    padding: 8px 0;
                                    font-weight: bold;
                                    color: #4f5b73;
                                ">
                                    Date
                                </td>

                                <td style="
                                    padding: 8px 0;
                                    text-align: right;
                                ">
                                    ' . $loginDate . '
                                </td>
                            </tr>

                            <tr>
                                <td style="
                                    padding: 8px 0;
                                    font-weight: bold;
                                    color: #4f5b73;
                                ">
                                    Time
                                </td>

                                <td style="
                                    padding: 8px 0;
                                    text-align: right;
                                ">
                                    ' . $loginTime . '
                                </td>
                            </tr>

                            <tr>
                                <td style="
                                    padding: 8px 0;
                                    font-weight: bold;
                                    color: #4f5b73;
                                ">
                                    IP Address
                                </td>

                                <td style="
                                    padding: 8px 0;
                                    text-align: right;
                                ">
                                    ' . $safeIpAddress . '
                                </td>
                            </tr>
                        </table>
                    </div>

                    <div style="
                        margin-top: 22px;
                        padding: 18px;
                        border: 1px solid #d9eee7;
                        border-radius: 16px;
                        background-color: #effaf6;
                    ">
                        <p style="
                            margin: 0;
                            color: #4f5b73;
                            font-size: 14px;
                            font-weight: bold;
                        ">
                            Was this you?
                        </p>

                        <p style="
                            margin: 8px 0 0;
                            color: #65718a;
                            font-size: 13px;
                            line-height: 1.7;
                        ">
                            No action is required if you recognize this login.
                            If you did not log in, please secure your account
                            and change your password immediately.
                        </p>
                    </div>

                    <div style="
                        margin-top: 22px;
                        padding: 16px;
                        border-radius: 16px;
                        background-color: #f7f7fb;
                    ">
                        <p style="
                            margin: 0;
                            color: #8791a4;
                            font-size: 12px;
                            line-height: 1.6;
                            word-break: break-word;
                        ">
                            Device information: ' . $safeBrowserInfo . '
                        </p>
                    </div>

                    <div style="
                        margin-top: 28px;
                        text-align: center;
                    ">
                        <a
                            href="http://localhost:8080/dashboard"
                            style="
                                display: inline-block;
                                padding: 14px 28px;
                                border-radius: 14px;
                                background: linear-gradient(
                                    90deg,
                                    #a397ed,
                                    #84aaeb,
                                    #62bbe0
                                );
                                color: #ffffff;
                                font-size: 15px;
                                font-weight: bold;
                                text-decoration: none;
                            "
                        >
                            Open MindBloom
                        </a>
                    </div>
                </div>

                <div style="
                    padding: 20px 25px;
                    text-align: center;
                    background-color: #f7f7fb;
                    color: #8791a4;
                    font-size: 12px;
                ">
                    © MindBloom Wellness. This is an automatic security email.
                </div>
            </div>
        </div>
    ';

    $mail->AltBody =
        "Hello {$user["fullname"]}, a successful login was made to your MindBloom account on {$loginDate} at {$loginTime}. If this was not you, please secure your account immediately.";

    $mail->send();

    $emailSent = true;
} catch (Throwable $error) {
    error_log(
        "MindBloom login email error: " .
        $error->getMessage()
    );
}

/*
|--------------------------------------------------------------------------
| Login Response
|--------------------------------------------------------------------------
*/

echo json_encode([
    "success" => true,
    "message" => "Login successful",
    "login_email_sent" => $emailSent,
    "user" => [
        "id" => (int) $user["id"],
        "fullname" => $user["fullname"],
        "email" => $user["email"],
        "role" => $user["role"],
        "profile_image" =>
            $user["profile_image"] ?? ""
    ]
]);