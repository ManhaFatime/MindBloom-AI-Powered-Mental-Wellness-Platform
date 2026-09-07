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

$fullname = trim($_POST["fullname"] ?? "");
$email = strtolower(trim($_POST["email"] ?? ""));
$password = $_POST["password"] ?? "";

if (
    $fullname === "" ||
    $email === "" ||
    $password === ""
) {
    echo json_encode([
        "success" => false,
        "message" => "All fields are required"
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

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "success" => false,
        "message" => "Please enter a valid email address"
    ]);

    exit;
}

if (strlen($password) < 6) {
    echo json_encode([
        "success" => false,
        "message" => "Password must contain at least 6 characters"
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Check Existing Email
|--------------------------------------------------------------------------
*/

$checkStmt = $conn->prepare(
    "SELECT id
     FROM users
     WHERE email = ?
     LIMIT 1"
);

if (!$checkStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to process registration request"
    ]);

    exit;
}

$checkStmt->bind_param("s", $email);
$checkStmt->execute();

$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows > 0) {
    echo json_encode([
        "success" => false,
        "message" => "An account with this email already exists"
    ]);

    $checkStmt->close();
    $conn->close();

    exit;
}

$checkStmt->close();

/*
|--------------------------------------------------------------------------
| Profile Image Upload
|--------------------------------------------------------------------------
*/

$profileImage = "";

if (
    isset($_FILES["profile_image"]) &&
    $_FILES["profile_image"]["error"] !== UPLOAD_ERR_NO_FILE
) {
    if (
        $_FILES["profile_image"]["error"] !==
        UPLOAD_ERR_OK
    ) {
        echo json_encode([
            "success" => false,
            "message" => "Profile image upload failed"
        ]);

        exit;
    }

    $maxFileSize = 5 * 1024 * 1024;

    if (
        $_FILES["profile_image"]["size"] >
        $maxFileSize
    ) {
        echo json_encode([
            "success" => false,
            "message" => "Profile image must be smaller than 5 MB"
        ]);

        exit;
    }

    $allowedMimeTypes = [
        "image/jpeg" => "jpg",
        "image/png" => "png",
        "image/webp" => "webp"
    ];

    $fileInfo = finfo_open(
        FILEINFO_MIME_TYPE
    );

    if (!$fileInfo) {
        echo json_encode([
            "success" => false,
            "message" => "Unable to validate profile image"
        ]);

        exit;
    }

    $mimeType = finfo_file(
        $fileInfo,
        $_FILES["profile_image"]["tmp_name"]
    );

    finfo_close($fileInfo);

    if (!isset($allowedMimeTypes[$mimeType])) {
        echo json_encode([
            "success" => false,
            "message" => "Only JPG, PNG and WEBP images are allowed"
        ]);

        exit;
    }

    $uploadFolder =
        __DIR__ . "/uploads/profiles/";

    if (!is_dir($uploadFolder)) {
        $folderCreated = mkdir(
            $uploadFolder,
            0775,
            true
        );

        if (!$folderCreated) {
            echo json_encode([
                "success" => false,
                "message" => "Unable to create profile image folder"
            ]);

            exit;
        }
    }

    $extension =
        $allowedMimeTypes[$mimeType];

    $fileName =
        uniqid("profile_", true) .
        "." .
        $extension;

    $absoluteTarget =
        $uploadFolder . $fileName;

    if (
        !move_uploaded_file(
            $_FILES["profile_image"]["tmp_name"],
            $absoluteTarget
        )
    ) {
        echo json_encode([
            "success" => false,
            "message" => "Unable to save profile image"
        ]);

        exit;
    }

    $profileImage =
        "uploads/profiles/" . $fileName;
}

/*
|--------------------------------------------------------------------------
| Create User Account
|--------------------------------------------------------------------------
*/

$hashedPassword = password_hash(
    $password,
    PASSWORD_DEFAULT
);

if ($hashedPassword === false) {
    if ($profileImage !== "") {
        $uploadedFile =
            __DIR__ . "/" . $profileImage;

        if (file_exists($uploadedFile)) {
            unlink($uploadedFile);
        }
    }

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to secure account password"
    ]);

    exit;
}

$role = "user";

$insertStmt = $conn->prepare(
    "INSERT INTO users
        (
            fullname,
            email,
            password,
            role,
            profile_image
        )
     VALUES
        (?, ?, ?, ?, ?)"
);

