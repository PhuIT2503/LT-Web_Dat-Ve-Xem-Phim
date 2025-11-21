<?php
header("Access-Control-Allow-Origin: http://localhost");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

session_start();

include_once "../../config/database.php";
include_once "../../model/transaction.php";

if (!isset($_SESSION['user_id'])) {
    echo json_encode([]);
    exit;
}

$database = new Database();
$db = $database->getConnection();
$transaction = new Transaction($db);

$stmt = $transaction->getHistoryByUserId($_SESSION['user_id']);
$history_arr = [];

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $history_arr[] = [
        "id" => $row['booking_code'],      // Mã đơn (VD: CGV...)
        "item" => $row['item_name'],       // Tên phim
        "date" => date("d/m/Y", strtotime($row['booking_date'])), // Format ngày
        "total" => number_format($row['total_amount']) . " đ",
        "status" => $row['status']
    ];
}

echo json_encode($history_arr);
?>