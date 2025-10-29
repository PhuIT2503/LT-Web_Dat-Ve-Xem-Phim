// Chờ cho toàn bộ nội dung HTML được tải xong
document.addEventListener("DOMContentLoaded", () => {
    initializeDetailPage();
});

/**
 * Hàm chính khởi tạo trang chi tiết
 */
async function initializeDetailPage() {
    try {
        // Tải các thành phần chung (header, footer, modal)
        // Chúng ta cần các hàm này hoạt động trên trang chi tiết
        await Promise.all([
            loadComponent("#header-placeholder", "components/header.html"),
            loadComponent("#footer-placeholder", "components/footer.html"),
            loadComponent("#modal-placeholder", "components/modal-trailer.html")
        ]);

        // Gán các sự kiện cho header và modal (sau khi chúng được tải)
        addHeaderScrollEffect();
        setupModalListeners();

        // Xử lý logic riêng của trang chi tiết
        loadMovieData();

    } catch (error) {
        console.error("Lỗi khởi tạo trang chi tiết:", error);
    }
}

/**
 * Tải dữ liệu phim dựa trên ID từ URL
 */
function loadMovieData() {
    // 1. Lấy ID từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (!movieId) {
        console.error("Không tìm thấy ID phim.");
        document.getElementById("detail-title").textContent = "Lỗi: Không tìm thấy phim";
        return;
    }

    // 2. Tìm phim trong mockData
    const movie = findMovieById(movieId);

    if (!movie) {
        console.error("Không tìm thấy phim với ID:", movieId);
        document.getElementById("detail-title").textContent = "Lỗi: Không tìm thấy phim";
        return;
    }

    // 3. Lấp đầy (populate) dữ liệu vào trang
    populateDetailPage(movie);
}

/**
 * Tìm kiếm phim trong tất cả các danh sách
 * @param {string} id - ID của phim (dưới dạng string từ URL)
 * @returns {object|null} - Đối tượng phim hoặc null
 */
function findMovieById(id) {
    // Chuyển ID (string) sang số nguyên để so sánh
    const numericId = parseInt(id, 10);

    // Tạo một mảng chứa tất cả phim
    const allMovies = [
        mockData.banner,
        ...mockData.newMovies,
        ...mockData.trendingMovies
    ];

    // Dùng .find() để tìm phim đầu tiên khớp ID
    return allMovies.find(movie => movie.id === numericId) || null;
}

/**
 * Lấp đầy dữ liệu phim vào các phần tử HTML
 * @param {object} movie - Đối tượng phim tìm được
 */
function populateDetailPage(movie) {
    // Cập nhật tiêu đề trang
    document.title = `${movie.title} - Web Xem Phim`;

    // Lấy các phần tử
    const backdrop = document.querySelector(".detail-backdrop");
    const poster = document.getElementById("detail-poster-img");
    const title = document.getElementById("detail-title");
    const year = document.getElementById("detail-year");
    const description = document.getElementById("detail-description");
    const trailerBtn = document.getElementById("detail-trailer-btn");

    // Điền dữ liệu
    backdrop.style.backgroundImage = `url(${movie.imageUrl})`;
    poster.src = movie.imageUrl;
    poster.alt = movie.title;
    title.textContent = movie.title;
    year.textContent = `Năm phát hành: ${movie.year}`;
    description.textContent = movie.description || "Nội dung phim đang được cập nhật...";
    trailerBtn.dataset.trailerUrl = movie.trailerUrl;
}


// --- CÁC HÀM TIỆN ÍCH (Copy từ main.js) ---
// (Vì trang này cũng cần tải header/footer/modal)

/**
 * Hàm chung để tải HTML từ 1 file vào 1 vị trí (placeholder)
 * @param {string} placeholderId - ID của div (ví dụ: "#header-placeholder")
 * @param {string} componentUrl - Đường dẫn tới file (ví dụ: "components/header.html")
 */
async function loadComponent(placeholderId, componentUrl) {
    try {
        const response = await fetch(componentUrl);
        if (!response.ok) {
            throw new Error(`Không thể tải ${componentUrl}: ${response.statusText}`);
        }
        const html = await response.text();
        const placeholder = document.querySelector(placeholderId);
        if (placeholder) {
            placeholder.innerHTML = html;
        }
    } catch (error) {
        console.error(`Lỗi khi tải component ${componentUrl}:`, error);
        const placeholder = document.querySelector(placeholderId);
        if (placeholder) {
            placeholder.innerHTML = `<p style="color:red;">Lỗi tải ${componentUrl}</p>`;
        }
    }
}

/**
 * Thêm hiệu ứng đổi màu header khi cuộn chuột
 */
function addHeaderScrollEffect() {
    const header = document.querySelector(".main-header");
    if (!header) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });
}

/**
 * Thêm sự kiện Bật/Tắt cho Modal Trailer
 */
function setupModalListeners() {
    const modal = document.getElementById("trailer-modal");
    const closeBtn = document.getElementById("modal-close-btn");
    const trailerIframe = document.getElementById("trailer-iframe");

    if (!modal || !closeBtn || !trailerIframe) {
        console.warn("Không tìm thấy các thành phần của Modal.");
        return;
    }

    // Dùng event delegation (ủy quyền sự kiện) trên body
    document.body.addEventListener("click", (event) => {
        const openBtn = event.target.closest(".btn-open-modal");
        if (openBtn) {
            const url = openBtn.dataset.trailerUrl;
            if (url) {
                trailerIframe.src = `${url}?autoplay=1`; // Tự động phát
                modal.classList.add("active");
            }
        }
    });

    // Hàm đóng modal
    function closeModal() {
        modal.classList.remove("active");
        trailerIframe.src = ""; // Dừng video
    }

    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
        // Nếu click vào nền mờ (chính là modal) thì đóng
        if (event.target === modal) {
            closeModal();
        }
    });
}