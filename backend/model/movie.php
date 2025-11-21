<?php
class Movie {
    private $conn;
    private $table = "movies";

    public $id;
    public $title;
    public $description;
    public $poster;
    public $banner;
    public $trailer_url;
    public $release_date;
    public $duration;
    public $category;
    public $rating;
    public $is_trending;
    public $is_new;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Lấy danh sách phim
    public function read($type = null) {
        $query = "SELECT * FROM " . $this->table;
        if ($type === 'new') {
            $query .= " WHERE is_new = 1";
        } elseif ($type === 'trending') {
            $query .= " WHERE is_trending = 1";
        }
        $query .= " ORDER BY created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Lấy chi tiết 1 phim
    public function readSingle() {
        $query = "SELECT * FROM " . $this->table . " WHERE id = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        return $stmt;
    }

    // Tạo phim mới (Admin)
    public function create() {
        $query = "INSERT INTO " . $this->table . " 
                  (title, description, poster, banner, trailer_url, release_date, duration, category, rating, is_trending, is_new)
                  VALUES (:title, :description, :poster, :banner, :trailer_url, :release_date, :duration, :category, :rating, :is_trending, :is_new)";

        $stmt = $this->conn->prepare($query);

        // Clean data
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = htmlspecialchars(strip_tags($this->description));

        // Bind params
        $stmt->bindParam(':title', $this->title);
        $stmt->bindParam(':description', $this->description);
        $stmt->bindParam(':poster', $this->poster);
        $stmt->bindParam(':banner', $this->banner);
        $stmt->bindParam(':trailer_url', $this->trailer_url);
        $stmt->bindParam(':release_date', $this->release_date);
        $stmt->bindParam(':duration', $this->duration);
        $stmt->bindParam(':category', $this->category);
        $stmt->bindParam(':rating', $this->rating);
        $stmt->bindParam(':is_trending', $this->is_trending);
        $stmt->bindParam(':is_new', $this->is_new);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }
}
?>