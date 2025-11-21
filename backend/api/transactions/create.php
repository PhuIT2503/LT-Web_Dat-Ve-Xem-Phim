<?php
header("Access-Control-Allow-Origin: http://localhost");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");

// Cấu hình session giống file login để tránh mất session
session_set_cookie_params([
    'lifetime' => 0, 'path' => '/', 'domain' => 'localhost',
    'secure' => false, 'httponly' => true, 'samesite' => 'Lax'
]);
session_start();

include_once "../../config/database.php";
include_once "../../model/transaction.php";

// Debug: Kiểm tra xem có nhận được session không
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        "message" => "Bạn chưa đăng nhập hoặc Session bị lỗi.",
        "debug_session" => $_SESSION // In ra để xem session có gì không
    ]);
    exit;
}

$database = new Database();
$db = $database->getConnection();
$transaction = new Transaction($db);

$data = json_decode(file_get_contents("php://input"));

// Debug: Kiểm tra dữ liệu nhận được từ Frontend
if (empty($data)) {
    http_response_code(400);
    echo json_encode(["message" => "Không nhận được dữ liệu JSON gửi lên."]);
    exit;
}

$transaction->user_id = $_SESSION['user_id'];
$transaction->booking_code = $data->booking_code ?? 'UNKNOWN';
$transaction->item_name = $data->item_name ?? 'Vé xem phim';
$transaction->total_amount = $data->total_amount ?? 0;
$transaction->status = "Thành công";

if ($transaction->create()) {
    http_response_code(201);
    echo json_encode(["message" => "Lưu thành công!"]);
} else {
    // Trả về lỗi SQL cụ thể
    http_response_code(500);
    echo json_encode([
        "message" => "Lỗi SQL - Không thể lưu.",
        "error_detail" => $transaction->error
    ]);
}
?>