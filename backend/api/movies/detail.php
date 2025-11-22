<?php
header("Access-Control-Allow-Origin: http://localhost");
header("Content-Type: application/json; charset=UTF-8");

include_once "../../config/database.php";
include_once "../../model/movie.php";

$database = new Database();
$db = $database->getConnection();
$movie = new Movie($db);

// Lấy ID từ URL
$movie->id = isset($_GET['id']) ? $_GET['id'] : die();

$stmt = $movie->readSingle();

if ($stmt->rowCount() > 0) {
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Map dữ liệu từ DB sang JSON
    $movie_arr = [
        "id" => $row['id'],
        "title" => $row['title'],
        "description" => $row['description'],
        "imageUrl" => $row['poster'],
        "bannerUrl" => $row['banner'],
        "trailerUrl" => $row['trailer_url'],
        // Lấy năm phát hành
        "year" => date('Y', strtotime($row['release_date'])),
        "duration" => $row['duration'] . " phút",
        
        // ⭐ QUAN TRỌNG: Lấy dữ liệu thật từ các cột mới trong DB ⭐
        "rating" => $row['rating'],       
        "genre" => $row['category'],
        "director" => $row['director'],   
        "cast" => $row['cast']            
    ];
    
    http_response_code(200);
    echo json_encode($movie_arr);
} else {
    http_response_code(404);
    echo json_encode(["message" => "Không tìm thấy phim."]);
}
?>