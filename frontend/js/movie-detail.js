// Chờ cho toàn bộ nội dung HTML được tải xong
document.addEventListener("DOMContentLoaded", () => {
    initializeDetailPage();
});

/**
 * Hàm chính khởi tạo trang chi tiết
 */
// ⭐ CẬP NHẬT: Thêm 'async'
async function initializeDetailPage() {
    try {
        // Tải các thành phần chung (header, footer, modal)
        await Promise.all([
            loadComponent("#header-placeholder", "components/header.html"),
            loadComponent("#footer-placeholder", "components/footer.html"),
            loadComponent("#modal-placeholder", "components/modal-trailer.html")
        ]);

        // ⭐ CẬP NHẬT: Gọi hàm kiểm tra đăng nhập
        await checkLoginStatus(); 

        // Gán các sự kiện cho header và modal
        addHeaderScrollEffect();
        setupModalListeners();
        setupHeaderSearchListeners(); // Thêm hàm này
        setupUserMenuListeners(); // Xử lý click

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
 */
function populateDetailPage(movie) {
    document.title = `${movie.title} - Web Xem Phim`;
    const backdrop = document.querySelector(".detail-backdrop");
    const poster = document.getElementById("detail-poster-img");
    const title = document.getElementById("detail-title");
    const description = document.getElementById("detail-description");
    const trailerBtn = document.getElementById("detail-trailer-btn");
    const year = document.getElementById("detail-year");
    const duration = document.getElementById("detail-duration");
    const rating = document.getElementById("detail-rating");
    const genre = document.getElementById("detail-genre");
    const director = document.getElementById("detail-director");
    const cast = document.getElementById("detail-cast");

    backdrop.style.backgroundImage = `url(${movie.imageUrl})`;
    poster.src = movie.imageUrl;
    poster.alt = movie.title;
    title.textContent = movie.title;
    description.textContent = movie.description || "Nội dung phim đang được cập nhật...";
    trailerBtn.dataset.trailerUrl = movie.trailerUrl;

    const bookBtn = document.querySelector('.detail-actions .btn-primary');
    if (bookBtn) {
        bookBtn.addEventListener('click', () => {
            window.location.href = `booking.html?id=${movie.id}`;
        });
    }

    year.textContent = movie.year || "N/A";
    duration.textContent = movie.duration || "N/A";
    rating.textContent = movie.rating || "N/A";
    genre.textContent = movie.genre || "Đang cập nhật";
    director.textContent = movie.director || "Đang cập nhật";
    cast.textContent = movie.cast || "Đang cập nhật";
}


// --- CÁC HÀM TIỆN ÍCH (Không thay đổi) ---
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

// ⭐ HÀM MỚI: Thêm hàm setupHeaderSearchListeners
function setupHeaderSearchListeners() {
    const input = document.getElementById('header-search-input');
    const btn = document.getElementById('header-search-btn');
    if (!input || !btn) return;
    function doSearch() {
        const q = input.value.trim();
        window.location.href = q === '' ? 'movies.html' : `movies.html?q=${encodeURIComponent(q)}`;
    }
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
    btn.addEventListener('click', doSearch);
}

function setupUserMenuListeners() {
    const btn = document.getElementById('user-menu-btn');
    const dropdown = document.getElementById('user-dropdown');
    if (!btn || !dropdown) {
        console.warn('Không tìm thấy các thành phần của User Menu.');
        return;
    }
    btn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        dropdown.classList.toggle('active');
    });
    window.addEventListener('click', (e) => {
        if (dropdown.classList.contains('active')) {
            if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        }
    });
}


/* ==========================================================
   ⭐⭐⭐ CÁC HÀM CHUẨN XỬ LÝ LOGIN/LOGOUT ⭐⭐⭐
   (Dán 3 hàm mới vào đây)
   ========================================================== */

/**
 * ⭐ HÀM CHUẨN 1: Kiểm tra trạng thái đăng nhập
 */
async function checkLoginStatus() {
    try {
        const res = await fetch(
            "http://localhost/LT-Web_Dat-Ve-Xem-Phim/backend/api/auth/me.php",
            {
                method: "GET",
                credentials: "include" 
            }
        );
        const data = await res.json();
        updateHeaderUI(res.ok ? data.username : null);
    } catch (err) {
        console.error("Lỗi check login:", err);
        updateHeaderUI(null);
    }
}

/**
 * ⭐ HÀM CHUẨN 2: Cập nhật UI Header
 */
function updateHeaderUI(username) {
    const userMenuBtn = document.getElementById("user-menu-btn");
    const userDropdown = document.getElementById("user-dropdown");

    if (!userMenuBtn || !userDropdown) return;

    if (username) {
        userMenuBtn.innerHTML = `<i class="fa-solid fa-user"></i>Xin chào, ${username} !`;
        userDropdown.innerHTML = `
            <a href="profile.html">Tài khoản của tôi</a> <a href="#" id="logout-btn">Đăng xuất</a>

        `;
        // Phải gọi lại setupLogoutListener() ngay sau khi tạo nút
        setupLogoutListener();
    } else {
        userMenuBtn.innerHTML = `<i class="fa-solid fa-user"></i>`;
        userDropdown.innerHTML = `
            <a href="login.html">Đăng nhập</a>
            <a href="register.html">Đăng kí</a>
        `;
    }
}

/**
 * ⭐ HÀM CHUẨN 3: Gán sự kiện cho nút Đăng xuất
 */
function setupLogoutListener() {
    const btn = document.getElementById("logout-btn");
    if (!btn) return;

    btn.addEventListener("click", async (e) => {
        e.preventDefault();
        await fetch(
            "http://localhost/LT-Web_Dat-Ve-Xem-Phim/backend/api/auth/me.php",
            { credentials: "include" }
        );
        updateHeaderUI(null); 
        window.location.href = "index.html";
    });
}