// Chờ cho toàn bộ nội dung HTML được tải xong
document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
});

/**
 * Hàm chính khởi tạo trang web
 * Tải các thành phần và dữ liệu
 */
async function initializeApp() {
    try {
        // Tải các thành phần HTML tĩnh (header, footer, modal, banner shell)
        // Promise.all giúp tải song song cho nhanh
        await Promise.all([
            // ĐÃ SỬA: Dùng đường dẫn tương đối (không có / ở đầu)
            loadComponent("#header-placeholder", "components/header.html"),
            loadComponent("#footer-placeholder", "components/footer.html"),
            loadComponent("#modal-placeholder", "components/modal-trailer.html"),
            loadComponent("#banner-slider-placeholder", "components/banner-slider.html")
        ]);

        // Sau khi banner shell đã tải xong, điền dữ liệu vào
        populateBannerData(mockData.banner);

        // Tải khuôn mẫu movie-card và dùng nó để tạo các grid
        await populateMovieGrids();

        // Sau khi MỌI THỨ đã tải xong, mới gán các sự kiện
        addHeaderScrollEffect();
        setupModalListeners();

    } catch (error) {
        console.error("Lỗi khởi tạo trang:", error);
    }
}

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
        document.querySelector(placeholderId).innerHTML = html;
    } catch (error) {
        console.error(`Lỗi khi tải component ${componentUrl}:`, error);
        document.querySelector(placeholderId).innerHTML = `<p style="color:red;">Lỗi tải ${componentUrl}</p>`;
    }
}

/**
 * Điền dữ liệu (từ mock-data) vào banner (đã được loadComponent tải về)
 * @param {object} bannerData - Dữ liệu banner từ mockData
 */
function populateBannerData(bannerData) {
    const bannerContainer = document.querySelector(".banner-slider-container");
    if (!bannerContainer) return;

    const titleEl = bannerContainer.querySelector(".banner-title");
    const descEl = bannerContainer.querySelector(".banner-description");
    const trailerBtn = bannerContainer.querySelector(".btn-open-modal");

    bannerContainer.style.backgroundImage = `url(${bannerData.imageUrl})`;
    titleEl.textContent = bannerData.title;
    descEl.textContent = bannerData.description;
    trailerBtn.dataset.trailerUrl = bannerData.trailerUrl;
}

/**
 * Tải khuôn mẫu movie-card, sau đó dùng nó để điền dữ liệu
 * cho cả 2 khu vực phim mới và phim thịnh hành.
 */
async function populateMovieGrids() {
    try {
        // 1. Tải khuôn mẫu (template) của movie-card
        // ĐÃ SỬA: Dùng đường dẫn tương đối (không có / ở đầu)
        const response = await fetch("components/movie-card.html");
        if (!response.ok) {
            throw new Error("Không thể tải components/movie-card.html");
        }
        const cardTemplate = await response.text(); // Lấy HTML thô

        // 2. Lấy vị trí các grid
        const newMoviesGrid = document.getElementById("new-movies-grid");
        const trendingMoviesGrid = document.getElementById("trending-movies-grid");

        // 3. Tạo HTML cho Phim Mới
        let newMoviesHtml = "";
        mockData.newMovies.forEach(movie => {
            newMoviesHtml += createCardFromTemplate(cardTemplate, movie);
        });
        newMoviesGrid.innerHTML = newMoviesHtml;

        // 4. Tạo HTML cho Phim Thịnh Hành
        let trendingMoviesHtml = "";
        mockData.trendingMovies.forEach(movie => {
            trendingMoviesHtml += createCardFromTemplate(cardTemplate, movie);
        });
        trendingMoviesGrid.innerHTML = trendingMoviesHtml;

    } catch (error) {
        console.error("Lỗi khi tạo movie grids:", error);
    }
}

/**
 * Hàm helper: Thay thế các placeholder trong template bằng dữ liệu thật
 * @param {string} template - Chuỗi HTML của movie-card.html
 * @param {object} movie - Đối tượng phim từ mockData
 * @returns {string} - Chuỗi HTML của card đã điền dữ liệu
 */
function createCardFromTemplate(template, movie) {
    return template
        .replace(/{id}/g, movie.id) // <-- THÊM DÒNG NÀY
        .replace(/{trailerUrl}/g, movie.trailerUrl)
        .replace(/{imageUrl}/g, movie.imageUrl)
        .replace(/{title}/g, movie.title)
        .replace(/{year}/g, movie.year);
}

// --- CÁC HÀM SỰ KIỆN (Không đổi) ---

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