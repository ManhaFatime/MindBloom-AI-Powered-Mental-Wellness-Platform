<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Only GET requests are allowed"
    ]);

    exit;
}

require_once __DIR__ . "/config.php";

/*
|--------------------------------------------------------------------------
| Mode
|--------------------------------------------------------------------------
| Public:
| get_wellness_posts.php
|
| Admin:
| get_wellness_posts.php?admin=1
|--------------------------------------------------------------------------
*/

$isAdminMode =
    isset($_GET["admin"]) &&
    $_GET["admin"] === "1";

$category = trim(
    $_GET["category"] ?? ""
);

$search = trim(
    $_GET["search"] ?? ""
);

/*
|--------------------------------------------------------------------------
| Build Query
|--------------------------------------------------------------------------
*/

$sql = "
    SELECT
        wellness_hub_posts.id,
        wellness_hub_posts.admin_id,
        wellness_hub_posts.slug,
        wellness_hub_posts.title,
        wellness_hub_posts.category,
        wellness_hub_posts.short_description,
        wellness_hub_posts.content,
        wellness_hub_posts.image,
        wellness_hub_posts.author,
        wellness_hub_posts.reading_time,
        wellness_hub_posts.status,
        wellness_hub_posts.published_at,
        wellness_hub_posts.created_at,
        wellness_hub_posts.updated_at,
        users.fullname AS admin_name
    FROM wellness_hub_posts
    LEFT JOIN users
        ON users.id = wellness_hub_posts.admin_id
    WHERE 1 = 1
";

$types = "";
$params = [];

/*
|--------------------------------------------------------------------------
| Public Mode
|--------------------------------------------------------------------------
*/

if (!$isAdminMode) {
    $sql .= "
        AND wellness_hub_posts.status = 'published'
    ";
}

/*
|--------------------------------------------------------------------------
| Category Filter
|--------------------------------------------------------------------------
*/

if ($category !== "") {
    $sql .= "
        AND wellness_hub_posts.category = ?
    ";

    $types .= "s";
    $params[] = $category;
}

/*
|--------------------------------------------------------------------------
| Search Filter
|--------------------------------------------------------------------------
*/

if ($search !== "") {
    $searchValue =
        "%" . $search . "%";

    $sql .= "
        AND (
            wellness_hub_posts.title LIKE ?
            OR wellness_hub_posts.category LIKE ?
            OR wellness_hub_posts.short_description LIKE ?
            OR wellness_hub_posts.content LIKE ?
            OR wellness_hub_posts.author LIKE ?
        )
    ";

    $types .= "sssss";

    $params[] = $searchValue;
    $params[] = $searchValue;
    $params[] = $searchValue;
    $params[] = $searchValue;
    $params[] = $searchValue;
}

/*
|--------------------------------------------------------------------------
| Ordering
|--------------------------------------------------------------------------
*/

$sql .= "
    ORDER BY
        CASE
            WHEN wellness_hub_posts.status = 'published'
            THEN 0
            ELSE 1
        END,
        COALESCE(
            wellness_hub_posts.published_at,
            wellness_hub_posts.created_at
        ) DESC,
        wellness_hub_posts.id DESC
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare Wellness Hub posts",
        "error" => $conn->error
    ]);

    $conn->close();
    exit;
}

/*
|--------------------------------------------------------------------------
| Bind Dynamic Parameters
|--------------------------------------------------------------------------
*/

if ($types !== "") {
    $stmt->bind_param(
        $types,
        ...$params
    );
}

$stmt->execute();

$result = $stmt->get_result();

$posts = [];
$publishedCount = 0;
$draftCount = 0;
$categories = [];

while ($row = $result->fetch_assoc()) {
    if ($row["status"] === "published") {
        $publishedCount++;
    }

    if ($row["status"] === "draft") {
        $draftCount++;
    }

    if (
        $row["category"] !== "" &&
        !in_array(
            $row["category"],
            $categories,
            true
        )
    ) {
        $categories[] =
            $row["category"];
    }

    $posts[] = [
        "id" =>
            (int) $row["id"],

        "admin_id" =>
            $row["admin_id"] !== null
                ? (int) $row["admin_id"]
                : null,

        "slug" =>
            $row["slug"] ?? "",

        "admin_name" =>
            $row["admin_name"] ?? "MindBloom Admin",

        "title" =>
            $row["title"],

        "category" =>
            $row["category"],

        "short_description" =>
            $row["short_description"],

        "content" =>
            $row["content"],

        "image" =>
            $row["image"] ?? "",

        "author" =>
            $row["author"] ?? "MindBloom Wellness Team",

        "reading_time" =>
            $row["reading_time"] ?? "5 min",

        "status" =>
            $row["status"],

        "published_at" =>
            $row["published_at"],

        "created_at" =>
            $row["created_at"],

        "updated_at" =>
            $row["updated_at"]
    ];
}

$stmt->close();
$conn->close();

sort($categories);

echo json_encode([
    "success" => true,

    "mode" =>
        $isAdminMode
            ? "admin"
            : "public",

    "total_posts" =>
        count($posts),

    "published_posts" =>
        $publishedCount,

    "draft_posts" =>
        $draftCount,

    "categories" =>
        $categories,

    "posts" =>
        $posts
]);