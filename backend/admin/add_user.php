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

require_once "../config.php";

$fullname = trim($_POST["fullname"] ?? "");
$email = trim($_POST["email"] ?? "");
$password = $_POST["password"] ?? "";
$adminEmail = trim($_POST["admin_email"] ?? "");

if (
    $fullname === "" ||
    $email === "" ||
    $password === "" ||
    $adminEmail === ""
) {
    echo json_encode([
        "success" => false,
        "message" => "Name, email, password and administrator email are required"
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
| Verify administrator
|--------------------------------------------------------------------------
*/

$adminStmt = $conn->prepare(
    "SELECT id, role
     FROM users
     WHERE email = ?
     LIMIT 1"
);

if (!$adminStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to verify administrator"
    ]);

    exit;
}

$adminStmt->bind_param("s", $adminEmail);
$adminStmt->execute();

$adminResult = $adminStmt->get_result();

if ($adminResult->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Administrator account was not found"
    ]);

    $adminStmt->close();
    $conn->close();
    exit;
}

$admin = $adminResult->fetch_assoc();
$adminStmt->close();

if ($admin["role"] !== "admin") {
    echo json_encode([
        "success" => false,
        "message" => "You are not authorized to create users"
    ]);

    $conn->close();
    exit;
}

/*
|--------------------------------------------------------------------------
| Check duplicate email
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
        "message" => "Unable to validate email address"
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
| Optional profile image
|--------------------------------------------------------------------------
*/

$profileImage = "";

if (
    isset($_FILES["profile_image"]) &&
    $_FILES["profile_image"]["error"] !== UPLOAD_ERR_NO_FILE
) {
    if ($_FILES["profile_image"]["error"] !== UPLOAD_ERR_OK) {
        echo json_encode([
            "success" => false,
            "message" => "Profile image upload failed"
        ]);

        exit;
    }

    $maxFileSize = 5 * 1024 * 1024;

    if ($_FILES["profile_image"]["size"] > $maxFileSize) {
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

    $fileInfo = finfo_open(FILEINFO_MIME_TYPE);

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

    $uploadFolder = __DIR__ . "/../uploads/profiles/";

    if (!is_dir($uploadFolder)) {
        mkdir($uploadFolder, 0775, true);
    }

    $fileName =
        uniqid("profile_", true) .
        "." .
        $allowedMimeTypes[$mimeType];

    $absoluteTarget = $uploadFolder . $fileName;

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

    $profileImage = "uploads/profiles/" . $fileName;
}

/*
|--------------------------------------------------------------------------
| Insert normal user
|--------------------------------------------------------------------------
*/

$hashedPassword = password_hash(
    $password,
    PASSWORD_DEFAULT
);

$role = "user";

$insertStmt = $conn->prepare(
    "INSERT INTO users
        (fullname, email, password, role, profile_image)
     VALUES
        (?, ?, ?, ?, ?)"
);

if (!$insertStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare user creation request"
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

if ($insertStmt->execute()) {
    $newUserId = $insertStmt->insert_id;

    echo json_encode([
        "success" => true,
        "message" => "New MindBloom user created successfully",
        "user" => [
            "id" => (int) $newUserId,
            "fullname" => $fullname,
            "email" => $email,
            "role" => "user",
            "profile_image" => $profileImage,
            "created_at" => date("Y-m-d H:i:s")
        ]
    ]);
} else {
    if ($profileImage !== "") {
        $uploadedFile = __DIR__ . "/../" . $profileImage;

        if (file_exists($uploadedFile)) {
            unlink($uploadedFile);
        }
    }

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "User could not be created"
    ]);
}

$insertStmt->close();
$conn->close();