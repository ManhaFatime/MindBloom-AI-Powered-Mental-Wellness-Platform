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
require_once __DIR__ . "/../mail_config.php";

$userId = (int) ($_POST["user_id"] ?? 0);
$email = strtolower(trim($_POST["email"] ?? ""));
$fullname = trim($_POST["fullname"] ?? "");

if ($userId <= 0 || $email === "" || $fullname === "") {
    echo json_encode([
        "success" => false,
        "message" => "User ID, name and email are required"
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

if (strlen($fullname) < 3) {
    echo json_encode([
        "success" => false,
        "message" => "Full name must contain at least 3 characters"
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Find and verify normal user
|--------------------------------------------------------------------------
*/

$userStmt = $conn->prepare(
    "SELECT
        id,
        fullname,
        email,
        role,
        profile_image
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
        "message" => "Unable to prepare user verification"
    ]);

    exit;
}

$userStmt->bind_param(
    "is",
    $userId,
    $email
);

$userStmt->execute();

$userResult = $userStmt->get_result();

if ($userResult->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "User account was not found"
    ]);

    $userStmt->close();
    $conn->close();

    exit;
}

$user = $userResult->fetch_assoc();

$userStmt->close();

/*
|--------------------------------------------------------------------------
| Optional profile image
|--------------------------------------------------------------------------
*/

$oldProfileImage = $user["profile_image"] ?? "";
$profileImage = $oldProfileImage;
$profileImageChanged = false;

if (
    isset($_FILES["profile_image"]) &&
    $_FILES["profile_image"]["error"] !== UPLOAD_ERR_NO_FILE
) {
    if ($_FILES["profile_image"]["error"] !== UPLOAD_ERR_OK) {
        echo json_encode([
            "success" => false,
            "message" => "Profile image upload failed"
        ]);

        $conn->close();
        exit;
    }

    $maximumSize = 5 * 1024 * 1024;

    if ($_FILES["profile_image"]["size"] > $maximumSize) {
        echo json_encode([
            "success" => false,
            "message" => "Profile image must be smaller than 5 MB"
        ]);

        $conn->close();
        exit;
    }

    $allowedTypes = [
        "image/jpeg" => "jpg",
        "image/png" => "png",
        "image/webp" => "webp"
    ];

    $fileInfo = finfo_open(FILEINFO_MIME_TYPE);

    if (!$fileInfo) {
        echo json_encode([
            "success" => false,
            "message" => "Unable to validate profile image"
        ]);

        $conn->close();
        exit;
    }

    $mimeType = finfo_file(
        $fileInfo,
        $_FILES["profile_image"]["tmp_name"]
    );

    finfo_close($fileInfo);

    if (!isset($allowedTypes[$mimeType])) {
        echo json_encode([
            "success" => false,
            "message" => "Only JPG, PNG and WEBP images are allowed"
        ]);

        $conn->close();
        exit;
    }

    $uploadDirectory =
        __DIR__ . "/../uploads/profiles/";

    if (!is_dir($uploadDirectory)) {
        if (!mkdir($uploadDirectory, 0775, true)) {
            echo json_encode([
                "success" => false,
                "message" => "Unable to create profile image folder"
            ]);

            $conn->close();
            exit;
        }
    }

    $fileName =
        uniqid("user_profile_", true) .
        "." .
        $allowedTypes[$mimeType];

    $targetPath =
        $uploadDirectory . $fileName;

    if (
        !move_uploaded_file(
            $_FILES["profile_image"]["tmp_name"],
            $targetPath
        )
    ) {
        echo json_encode([
            "success" => false,
            "message" => "Unable to save profile image"
        ]);

        $conn->close();
        exit;
    }

    $profileImage =
        "uploads/profiles/" . $fileName;

    $profileImageChanged = true;
}

/*
|--------------------------------------------------------------------------
| Update user profile
|--------------------------------------------------------------------------
*/

$updateStmt = $conn->prepare(
    "UPDATE users
     SET
        fullname = ?,
        profile_image = ?
     WHERE id = ?
       AND email = ?
       AND role = 'user'"
);

if (!$updateStmt) {
    if ($profileImageChanged && $profileImage !== "") {
        $newImagePath =
            __DIR__ . "/../" . $profileImage;

        if (file_exists($newImagePath)) {
            unlink($newImagePath);
        }
    }

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare profile update"
    ]);

    $conn->close();
    exit;
}

