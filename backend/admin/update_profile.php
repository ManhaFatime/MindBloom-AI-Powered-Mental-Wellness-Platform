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

$adminId = (int) ($_POST["admin_id"] ?? 0);
$fullname = trim($_POST["fullname"] ?? "");
$adminEmail = trim($_POST["admin_email"] ?? "");

if (
    $adminId <= 0 ||
    $fullname === "" ||
    $adminEmail === ""
) {
    echo json_encode([
        "success" => false,
        "message" => "Administrator ID, name and email are required"
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
| Verify administrator
|--------------------------------------------------------------------------
*/

$adminStmt = $conn->prepare(
    "SELECT
        id,
        fullname,
        email,
        role,
        profile_image
     FROM users
     WHERE id = ?
       AND email = ?
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

$adminStmt->bind_param(
    "is",
    $adminId,
    $adminEmail
);

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
        "message" => "You are not authorized to update this profile"
    ]);

    $conn->close();
    exit;
}

/*
|--------------------------------------------------------------------------
| Keep primary administrator email protected
|--------------------------------------------------------------------------
*/

if ($admin["email"] !== "admin@mindbloom.com") {
    echo json_encode([
        "success" => false,
        "message" => "Only the primary administrator profile can be updated here"
    ]);

    $conn->close();
    exit;
}

/*
|--------------------------------------------------------------------------
| Optional profile image upload
|--------------------------------------------------------------------------
*/

$profileImage = $admin["profile_image"] ?? "";
$oldProfileImage = $profileImage;

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

    $maxFileSize = 5 * 1024 * 1024;

    if ($_FILES["profile_image"]["size"] > $maxFileSize) {
        echo json_encode([
            "success" => false,
            "message" => "Profile image must be smaller than 5 MB"
        ]);

        $conn->close();
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

        $conn->close();
        exit;
    }

    $uploadFolder = __DIR__ . "/../uploads/profiles/";

    if (!is_dir($uploadFolder)) {
        mkdir($uploadFolder, 0775, true);
    }

    $fileName =
        uniqid("admin_profile_", true) .
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

        $conn->close();
        exit;
    }

    $profileImage =
        "uploads/profiles/" .
        $fileName;
}

/*
|--------------------------------------------------------------------------
| Update profile
|--------------------------------------------------------------------------
*/

$updateStmt = $conn->prepare(
    "UPDATE users
     SET
        fullname = ?,
        profile_image = ?
     WHERE id = ?
       AND email = ?
       AND role = 'admin'"
);

if (!$updateStmt) {
    if (
        $profileImage !== $oldProfileImage &&
        $profileImage !== ""
    ) {
        $newFilePath =
            __DIR__ . "/../" . $profileImage;

        if (file_exists($newFilePath)) {
            unlink($newFilePath);
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
    $adminId,
    $adminEmail
);

if ($updateStmt->execute()) {
    /*
    |--------------------------------------------------------------------------
    | Delete old image after successful update
    |--------------------------------------------------------------------------
    */

    if (
        $profileImage !== $oldProfileImage &&
        $oldProfileImage !== ""
    ) {
        $oldFilePath =
            __DIR__ . "/../" .
            $oldProfileImage;

        if (file_exists($oldFilePath)) {
            unlink($oldFilePath);
        }
    }

    echo json_encode([
        "success" => true,
        "message" => "Administrator profile updated successfully",
        "user" => [
            "id" => $adminId,
            "fullname" => $fullname,
            "email" => $adminEmail,
            "role" => "admin",
            "profile_image" => $profileImage
        ]
    ]);
} else {
    if (
        $profileImage !== $oldProfileImage &&
        $profileImage !== ""
    ) {
        $newFilePath =
            __DIR__ . "/../" .
            $profileImage;

        if (file_exists($newFilePath)) {
            unlink($newFilePath);
        }
    }

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Administrator profile could not be updated"
    ]);
}

$updateStmt->close();
$conn->close();