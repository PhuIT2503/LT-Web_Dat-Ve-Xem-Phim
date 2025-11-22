<?php
// Cấu hình Session & Headers
session_set_cookie_params([
    'lifetime' => 0, 'path' => '/', 'secure' => false, 'httponly' => true, 'samesite' => 'Lax'
]);
session_start();

header("Access-Control-Allow-Origin: http://localhost");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

include_once "../../config/database.php";

// 1. Kiểm tra đăng nhập
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["message" => "Vui lòng đăng nhập để đặt vé!"]);
    exit;
}

// 2. Nhận dữ liệu JSON
$data = json_decode(file_get_contents("php://input"));

// Validate dữ liệu
if (empty($data->showtime_id) || empty($data->seats) || !is_array($data->seats)) {
    http_response_code(400);
    echo json_encode(["message" => "Dữ liệu vé không hợp lệ."]);
    exit;
}

$db = (new Database())->getConnection();

try {
    // Bắt đầu transaction (để đảm bảo lưu cả booking và ghế cùng lúc)
    $db->beginTransaction();

    // 3. Kiểm tra lại xem ghế có bị người khác đặt trước trong tíc tắc không
    // Tạo chuỗi placeholders (?,?,?)
    $placeholders = implode(',', array_fill(0, count($data->seats), '?'));
    
    // Query kiểm tra ghế trùng trong cùng suất chiếu
    $checkSql = "SELECT bs.seat_id 
                 FROM booking_seats bs
                 JOIN bookings b ON bs.booking_id = b.id
                 WHERE b.showtime_id = ? 
                 AND bs.seat_id IN ($placeholders)
                 AND b.status IN ('success', 'pending')";
                 
    $checkStmt = $db->prepare($checkSql);
    
    // Merge showtime_id vào mảng params ghế
    $params = array_merge([$data->showtime_id], $data->seats);
    $checkStmt->execute($params);

    if ($checkStmt->rowCount() > 0) {
        throw new Exception("Một trong những ghế bạn chọn vừa được người khác đặt.");
    }

    // 4. Lưu thông tin Booking (Đơn hàng)
    $stmt = $db->prepare("INSERT INTO bookings (user_id, showtime_id, customer_name, customer_phone, total_amount, status) VALUES (?, ?, ?, ?, ?, 'success')");
    $stmt->execute([
        $_SESSION['user_id'],
        $data->showtime_id,
        $data->customer_name ?? 'Khách hàng',
        $data->customer_phone ?? '',
        $data->total_amount
    ]);
    
    $booking_id = $db->lastInsertId();

    // 5. Lưu chi tiết Ghế (Booking Seats)
    $stmtSeat = $db->prepare("INSERT INTO booking_seats (booking_id, seat_id) VALUES (?, ?)");
    foreach ($data->seats as $seat_id) {
        $stmtSeat->execute([$booking_id, $seat_id]);
    }

    // Hoàn tất transaction
    $db->commit();

    http_response_code(201);
    echo json_encode(["message" => "Đặt vé thành công!", "booking_id" => $booking_id]);

} catch (Exception $e) {
    // Nếu có lỗi, hoàn tác mọi thay đổi
    $db->rollBack();
    http_response_code(500);
    echo json_encode(["message" => "Lỗi: " . $e->getMessage()]);
}
?>