<?php
class Transaction {
    private $conn;
    private $table = "transaction_history";

    public $user_id;
    public $booking_code;
    public $item_name;
    public $total_amount;
    public $status;
    
    // Biến chứa lỗi để debug
    public $error;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table . " 
                  (user_id, booking_code, item_name, total_amount, status, booking_date)
                  VALUES (:user_id, :code, :item, :total, :status, NOW())";

        $stmt = $this->conn->prepare($query);

        $this->booking_code = htmlspecialchars(strip_tags($this->booking_code));
        $this->item_name = htmlspecialchars(strip_tags($this->item_name));
        $this->status = htmlspecialchars(strip_tags($this->status));

        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":code", $this->booking_code);
        $stmt->bindParam(":item", $this->item_name);
        $stmt->bindParam(":total", $this->total_amount);
        $stmt->bindParam(":status", $this->status);

        if ($stmt->execute()) {
            return true;
        }
        
        // ⭐ QUAN TRỌNG: Lưu lại lỗi nếu thất bại
        $this->error = json_encode($stmt->errorInfo());
        return false;
    }

    public function getHistoryByUserId($userId) {
        $query = "SELECT * FROM " . $this->table . " WHERE user_id = :uid ORDER BY booking_date DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":uid", $userId);
        $stmt->execute();
        return $stmt;
    }
}
?>