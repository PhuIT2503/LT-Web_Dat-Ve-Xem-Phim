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
        await Promise.all([
            loadComponent("#header-placeholder", "components/header.html"),
            loadComponent("#footer-placeholder", "components/footer.html"),
            loadComponent("#modal-placeholder", "components/modal-trailer.html")
        ]);

        // Gán các sự kiện cho header và modal
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
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (!movieId) {
        console.error("Không tìm thấy ID phim.");
        document.getElementById("detail-title").textContent = "Lỗi: Không tìm thấy phim";
        return;
    }

    const movie = findMovieById(movieId);

    if (!movie) {
        console.error("Không tìm thấy phim với ID:", movieId);
        document.getElementById("detail-title").textContent = "Lỗi: Không tìm thấy phim";
        return;
    }

    // Lấp đầy (populate) dữ liệu vào trang
    populateDetailPage(movie);
}

/**
 * Tìm kiếm phim trong tất cả các danh sách
 * @param {string} id - ID của phim (dưới dạng string từ URL)
 * @returns {object|null} - Đối tượng phim hoặc null
 */
function findMovieById(id) {
    const numericId = parseInt(id, 10);
    const allMovies = [
        mockData.banner,
        ...mockData.newMovies,
        ...mockData.trendingMovies
    ];
    return allMovies.find(movie => movie.id === numericId) || null;
}


/**
 * Lấp đầy dữ liệu phim vào các phần tử HTML
 * @param {object} movie - Đối tượng phim tìm được
 * * NỘI DUNG HÀM NÀY ĐÃ ĐƯỢC CẬP NHẬT
 */
function populateDetailPage(movie) {
    // Cập nhật tiêu đề trang
    document.title = `${movie.title} - Web Xem Phim`;

    // Lấy các phần tử
    const backdrop = document.querySelector(".detail-backdrop");
    const poster = document.getElementById("detail-poster-img");
    const title = document.getElementById("detail-title");
    const description = document.getElementById("detail-description");
    const trailerBtn = document.getElementById("detail-trailer-btn");

    // Lấy các phần tử MỚI
    const year = document.getElementById("detail-year");
    const duration = document.getElementById("detail-duration");
    const rating = document.getElementById("detail-rating");
    const genre = document.getElementById("detail-genre");
    const director = document.getElementById("detail-director");
    const cast = document.getElementById("detail-cast");

    // Điền dữ liệu
    backdrop.style.backgroundImage = `url(${movie.imageUrl})`;
    poster.src = movie.imageUrl;
    poster.alt = movie.title;
    title.textContent = movie.title;
    description.textContent = movie.description || "Nội dung phim đang được cập nhật...";
    trailerBtn.dataset.trailerUrl = movie.trailerUrl;

    // Gán hành vi cho nút Đặt Vé: chuyển tới trang booking với movie id
    const bookBtn = document.querySelector('.detail-actions .btn-primary');
    if (bookBtn) {
        bookBtn.addEventListener('click', () => {
            window.location.href = `booking.html?id=${movie.id}`;
        });
    }

    // Điền dữ liệu MỚI (với giá trị mặc định nếu thiếu)
    year.textContent = movie.year || "N/A";
    duration.textContent = movie.duration || "N/A";
    rating.textContent = movie.rating || "N/A";
    genre.textContent = movie.genre || "Đang cập nhật";
    director.textContent = movie.director || "Đang cập nhật";
    cast.textContent = movie.cast || "Đang cập nhật";
}


// --- CÁC HÀM TIỆN ÍCH (Không thay đổi) ---
// (Copy từ main.js)

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

function setupModalListeners() {
    const modal = document.getElementById("trailer-modal");
    const closeBtn = document.getElementById("modal-close-btn");
    const trailerIframe = document.getElementById("trailer-iframe");

    if (!modal || !closeBtn || !trailerIframe) {
        console.warn("Không tìm thấy các thành phần của Modal.");
        return;
    }

    document.body.addEventListener("click", (event) => {
        const openBtn = event.target.closest(".btn-open-modal");
        if (openBtn) {
            const url = openBtn.dataset.trailerUrl;
            if (url) {
                trailerIframe.src = `${url}?autoplay=1`;
                modal.classList.add("active");
            }
        }
    });

    function closeModal() {
        modal.classList.remove("active");
        trailerIframe.src = "";
    }

    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
}