$updateStmt->bind_param(
    "ssis",
    $fullname,
    $profileImage,
    $userId,
    $email
);

if (!$updateStmt->execute()) {
    if ($profileImageChanged && $profileImage !== "") {
        $newImagePath =
            __DIR__ . "/../" . $profileImage;

        if (file_exists($newImagePath)) {
            unlink($newImagePath);
        }
    }

    $updateStmt->close();
    $conn->close();

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Profile could not be updated"
    ]);

    exit;
}

$updateStmt->close();

/*
|--------------------------------------------------------------------------
| Delete old profile image
|--------------------------------------------------------------------------
*/

if (
    $profileImageChanged &&
    $oldProfileImage !== ""
) {
    $oldImagePath =
        __DIR__ . "/../" .
        $oldProfileImage;

    if (file_exists($oldImagePath)) {
        unlink($oldImagePath);
    }
}

$conn->close();

/*
|--------------------------------------------------------------------------
| Send profile update confirmation email
|--------------------------------------------------------------------------
*/

date_default_timezone_set("Asia/Karachi");

$updateDate = date("d F Y");
$updateTime = date("h:i A");

$emailSent = false;

try {
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

    $updatedDetails = $profileImageChanged
        ? "Your display name and profile picture were updated."
        : "Your display name was updated.";

    $mail = createMindBloomMailer();

    $mail->addAddress(
        $email,
        $fullname
    );

    $mail->Subject =
        "Your MindBloom Profile Was Updated";

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
                        PROFILE UPDATE
                    </div>

                    <h1 style="
                        margin: 22px 0 8px;
                        color: #273149;
                        font-size: 32px;
                    ">
                        Profile Updated Successfully 🌸
                    </h1>

                    <p style="
                        margin: 0;
                        color: #65718a;
                        font-size: 15px;
                        line-height: 1.7;
                    ">
                        Your MindBloom account information has been updated.
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
                        ' . $updatedDetails . '
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
                                    padding: 9px 0;
                                    font-weight: bold;
                                    color: #4f5b73;
                                ">
                                    Name
                                </td>

                                <td style="
                                    padding: 9px 0;
                                    text-align: right;
                                ">
                                    ' . $safeName . '
                                </td>
                            </tr>

                            <tr>
                                <td style="
                                    padding: 9px 0;
                                    font-weight: bold;
                                    color: #4f5b73;
                                ">
                                    Email
                                </td>

                                <td style="
                                    padding: 9px 0;
                                    text-align: right;
                                ">
                                    ' . $safeEmail . '
                                </td>
                            </tr>

                            <tr>
                                <td style="
                                    padding: 9px 0;
                                    font-weight: bold;
                                    color: #4f5b73;
                                ">
                                    Updated Date
                                </td>

                                <td style="
                                    padding: 9px 0;
                                    text-align: right;
                                ">
                                    ' . $updateDate . '
                                </td>
                            </tr>

                            <tr>
                                <td style="
                                    padding: 9px 0;
                                    font-weight: bold;
                                    color: #4f5b73;
                                ">
                                    Updated Time
                                </td>

                                <td style="
                                    padding: 9px 0;
                                    text-align: right;
                                ">
                                    ' . $updateTime . '
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
                            Security notice
                        </p>

                        <p style="
                            margin: 8px 0 0;
                            color: #65718a;
                            font-size: 13px;
                            line-height: 1.7;
                        ">
                            If you did not make this change, please secure
                            your account immediately.
                        </p>
                    </div>

                    <div style="
                        margin-top: 28px;
                        text-align: center;
                    ">
                        <a
                            href="http://localhost:8080/profile"
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
                            View Your Profile
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
        "Hello {$fullname}, your MindBloom profile was updated successfully on {$updateDate} at {$updateTime}. If you did not make this change, please secure your account.";

    $mail->send();

    $emailSent = true;
} catch (Throwable $error) {
    error_log(
        "MindBloom profile update email error: " .
        $error->getMessage()
    );
}

/*
|--------------------------------------------------------------------------
| Final response
|--------------------------------------------------------------------------
*/

echo json_encode([
    "success" => true,
    "message" => "Profile updated successfully",
    "profile_email_sent" => $emailSent,
    "user" => [
        "id" => $userId,
        "fullname" => $fullname,
        "email" => $email,
        "role" => "user",
        "profile_image" => $profileImage
    ]
]);