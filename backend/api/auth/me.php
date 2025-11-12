<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

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
