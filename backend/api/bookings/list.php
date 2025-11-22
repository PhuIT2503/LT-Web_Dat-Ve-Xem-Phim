<?php
// Cấu hình Session Cookie (quan trọng để đọc được $_SESSION)
session_set_cookie_params([
    'lifetime' => 0, 'path' => '/', 'secure' => false,
    'httponly' => true, 'samesite' => 'Lax'
]);
session_start();

// Cấu hình Headers
header("Access-Control-Allow-Origin: http://localhost");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

include_once "../../config/database.php";

// 1. Kiểm tra đăng nhập
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["message" => "Chưa đăng nhập"]);
    exit;
}

$user_id = $_SESSION['user_id'];

// 2. Kết nối Database
$database = new Database();
$db = $database->getConnection();

try {
    // 3. Truy vấn dữ liệu: JOIN Bookings -> Showtimes -> Movies
    // Mục đích: Lấy ngày đặt, tổng tiền, trạng thái VÀ Tên phim
    $query = "
        SELECT 
            b.id as booking_id,
            b.created_at,
            b.total_amount,
            b.status,
            m.title as movie_title,
            s.show_date,
            s.show_time
        FROM bookings b
        JOIN showtimes s ON b.showtime_id = s.id
        JOIN movies m ON s.movie_id = m.id
        WHERE b.user_id = :user_id
        ORDER BY b.created_at DESC
    ";

    $stmt = $db->prepare($query);
    $stmt->bindParam(":user_id", $user_id);
    $stmt->execute();

    $bookings = [];

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Format lại ngày tháng cho đẹp (VD: 15/02/2025)
        $dateObj = new DateTime($row['created_at']);
        $formattedDate = $dateObj->format('d/m/Y H:i');

        $bookings[] = [
            "id" => $row['booking_id'],
            "item" => $row['movie_title'], // Tên phim
            "date" => $formattedDate,
            "total" => number_format($row['total_amount'], 0, ',', '.') . ' đ', // Format tiền tệ
            "status" => $row['status'] // pending, success, cancelled
        ];
    }

    // 4. Trả về JSON
    echo json_encode($bookings);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Lỗi server: " . $e->getMessage()]);
}
?>