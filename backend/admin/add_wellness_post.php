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

date_default_timezone_set("Asia/Karachi");

/*
|--------------------------------------------------------------------------
| Helper: Create URL Slug
|--------------------------------------------------------------------------
*/

function createUniqueSlug(
    mysqli $conn,
    string $title
): string {
    $slug = strtolower(trim($title));

    $slug = preg_replace(
        "/[^a-z0-9]+/",
        "-",
        $slug
    );

    $slug = trim(
        $slug,
        "-"
    );

    if ($slug === "") {
        $slug =
            "wellness-post-" .
            time();
    }

    $originalSlug = $slug;
    $counter = 2;

    while (true) {
        $checkStmt = $conn->prepare(
            "SELECT id
             FROM wellness_hub_posts
             WHERE slug = ?
             LIMIT 1"
        );

        if (!$checkStmt) {
            throw new Exception(
                "Unable to verify post slug"
            );
        }

        $checkStmt->bind_param(
            "s",
            $slug
        );

        $checkStmt->execute();

        $checkResult =
            $checkStmt->get_result();

        $exists =
            $checkResult->num_rows > 0;

        $checkStmt->close();

        if (!$exists) {
            return $slug;
        }

        $slug =
            $originalSlug .
            "-" .
            $counter;

        $counter++;
    }
}

/*
|--------------------------------------------------------------------------
| Form Data
|--------------------------------------------------------------------------
*/

$adminId = (int) (
    $_POST["admin_id"] ?? 0
);

$title = trim(
    $_POST["title"] ?? ""
);

$category = trim(
    $_POST["category"] ?? ""
);

$shortDescription = trim(
    $_POST["short_description"] ?? ""
);

$content = trim(
    $_POST["content"] ?? ""
);

$author = trim(
    $_POST["author"] ??
    "MindBloom Wellness Team"
);

$readingTime = trim(
    $_POST["reading_time"] ??
    "5 min"
);

$status = trim(
    $_POST["status"] ??
    "published"
);

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

if (
    $adminId <= 0 ||
    $title === "" ||
    $category === "" ||
    $shortDescription === "" ||
    $content === "" ||
    $author === "" ||
    $readingTime === ""
) {
    echo json_encode([
        "success" => false,
        "message" => "All required fields must be completed"
    ]);

    exit;
}

if (
    !in_array(
        $status,
        ["published", "draft"],
        true
    )
) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid post status"
    ]);

    exit;
}

if (strlen($title) > 200) {
    echo json_encode([
        "success" => false,
        "message" => "Title is too long"
    ]);

    exit;
}

if (strlen($category) > 100) {
    echo json_encode([
        "success" => false,
        "message" => "Category is too long"
    ]);

    exit;
}

if (
    strlen($shortDescription) >
    350
) {
    echo json_encode([
        "success" => false,
        "message" => "Short description is too long"
    ]);

    exit;
}

if (strlen($author) > 150) {
    echo json_encode([
        "success" => false,
        "message" => "Author name is too long"
    ]);

    exit;
}

if (strlen($readingTime) > 30) {
    echo json_encode([
        "success" => false,
        "message" => "Reading time is too long"
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Verify Admin
|--------------------------------------------------------------------------
*/

$adminStmt = $conn->prepare(
    "SELECT id
     FROM users
     WHERE id = ?
       AND role = 'admin'
     LIMIT 1"
);

if (!$adminStmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to verify administrator"
    ]);

    $conn->close();
    exit;
}

$adminStmt->bind_param(
    "i",
    $adminId
);

$adminStmt->execute();

$adminResult =
    $adminStmt->get_result();

if (
    $adminResult->num_rows === 0
) {
    echo json_encode([
        "success" => false,
        "message" => "Administrator access was not verified"
    ]);

    $adminStmt->close();
    $conn->close();

    exit;
}

$adminStmt->close();

/*
|--------------------------------------------------------------------------
| Generate Unique Slug
|--------------------------------------------------------------------------
*/

try {
    $slug = createUniqueSlug(
        $conn,
        $title
    );
} catch (Throwable $error) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to create post URL",
        "error" => $error->getMessage()
    ]);

    $conn->close();
    exit;
}

