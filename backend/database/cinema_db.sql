-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 19, 2025 at 04:34 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cinema_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `showtime_id` int(11) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_phone` varchar(20) NOT NULL,
  `total_amount` int(11) NOT NULL,
  `status` enum('pending','success','cancelled') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `booking_seats`
--

CREATE TABLE `booking_seats` (
  `id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `seat_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `movies`
--

CREATE TABLE `movies` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `poster` varchar(500) DEFAULT NULL,
  `banner` varchar(500) DEFAULT NULL,
  `trailer_url` varchar(500) DEFAULT NULL,
  `release_date` date DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `rating` float DEFAULT 0,
  `is_trending` tinyint(1) DEFAULT 0,
  `is_new` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `movies`
--

INSERT INTO `movies` (`id`, `title`, `description`, `poster`, `banner`, `trailer_url`, `release_date`, `duration`, `category`, `rating`, `is_trending`, `is_new`, `created_at`, `updated_at`) VALUES
(1, 'Mưa Đỏ', 'Lấy bối cảnh 81 ngày đêm khốc liệt tại Thành Cổ Quảng Trị năm 1972, Mưa Đỏ là câu chuyện hư cấu, theo chân một tiểu đội gồm những người lính trẻ tuổi, đầy nhiệt huyết, chiến đấu và bám trụ tại trận địa lịch sử này.', '/assets/images/movies/Mưa đỏ.jpg', '/assets/images/movies/Mưa đỏ.jpg', 'https://www.youtube.com/embed/BD6PoZJdt_M', '2025-01-01', 120, 'Chiến tranh, Lịch sử', 0, 0, 1, '2025-11-19 02:55:44', '2025-11-19 03:08:29'),
(2, 'Lật Mặt 7: Một Điều Ước', 'Phim xoay quanh câu chuyện của bà Hai (Thanh Hiền) và bốn người con. Khi bà Hai không may gặp nạn, cần người chăm sóc, bốn người con đùn đẩy nhau. Câu chuyện đặt ra câu hỏi về lòng hiếu thảo và tình cảm gia đình.', '/assets/images/movies/Một điều ước.jpg', '/assets/images/movies/Một điều ước.jpg', 'https://www.youtube.com/embed/d1ZHdosjNX8', '2024-01-01', 138, 'Gia đình, Chính kịch', 0, 0, 1, '2025-11-19 02:57:27', '2025-11-19 03:08:29'),
(3, 'Gặp Lại Chị Bầu', 'Phúc, một thanh niên có quá khứ bất hảo, cùng bạn bè lập nghiệp ở xóm trọ. Anh gặp Huyền, một cô gái tốt bụng. Tình yêu của họ nảy nở giữa những khó khăn, và bí mật về quá khứ của Huyền dần được hé lộ.', '/assets/images/movies/Gặp lại chị bầu.webp', '/assets/images/movies/Gặp lại chị bầu.webp', 'https://www.youtube.com/embed/8WS_CiekZLc', '2024-01-01', 110, 'Hài, Tình cảm', 0, 0, 1, '2025-11-19 02:57:27', '2025-11-19 03:08:29'),
(4, 'Nhà Gia Tiên', 'Câu chuyện về một gia đình gốc Việt tại Mỹ và những xung đột thế hệ. Phim khám phá sự khác biệt văn hóa, kỳ vọng của cha mẹ và ước mơ của con cái trong bối cảnh hiện đại.', '/assets/images/movies/Nhà gia tiên.jpg', '/assets/images/movies/Nhà gia tiên.jpg', 'https://www.youtube.com/embed/aR2lnpCLqUk', '2025-01-01', 95, 'Gia đình, Hài', 0, 0, 1, '2025-11-19 02:57:27', '2025-11-19 03:08:29'),
(5, 'Thám Tử Kiên: Kỳ Án Không Đầu', 'Một thám tử tư tài ba nhưng lập dị điều tra một vụ án mạng bí ẩn nơi nạn nhân bị mất đầu. Anh phải chạy đua với thời gian để tìm ra hung thủ trước khi hắn ra tay lần nữa.', '/assets/images/movies/Thám tử kiên.webp', '/assets/images/movies/Thám tử kiên.webp', 'https://www.youtube.com/embed/QiXNbEKF3U0', '2025-01-01', 115, 'Trinh thám, Kinh dị', 0, 0, 1, '2025-11-19 02:57:27', '2025-11-19 03:08:29'),
(6, 'Nhà Bà Nữ', 'Phim xoay quanh gia đình bà Nữ, chủ một quán bánh canh cua, và những mâu thuẫn thế hệ gay gắt. Câu chuyện khai thác áp lực gia đình, tình yêu và sự tha thứ.', '/assets/images/movies/Nhà bà nữ.jpg', '/assets/images/movies/Nhà bà nữ.jpg', 'https://www.youtube.com/embed/4peQFKutH34', '2023-01-01', 135, 'Chính kịch, Gia đình', 0, 0, 1, '2025-11-19 02:57:27', '2025-11-19 03:08:29'),
(7, 'Lật Mặt 6: Tấm Vé Định Mệnh', 'Một nhóm bạn thân trúng số độc đắc. Tấm vé đã thay đổi cuộc đời họ, nhưng cũng kéo theo những âm mưu, sự phản bội và cái chết. Tình bạn của họ bị thử thách bởi lòng tham.', '/assets/images/movies/Tấm vé định mệnh.webp', '/assets/images/movies/Tấm vé định mệnh.webp', 'https://www.youtube.com/embed/ns9f92mR6bM', '2023-01-01', 132, 'Hành động, Giật gân', 0, 1, 0, '2025-11-19 02:57:27', '2025-11-19 03:08:29'),
(8, 'Đất Rừng Phương Nam', 'Phiên bản điện ảnh kể về hành trình phiêu lưu của cậu bé An đi tìm cha qua các tỉnh miền Tây Nam Bộ trong thời kỳ kháng chiến chống Pháp. Phim tái hiện vẻ đẹp hùng vĩ của thiên nhiên và con người nơi đây.', '/assets/images/movies/đất rừng phương nam.webp', '/assets/images/movies/đất rừng phương nam.webp', 'https://www.youtube.com/embed/D0_w81Q-P3M', '2023-01-01', 110, 'Phiêu lưu, Gia đình', 0, 1, 0, '2025-11-19 02:57:27', '2025-11-19 03:08:29'),
(9, 'Em và Trịnh', 'Bộ phim tái hiện cuộc đời và những mối tình của nhạc sĩ Trịnh Công Sơn. Phim là bức tranh lãng mạn về âm nhạc, tình yêu và những nàng thơ đã đi qua cuộc đời ông.', '/assets/images/movies/Em và trịnh.jpeg', '/assets/images/movies/Em và trịnh.jpeg', 'https://www.youtube.com/embed/zzik4JB9D1Q', '2022-01-01', 136, 'Tiểu sử, Lãng mạn', 0, 1, 0, '2025-11-19 02:57:27', '2025-11-19 03:08:29'),
(10, 'Con Nhót Mót Chồng', 'Câu chuyện hài hước và cảm động về Nhót, một người phụ nữ quá lứa sống cùng người cha nghiện rượu. Hành trình tìm chồng của Nhót cũng là hành trình cô hàn gắn tình cảm với cha mình.', '/assets/images/movies/Con nhót một chồng.webp', '/assets/images/movies/Con nhót một chồng.webp', 'https://www.youtube.com/embed/e7KHOQ-alqY', '2023-01-01', 90, 'Hài, Gia đình', 0, 1, 0, '2025-11-19 02:57:27', '2025-11-19 03:08:29'),
(11, 'Siêu Lừa Gặp Siêu Lầy', 'Khoa, một tên lừa đảo, đến Phú Quốc với ý định lừa đảo. Anh gặp Tú, một tên lừa đảo lầy lội khác. Cả hai hợp tác trong nhiều phi vụ dở khóc dở cười trước khi đối mặt với một đối thủ lớn.', '/assets/images/movies/Siêu lừa gặp siêu lầy.webp', '/assets/images/movies/Siêu lừa gặp siêu lầy.webp', 'https://www.youtube.com/embed/oNqD2HxBUq4', '2023-01-01', 112, 'Hài, Hành động', 0, 1, 0, '2025-11-19 02:57:27', '2025-11-19 03:08:29');

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`id`, `name`) VALUES
(1, 'Phòng 1'),
(2, 'Phòng 2');

-- --------------------------------------------------------

--
-- Table structure for table `seats`
--

CREATE TABLE `seats` (
  `id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `seat_code` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `seats`
