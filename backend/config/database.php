<?php
class Database {
    private $host = "localhost";
    private $db_name = "cinema_db"; // Tên database bạn đã tạo
    private $username = "root";     // Mặc định của XAMPP là root
    private $password = "";         // Mặc định để trống
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->exec("set names utf8");
        } catch (PDOException $exception) {
            echo " Kết nối thất bại: " . $exception->getMessage();
        }
        return $this->conn;
    }
}
?>
