<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once "../../config/database.php";
include_once "../../model/user.php";

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$data = json_decode(file_get_contents("php://input"));
if (empty($data->email) || empty($data->password)) {
  http_response_code(400);
  echo json_encode(["message" => "Thiếu thông tin đăng nhập."]);
  exit;
}

$stmt = $user->findByEmail($data->email);
if ($stmt->rowCount() == 0) {
  http_response_code(401);
  echo json_encode(["message" => "Email không tồn tại."]);
  exit;
}

$row = $stmt->fetch(PDO::FETCH_ASSOC);

if (password_verify($data->password, $row['password_hash'])) {
  $_SESSION['user_id'] = $row['id'];
  $_SESSION['role'] = $row['role'];
  http_response_code(200);
  echo json_encode([
    "message" => "Đăng nhập thành công!",
    "user" => [
      "id" => $row['id'],
      "username" => $row['username'],
      "email" => $row['email'],
      "role" => $row['role']
    ]
  ]);
} else {
  http_response_code(401);
  echo json_encode(["message" => "Sai mật khẩu."]);
}
?>
