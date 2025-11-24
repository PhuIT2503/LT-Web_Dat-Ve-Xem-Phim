<?php
header("Access-Control-Allow-Origin: http://localhost");
header("Content-Type: application/json; charset=UTF-8");

include_once "../../config/database.php";

$db = (new Database())->getConnection();

// 1. Lấy TẤT CẢ voucher, sắp xếp cái mới nhất lên đầu
$query = "SELECT * FROM voucher ORDER BY han_su_dung DESC";
$stmt = $db->prepare($query);
$stmt->execute();

$vouchers = [];
$today = date("Y-m-d");

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    // 2. Kiểm tra logic: Hết hạn xem như "Đã dùng/Không khả dụng"
    $is_expired = ($row['han_su_dung'] < $today);

    $vouchers[] = [
        "code" => $row['noi_dung'],
        "desc" => $row['mo_ta'],
        "discount" => $row['giam_gia'],
        "exp" => date("d/m/Y", strtotime($row['han_su_dung'])),
        "is_valid" => !$is_expired // Cờ để frontend biết mà làm mờ
    ];
}

echo json_encode($vouchers);
?>