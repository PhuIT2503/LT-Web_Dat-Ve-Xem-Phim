<?php
header("Access-Control-Allow-Origin: http://localhost");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

include_once "../../config/database.php";
include_once "../../model/voucher.php";

$database = new Database();
$db = $database->getConnection();
$voucher = new Voucher($db);

// Lấy statement từ model
$stmt = $voucher->getAllActive();
$vouchers_arr = [];

// Dùng fetch(PDO::FETCH_ASSOC) thay vì fetch_assoc()
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $vouchers_arr[] = [
        "code" => $row['noi_dung'],
        "desc" => $row['mo_ta'],
        "exp" => $row['han_su_dung'],
        "discount_display" => $row['giam_gia']
    ];
}

echo json_encode($vouchers_arr);
?>