--

INSERT INTO `seats` (`id`, `room_id`, `seat_code`) VALUES
(1, 1, 'A1'),
(2, 1, 'A2'),
(3, 1, 'A3'),
(4, 1, 'A4'),
(5, 1, 'A5'),
(6, 1, 'A6'),
(7, 1, 'A7'),
(8, 1, 'A8'),
(9, 1, 'A9'),
(10, 1, 'A10'),
(11, 1, 'A11'),
(12, 1, 'A12'),
(13, 1, 'B1'),
(14, 1, 'B2'),
(15, 1, 'B3'),
(16, 1, 'B4'),
(17, 1, 'B5'),
(18, 1, 'B6'),
(19, 1, 'B7'),
(20, 1, 'B8'),
(21, 1, 'B9'),
(22, 1, 'B10'),
(23, 1, 'B11'),
(24, 1, 'B12'),
(25, 1, 'C1'),
(26, 1, 'C2'),
(27, 1, 'C3'),
(28, 1, 'C4'),
(29, 1, 'C5'),
(30, 1, 'C6'),
(31, 1, 'C7'),
(32, 1, 'C8'),
(33, 1, 'C9'),
(34, 1, 'C10'),
(35, 1, 'C11'),
(36, 1, 'C12'),
(37, 1, 'D1'),
(38, 1, 'D2'),
(39, 1, 'D3'),
(40, 1, 'D4'),
(41, 1, 'D5'),
(42, 1, 'D6'),
(43, 1, 'D7'),
(44, 1, 'D8'),
(45, 1, 'D9'),
(46, 1, 'D10'),
(47, 1, 'D11'),
(48, 1, 'D12'),
(49, 1, 'E1'),
(50, 1, 'E2'),
(51, 1, 'E3'),
(52, 1, 'E4'),
(53, 1, 'E5'),
(54, 1, 'E6'),
(55, 1, 'E7'),
(56, 1, 'E8'),
(57, 1, 'E9'),
(58, 1, 'E10'),
(59, 1, 'E11'),
(60, 1, 'E12'),
(61, 1, 'F1'),
(62, 1, 'F2'),
(63, 1, 'F3'),
(64, 1, 'F4'),
(65, 1, 'F5'),
(66, 1, 'F6'),
(67, 1, 'F7'),
(68, 1, 'F8'),
(69, 1, 'F9'),
(70, 1, 'F10'),
(71, 1, 'F11'),
(72, 1, 'F12'),
(73, 1, 'G1'),
(74, 1, 'G2'),
(75, 1, 'G3'),
(76, 1, 'G4'),
(77, 1, 'G5'),
(78, 1, 'G6'),
(79, 1, 'G7'),
(80, 1, 'G8'),
(81, 1, 'G9'),
(82, 1, 'G10'),
(83, 1, 'G11'),
(84, 1, 'G12'),
(85, 1, 'H1'),
(86, 1, 'H2'),
(87, 1, 'H3'),
(88, 1, 'H4'),
(89, 1, 'H5'),
(90, 1, 'H6'),
(91, 1, 'H7'),
(92, 1, 'H8'),
(93, 1, 'H9'),
(94, 1, 'H10'),
(95, 1, 'H11'),
(96, 1, 'H12'),
(97, 1, 'I1'),
(98, 1, 'I2'),
(99, 1, 'I3'),
(100, 1, 'I4'),
(101, 1, 'I5'),
(102, 1, 'I6'),
(103, 1, 'I7'),
(104, 1, 'I8'),
(105, 1, 'I9'),
(106, 1, 'I10'),
(107, 1, 'I11'),
(108, 1, 'I12'),
(109, 1, 'J1'),
(110, 1, 'J2'),
(111, 1, 'J3'),
(112, 1, 'J4'),
(113, 1, 'J5'),
(114, 1, 'J6'),
(115, 1, 'J7'),
(116, 1, 'J8'),
(117, 1, 'J9'),
(118, 1, 'J10'),
(119, 1, 'J11'),
(120, 1, 'J12');

