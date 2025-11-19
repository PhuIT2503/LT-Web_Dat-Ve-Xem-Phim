<?php
session_start();
header("Content-Type: application/json");
require_once "../../config/database.php";
require_once "../../model/booking.php";

// Kiểm tra đăng nhập
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Not authenticated"]);
    exit;
}

// Kết nối DB
$database = new Database();
$conn = $database->connect();

$booking = new Booking($conn);

// Nhận JSON body
$data = json_decode(file_get_contents("php://input"), true);

if (
    empty($data['movie_id']) ||
    empty($data['showtime_id']) ||
    empty($data['seat'])
) {
    echo json_encode(["error" => "Missing required fields"]);
    exit;
}

// Gán dữ liệu
$booking->user_id = $_SESSION['user_id'];
$booking->movie_id = $data['movie_id'];
$booking->showtime_id = $data['showtime_id'];
$booking->seat = $data['seat'];

if ($booking->create()) {
    echo json_encode([
        "success" => true,
        "booking_id" => $booking->id,
        "status" => "pending"
    ]);
} else {
    echo json_encode(["error" => "Failed to create booking"]);
}
