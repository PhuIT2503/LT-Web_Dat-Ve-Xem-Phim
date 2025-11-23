<?php
header("Access-Control-Allow-Origin: http://localhost");
header("Content-Type: application/json; charset=UTF-8");

include_once "../../config/database.php";

$db = (new Database())->getConnection();

// Chỉ lấy các voucher còn hạn sử dụng
$query = "SELECT * FROM voucher WHERE han_su_dung >= CURDATE()";
$stmt = $db->prepare($query);
$stmt->execute();

$vouchers = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $vouchers[] = [
        "code" => $row['noi_dung'], // Mã voucher (VD: GIAM10K)
        "desc" => $row['mo_ta'],    // Mô tả
        "discount" => $row['giam_gia'] // Giá trị giảm
    ];
}

echo json_encode($vouchers);
?>