if (!$insertStmt) {
    if ($profileImage !== "") {
        $uploadedFile =
            __DIR__ . "/" . $profileImage;

        if (file_exists($uploadedFile)) {
            unlink($uploadedFile);
        }
    }

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to create account"
    ]);

    exit;
}

$insertStmt->bind_param(
    "sssss",
    $fullname,
    $email,
    $hashedPassword,
    $role,
    $profileImage
);

if (!$insertStmt->execute()) {
    if ($profileImage !== "") {
        $uploadedFile =
            __DIR__ . "/" . $profileImage;

        if (file_exists($uploadedFile)) {
            unlink($uploadedFile);
        }
    }

    $insertStmt->close();
    $conn->close();

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Account creation failed"
    ]);

    exit;
}

$newUserId = $insertStmt->insert_id;

$insertStmt->close();
$conn->close();

/*
|--------------------------------------------------------------------------
| Send Welcome Email
|--------------------------------------------------------------------------
*/

$emailSent = false;

try {
    $safeName = htmlspecialchars(
        $fullname,
        ENT_QUOTES,
        "UTF-8"
    );

    $mail = createMindBloomMailer();

    $mail->addAddress(
        $email,
        $fullname
    );

    $mail->Subject =
        "Welcome to MindBloom 🌸";

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
                    padding: 35px 30px;
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
                        MINDBLOOM WELLNESS
                    </div>

                    <h1 style="
                        margin: 22px 0 8px;
                        color: #273149;
                        font-size: 34px;
                        line-height: 1.2;
                    ">
                        Welcome to MindBloom 🌸
                    </h1>

                    <p style="
                        margin: 0;
                        color: #65718a;
                        font-size: 15px;
                        line-height: 1.7;
                    ">
                        Your personal wellness journey starts here.
                    </p>
                </div>

                <div style="
                    padding: 35px 32px;
                ">
                    <h2 style="
                        margin: 0;
                        color: #273149;
                        font-size: 23px;
                    ">
                        Hello ' . $safeName . ',
                    </h2>

                    <p style="
                        margin: 18px 0 0;
                        color: #65718a;
                        font-size: 15px;
                        line-height: 1.8;
                    ">
                        Your MindBloom account has been created successfully.
                        You can now explore wellness activities, record your
                        mood, write gratitude entries and track your personal
                        progress.
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
                        <p style="
                            margin: 0;
                            color: #4f5b73;
                            font-size: 14px;
                            font-weight: bold;
                        ">
                            Your MindBloom account
                        </p>

                        <p style="
                            margin: 10px 0 0;
                            color: #7b869a;
                            font-size: 14px;
                            line-height: 1.7;
                        ">
                            Email: ' . htmlspecialchars(
                                $email,
                                ENT_QUOTES,
                                "UTF-8"
                            ) . '
                        </p>
                    </div>

                    <div style="
                        margin-top: 28px;
                        text-align: center;
                    ">
                        <a
                            href="http://localhost:8080/login"
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
                            Login to MindBloom
                        </a>
                    </div>

                    <p style="
                        margin: 28px 0 0;
                        color: #7b869a;
                        font-size: 13px;
                        line-height: 1.7;
                        text-align: center;
                    ">
                        Take small steps, stay consistent and be kind to
                        yourself throughout your wellness journey.
                    </p>
                </div>

                <div style="
                    padding: 20px 25px;
                    text-align: center;
                    background-color: #f7f7fb;
                    color: #8791a4;
                    font-size: 12px;
                ">
                    © MindBloom Wellness. This is an automatic email.
                </div>
            </div>
        </div>
    ';

    $mail->AltBody =
        "Hello {$fullname}, your MindBloom account has been created successfully. You can now login and begin your wellness journey.";

    $mail->send();

    $emailSent = true;
} catch (Throwable $error) {
    error_log(
        "MindBloom welcome email error: " .
        $error->getMessage()
    );
}

/*
|--------------------------------------------------------------------------
| Final Response
|--------------------------------------------------------------------------
*/

echo json_encode([
    "success" => true,
    "message" =>
        "Your MindBloom account has been created successfully",
    "user_id" => $newUserId,
    "welcome_email_sent" => $emailSent
]);