<?php
header("Access-Control-Allow-Origin: http://localhost");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

include_once "../../config/database.php";
include_once "../../model/voucher.php";

$database = new Database();
$db = $database->getConnection();
$voucher = new Voucher($db);

$code = isset($_GET['code']) ? $_GET['code'] : die();

$stmt = $voucher->findByCode($code);

// Dùng rowCount() thay vì num_rows
if ($stmt->rowCount() > 0) {
    // Dùng fetch(PDO::FETCH_ASSOC)
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $discountValue = $row['giam_gia'];
    $type = 'fixed';
    $value = 0;

    if (strpos($discountValue, '%') !== false) {
        $type = 'percent';
        $value = floatval(str_replace('%', '', $discountValue)) / 100;
    } else {
        $type = 'fixed';
        $value = intval($discountValue);
    }

    echo json_encode([
        "success" => true,
        "data" => [
            "code" => $row['noi_dung'],
            "desc" => $row['mo_ta'],
            "type" => $type,
            "value" => $value
        ]
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Mã giảm giá không hợp lệ hoặc đã hết hạn."
    ]);
}
?>