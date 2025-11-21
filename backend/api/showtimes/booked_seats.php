<?php
header("Access-Control-Allow-Origin: http://localhost");
header("Content-Type: application/json; charset=UTF-8");

include_once "../../config/database.php";
include_once "../../model/showtime.php";

$database = new Database();
$db = $database->getConnection();
$showtime = new Showtime($db);

$showtime_id = isset($_GET['id']) ? $_GET['id'] : die();

$stmt = $showtime->getBookedSeats($showtime_id);
$booked_seats = [];

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    // Trả về mảng các ID ghế đã đặt
    array_push($booked_seats, $row['seat_id']);
}

echo json_encode($booked_seats);
?>