/*
|--------------------------------------------------------------------------
| Image Upload
|--------------------------------------------------------------------------
*/

$imagePath = null;

if (
    isset($_FILES["image"]) &&
    $_FILES["image"]["error"] !==
        UPLOAD_ERR_NO_FILE
) {
    if (
        $_FILES["image"]["error"] !==
        UPLOAD_ERR_OK
    ) {
        echo json_encode([
            "success" => false,
            "message" => "Image upload failed"
        ]);

        $conn->close();
        exit;
    }

    $allowedTypes = [
        "image/jpeg" => "jpg",
        "image/png" => "png",
        "image/webp" => "webp"
    ];

    $fileType = mime_content_type(
        $_FILES["image"]["tmp_name"]
    );

    if (
        !isset(
            $allowedTypes[$fileType]
        )
    ) {
        echo json_encode([
            "success" => false,
            "message" => "Only JPG, PNG and WEBP images are allowed"
        ]);

        $conn->close();
        exit;
    }

    if (
        $_FILES["image"]["size"] >
        5 * 1024 * 1024
    ) {
        echo json_encode([
            "success" => false,
            "message" => "Image size must be less than 5 MB"
        ]);

        $conn->close();
        exit;
    }

    $uploadFolder =
        __DIR__ .
        "/../uploads/wellness_hub/";

    if (!is_dir($uploadFolder)) {
        mkdir(
            $uploadFolder,
            0777,
            true
        );
    }

    $extension =
        $allowedTypes[$fileType];

    $fileName =
        "wellness_" .
        time() .
        "_" .
        bin2hex(
            random_bytes(4)
        ) .
        "." .
        $extension;

    $destination =
        $uploadFolder .
        $fileName;

    if (
        !move_uploaded_file(
            $_FILES["image"]["tmp_name"],
            $destination
        )
    ) {
        echo json_encode([
            "success" => false,
            "message" => "Image could not be saved"
        ]);

        $conn->close();
        exit;
    }

    $imagePath =
        "uploads/wellness_hub/" .
        $fileName;
}

/*
|--------------------------------------------------------------------------
| Save Post
|--------------------------------------------------------------------------
*/

$publishedAt =
    $status === "published"
        ? date("Y-m-d H:i:s")
        : null;

$insertStmt = $conn->prepare(
    "INSERT INTO wellness_hub_posts
        (
            admin_id,
            slug,
            title,
            category,
            short_description,
            content,
            image,
            author,
            reading_time,
            status,
            published_at
        )
     VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
);

if (!$insertStmt) {
    if (
        $imagePath &&
        file_exists(
            __DIR__ .
            "/../" .
            $imagePath
        )
    ) {
        unlink(
            __DIR__ .
            "/../" .
            $imagePath
        );
    }

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare wellness post",
        "error" => $conn->error
    ]);

    $conn->close();
    exit;
}

$insertStmt->bind_param(
    "issssssssss",
    $adminId,
    $slug,
    $title,
    $category,
    $shortDescription,
    $content,
    $imagePath,
    $author,
    $readingTime,
    $status,
    $publishedAt
);

if (!$insertStmt->execute()) {
    if (
        $imagePath &&
        file_exists(
            __DIR__ .
            "/../" .
            $imagePath
        )
    ) {
        unlink(
            __DIR__ .
            "/../" .
            $imagePath
        );
    }

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Wellness Hub post could not be created",
        "error" => $insertStmt->error
    ]);

    $insertStmt->close();
    $conn->close();

    exit;
}

$postId =
    $insertStmt->insert_id;

$insertStmt->close();
$conn->close();

echo json_encode([
    "success" => true,

    "message" =>
        $status === "published"
            ? "Wellness Hub post published successfully"
            : "Wellness Hub draft saved successfully",

    "post" => [
        "id" => $postId,
        "slug" => $slug,
        "title" => $title,
        "category" => $category,
        "short_description" =>
            $shortDescription,
        "content" => $content,
        "image" => $imagePath,
        "author" => $author,
        "reading_time" =>
            $readingTime,
        "status" => $status,
        "published_at" =>
            $publishedAt
    ]
]);