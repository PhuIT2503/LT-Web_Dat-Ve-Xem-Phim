// Dữ liệu giả lập (Đã cập nhật phim Việt Nam 2022-2025 theo yêu cầu)
const mockData = {
    // Banner: Phim Mưa Đỏ (2025)
    banner: {
        title: "Mưa Đỏ",
        description: "Lấy bối cảnh 81 ngày đêm khốc liệt tại Thành Cổ Quảng Trị năm 1972, Mưa Đỏ là câu chuyện hư cấu, theo chân một tiểu đội gồm những người lính trẻ tuổi, đầy nhiệt huyết, chiến đấu và bám trụ tại trận địa lịch sử này.",
        // Lấy ảnh gốc (original) cho banner nét nhất
        imageUrl: "https://imgchinhsachcuocsong.vnanet.vn/MediaUpload/Org/2025/07/23/204219-z6833331728306_9920591c2fadf96b8ec838e4967f44a4.jpg", 
        trailerUrl: "https://www.youtube.com/embed/BD6PoZJdt_M"
    },
    
    // 5 Phim Mới / Hot (2024-2025)
    newMovies: [
        {
            id: 1,
            title: "Lật Mặt 7: Một Điều Ước",
            year: 2024,
            imageUrl: "https://photo-baomoi.bmcdn.me/w700_r1/2024_03_13_17_48553023/057ac6914bdda283fbcc.jpg",
            trailerUrl: "https://www.youtube.com/embed/d1ZHdosjNX8"
        },
        {
            id: 2,
            title: "Gặp Lại Chị Bầu",
            year: 2024,
            imageUrl: "https://tse3.mm.bing.net/th/id/OIP.xrGKhbdzKrWVQ2urtnnk-AHaK_?rs=1&pid=ImgDetMain&o=7&rm=3",
            trailerUrl: "https://www.youtube.com/embed/8WS_CiekZLc"
        },
        {
            id: 3, // Lấy lại từ ID cũ cho nhất quán
            title: "Nhà Gia Tiên",
            year: 2025,
            imageUrl: "https://st.download.com.vn/data/image/2025/02/14/nha-gia-tien.jpg",
            trailerUrl: "https://www.youtube.com/embed/aR2lnpCLqUk"
        },
        {
            id: 4, // Lấy lại từ ID cũ
            title: "Thám Tử Kiên: Kỳ Án Không Đầu",
            year: 2025,
            imageUrl: "https://tse1.mm.bing.net/th/id/OIP.4HedOsPiqdgGJBNfuEHYUQHaKl?rs=1&pid=ImgDetMain&o=7&rm=3",
            trailerUrl: "https://www.youtube.com/embed/QiXNbEKF3U0"
        },
        {
            id: 5,
            title: "Nhà Bà Nữ",
            year: 2023,
            imageUrl: "https://th.bing.com/th/id/R.4484bb72cef55c45590763e3d98772ed?rik=KN1P4v1nfCF6sA&pid=ImgRaw&r=0",
            trailerUrl: "https://www.youtube.com/embed/4peQFKutH34"
        }
    ],

    // 5 Phim Thịnh Hành (2022-2023)
    trendingMovies: [
        {
            id: 6,
            title: "Lật Mặt 6: Tấm Vé Định Mệnh",
            year: 2023,
            imageUrl: "https://tse3.mm.bing.net/th/id/OIP.gwUCRkCrlItYPT7oEALsKAHaLH?rs=1&pid=ImgDetMain&o=7&rm=3",
            trailerUrl: "https://www.youtube.com/embed/ns9f92mR6bM"
        },
        {
            id: 7,
            title: "Đất Rừng Phương Nam",
            year: 2023,
            imageUrl: "https://tse1.mm.bing.net/th/id/OIP.fAgqmbugm7Fvfh9qY37GkwHaJQ?rs=1&pid=ImgDetMain&o=7&rm=3",
            trailerUrl: "https://www.youtube.com/embed/D0_w81Q-P3M"
        },
        {
            id: 8,
            title: "Em và Trịnh",
            year: 2022,
            imageUrl: "https://tintuc-divineshop.cdn.vccloud.vn/wp-content/uploads/2022/06/review-em-va-trinh_62a329726ea9a.jpeg",
            trailerUrl: "https://www.youtube.com/embed/zzik4JB9D1Q"
        },
        {
            id: 9,
            title: "Con Nhót Mót Chồng",
            year: 2023,
            imageUrl: "https://tse1.explicit.bing.net/th/id/OIP.ycZsFjfDFuRrzw-EGbeosAHaJQ?rs=1&pid=ImgDetMain&o=7&rm=3",
            trailerUrl: "https://www.youtube.com/embed/e7KHOQ-alqY"
        },
        {
            id: 10,
            title: "Siêu Lừa Gặp Siêu Lầy",
            year: 2023,
            imageUrl: "https://tse1.mm.bing.net/th/id/OIP.wqDOC6JOXfblf2BIRrMLlQHaK4?rs=1&pid=ImgDetMain&o=7&rm=3",
            trailerUrl: "https://www.youtube.com/embed/oNqD2HxBUq4"
        }
    ]
};