-- --------------------------------------------------------

--
-- Table structure for table `showtimes`
--

CREATE TABLE `showtimes` (
  `id` int(11) NOT NULL,
  `movie_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `show_date` date NOT NULL,
  `show_time` time NOT NULL,
  `price` int(11) NOT NULL DEFAULT 75000,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role`, `created_at`) VALUES
(1, 'hienminh7383', 'hienminh7383@gmail.com', '$2y$10$X31kJINyzwSVX32ZlAc.ae284jw0HvKm6z5q8cLhS171AqwnIExvm', 'user', '2025-11-13 11:46:05'),
(2, 'admin', 'admin123@gmail.com', '$2y$10$MTPlin8WcMhdbMl/ahkWDOrKiJrrTeP5k1AXZNKhgBbOpocR0E5Zy', 'user', '2025-11-14 03:13:48');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `showtime_id` (`showtime_id`);

--
-- Indexes for table `booking_seats`
--
ALTER TABLE `booking_seats`
  ADD PRIMARY KEY (`id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `seat_id` (`seat_id`);

--
-- Indexes for table `movies`
--
ALTER TABLE `movies`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `seats`
--
ALTER TABLE `seats`
  ADD PRIMARY KEY (`id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indexes for table `showtimes`
--
ALTER TABLE `showtimes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `movie_id` (`movie_id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `booking_seats`
--
ALTER TABLE `booking_seats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `movies`
--
ALTER TABLE `movies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `seats`
--
ALTER TABLE `seats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;

--
-- AUTO_INCREMENT for table `showtimes`
--
ALTER TABLE `showtimes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`showtime_id`) REFERENCES `showtimes` (`id`);

--
-- Constraints for table `booking_seats`
--
ALTER TABLE `booking_seats`
  ADD CONSTRAINT `booking_seats_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `booking_seats_ibfk_2` FOREIGN KEY (`seat_id`) REFERENCES `seats` (`id`);

--
-- Constraints for table `seats`
--
ALTER TABLE `seats`
  ADD CONSTRAINT `seats_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`);

--
-- Constraints for table `showtimes`
--
ALTER TABLE `showtimes`
  ADD CONSTRAINT `showtimes_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`),
  ADD CONSTRAINT `showtimes_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
