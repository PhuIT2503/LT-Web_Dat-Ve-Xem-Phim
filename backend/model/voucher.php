<?php
class Voucher {
    private $conn;
    private $table = "voucher";

    public $id;
    public $noi_dung;
    public $mo_ta;
    public $han_su_dung;
    public $giam_gia;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Tìm voucher theo mã (Dùng cú pháp PDO)
    public function findByCode($code) {
        $query = "SELECT * FROM " . $this->table . " 
                  WHERE noi_dung = :code AND han_su_dung >= CURDATE() 
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        
        // PDO dùng bindParam thay vì bind_param
        $code = htmlspecialchars(strip_tags($code));
        $stmt->bindParam(":code", $code);
        
        $stmt->execute();
        return $stmt; // Trả về PDOStatement để fetch sau
    }

    // Lấy tất cả voucher còn hạn (Dùng cú pháp PDO)
    public function getAllActive() {
        $query = "SELECT * FROM " . $this->table . " 
                  WHERE han_su_dung >= CURDATE() 
                  ORDER BY han_su_dung ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt; // Trả về PDOStatement (KHÔNG dùng get_result)
    }
}
?>