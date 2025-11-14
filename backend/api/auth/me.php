<?php

// ⭐ BẮT BUỘC: cấu hình cookie cho session giống login.php
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => false,
    'httponly' => true,
    'samesite' => 'None'
]);

session_start();

// ⭐ CORS CHUẨN
header("Access-Control-Allow-Origin: http://localhost");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// ⭐ XỬ LÝ OPTIONS (bắt buộc)
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

// ⭐ KIỂM TRA SESSION
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["message" => "Chưa đăng nhập."]);
    exit;
}

echo json_encode([
    "user_id" => $_SESSION['user_id'],
    "role" => $_SESSION['role']
]);
?>
