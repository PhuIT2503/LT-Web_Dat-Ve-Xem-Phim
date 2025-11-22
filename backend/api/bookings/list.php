<?php
// Cấu hình CORS
header("Access-Control-Allow-Origin: http://localhost");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'secure' => false, 'httponly' => true, 'samesite' => 'Lax']);
session_start();

include_once "../../config/database.php";

if (!isset($_SESSION['user_id'])) {
    // Trả về mảng rỗng nếu chưa login, thay vì lỗi 401 để tránh đỏ console
    echo json_encode([]); 
    exit;
}

$db = (new Database())->getConnection();

// Lấy thông tin: ID vé, Tên phim, Giờ chiếu, Tổng tiền
$query = "
    SELECT 
        b.id,
        b.created_at,
        b.total_amount,
        b.status,
        m.title as movie_title,
        s.show_time,
        s.show_date
    FROM bookings b
    JOIN showtimes s ON b.showtime_id = s.id
    JOIN movies m ON s.movie_id = m.id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
";

$stmt = $db->prepare($query);
$stmt->execute([$_SESSION['user_id']]);

$history = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $history[] = [
        "id" => $row['id'],
        "item" => $row['movie_title'] . " (" . date('H:i', strtotime($row['show_time'])) . ")",
        "date" => date('d/m/Y H:i', strtotime($row['created_at'])),
        "total" => number_format($row['total_amount'], 0, ',', '.') . " đ",
        "status" => $row['status']
    ];
}

echo json_encode($history);
?>