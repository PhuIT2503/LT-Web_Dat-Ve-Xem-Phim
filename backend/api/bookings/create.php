<?php
// CORS headers
header("Access-Control-Allow-Origin: http://localhost");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();

include_once "../../config/database.php";

// 1. Kiểm tra đăng nhập
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["message" => "Vui lòng đăng nhập để đặt vé."]);
    exit;
}

$database = new Database();
$db = $database->getConnection();
$data = json_decode(file_get_contents("php://input"));

// 2. Validate dữ liệu đầu vào
if (
    empty($data->showtime_id) || 
    empty($data->seats) || 
    !is_array($data->seats) || 
    count($data->seats) == 0
) {
    http_response_code(400);
    echo json_encode(["message" => "Dữ liệu không hợp lệ."]);
    exit;
}

try {
    // 3. BẮT ĐẦU TRANSACTION
    $db->beginTransaction();

    $user_id = $_SESSION['user_id'];
    $showtime_id = $data->showtime_id;
    $seat_ids = $data->seats; // Mảng các ID ghế (ví dụ: [10, 11, 12])

    // --- Bước 3.1: Kiểm tra concurrency (Trùng ghế) ---
    // Sử dụng "FOR UPDATE" để khóa các dòng này lại trong DB
    $placeholders = implode(',', array_fill(0, count($seat_ids), '?'));
    
    $checkQuery = "SELECT bs.seat_id 
                   FROM booking_seats bs
                   JOIN bookings b ON bs.booking_id = b.id
                   WHERE b.showtime_id = ? 
                   AND bs.seat_id IN ($placeholders)
                   AND b.status IN ('pending', 'success')
                   FOR UPDATE"; 

    $stmtCheck = $db->prepare($checkQuery);
    $params = array_merge([$showtime_id], $seat_ids);
    $stmtCheck->execute($params);

    if ($stmtCheck->rowCount() > 0) {
        // Nếu tìm thấy dòng nào -> Nghĩa là ghế đó đã bị đặt
        $db->rollBack();
        http_response_code(409); // Conflict code
        echo json_encode(["message" => "Ghế bạn chọn vừa có người khác đặt. Vui lòng chọn lại."]);
        exit;
    }

    // --- Bước 3.2: Tạo Booking record ---
    $customer_name = $data->customer_name ?? 'Khách';
    $customer_phone = $data->customer_phone ?? '';
    $total_amount = $data->total_amount ?? 0;

    $queryBooking = "INSERT INTO bookings (user_id, showtime_id, customer_name, customer_phone, total_amount, status) 
                     VALUES (?, ?, ?, ?, ?, 'success')"; // Giả lập thanh toán luôn thành công
    
    $stmtBooking = $db->prepare($queryBooking);
    $stmtBooking->execute([$user_id, $showtime_id, $customer_name, $customer_phone, $total_amount]);
    
    $booking_id = $db->lastInsertId();

    // --- Bước 3.3: Insert chi tiết ghế vào booking_seats ---
    $querySeat = "INSERT INTO booking_seats (booking_id, seat_id) VALUES (?, ?)";
    $stmtSeat = $db->prepare($querySeat);

    foreach ($seat_ids as $seat_id) {
        $stmtSeat->execute([$booking_id, $seat_id]);
    }

    // 4. COMMIT TRANSACTION (Lưu tất cả thay đổi)
    $db->commit();

    http_response_code(201);
    echo json_encode([
        "message" => "Đặt vé thành công!",
        "booking_id" => $booking_id
    ]);

} catch (Exception $e) {
    // Có lỗi gì đó -> Hoàn tác tất cả
    $db->rollBack();
    http_response_code(500);
    echo json_encode(["message" => "Lỗi hệ thống: " . $e->getMessage()]);
}
?>