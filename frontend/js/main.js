// Chờ cho toàn bộ nội dung HTML được tải xong
document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
});

/**
 * Hàm chính khởi tạo trang web
 */
async function initializeApp() {
    try {
        // Tải HTML của header/footer/modal/banner
        await Promise.all([
            loadComponent("#header-placeholder", "components/header.html"),
            loadComponent("#footer-placeholder", "components/footer.html"),
            loadComponent("#modal-placeholder", "components/modal-trailer.html"),
            loadComponent("#banner-slider-placeholder", "components/banner-slider.html")
        ]);

        // ⭐ MUST HAVE: Kiểm tra đăng nhập sau khi header load
        // (Chỉ cần gọi 1 lần ở đây)
        await checkLoginStatus();

        // Dữ liệu banner
        populateBannerData(mockData.banner);

        // Dữ liệu phim
        await populateMovieGrids();
        
        // (Đã xóa dòng 'await checkLoginStatus();' bị lặp ở đây)

        // Gán các sự kiện giao diện
        addHeaderScrollEffect();
        setupModalListeners();
        setupHeaderSearchListeners();

        // ⭐ Gán lại sự kiện user-menu vì header vừa load xong
        setupUserMenuListeners();

    } catch (error) {
        console.error("Lỗi khởi tạo trang:", error);
    }
}

/**
 * Tải component HTML
 */
async function loadComponent(placeholderId, componentUrl) {
    try {
        const response = await fetch(componentUrl);
        if (!response.ok) throw new Error(`Lỗi tải ${componentUrl}`);

        document.querySelector(placeholderId).innerHTML = await response.text();
    } catch (err) {
        console.error(err);
        document.querySelector(placeholderId).innerHTML =
            `<p style="color:red;">Không thể tải ${componentUrl}</p>`;
    }
}

/** ---------------- BANNER ------------------- */
function populateBannerData(bannerData) {
    const banner = document.querySelector(".banner-slider-container");
    if (!banner) return;

    banner.style.backgroundImage = `url(${bannerData.imageUrl})`;
    banner.querySelector(".banner-title").textContent = bannerData.title;
    banner.querySelector(".banner-description").textContent = bannerData.description;

    const trailerBtn = banner.querySelector(".btn-open-modal");
    trailerBtn.dataset.trailerUrl = bannerData.trailerUrl;

    const watchBtn = banner.querySelector(".btn.btn-primary");
    if (watchBtn) {
        watchBtn.addEventListener("click", () => {
            window.location.href = `movie-detail.html?id=${bannerData.id}`;
        });
    }
}

/** ---------------- SEARCH ------------------- */
function setupHeaderSearchListeners() {
    const input = document.getElementById("header-search-input");
    const btn = document.getElementById("header-search-btn");
    if (!input || !btn) return;

    const doSearch = () => {
        const q = input.value.trim();
        window.location.href = q ? `movies.html?q=${encodeURIComponent(q)}` : "movies.html";
    };

    input.addEventListener("keydown", e => e.key === "Enter" && doSearch());
    btn.addEventListener("click", doSearch);
}

/** ---------------- MOVIE GRID ------------------- */
async function populateMovieGrids() {
    try {
        const template = await (await fetch("components/movie-card.html")).text();

        const newMoviesGrid = document.getElementById("new-movies-grid");
        const trendingMoviesGrid = document.getElementById("trending-movies-grid");

        newMoviesGrid.innerHTML = mockData.newMovies
            .map(m => createCard(template, m)).join("");

        trendingMoviesGrid.innerHTML = mockData.trendingMovies
            .map(m => createCard(template, m)).join("");

    } catch (err) {
        console.error("Lỗi movie grid:", err);
    }
}

function createCard(template, movie) {
    return template
        .replace(/{id}/g, movie.id)
        .replace(/{imageUrl}/g, movie.imageUrl)
        .replace(/{title}/g, movie.title)
        .replace(/{year}/g, movie.year)
        .replace(/{trailerUrl}/g, movie.trailerUrl);
}

/** ---------------- HEADER SCROLL ------------------- */
function addHeaderScrollEffect() {
    const header = document.querySelector(".main-header");
    if (!header) return;

    window.addEventListener("scroll", () => {
        header.classList.toggle("scrolled", window.scrollY > 50);
    });
}

/** ---------------- MODAL TRAILER ------------------- */
function setupModalListeners() {
    const modal = document.getElementById("trailer-modal");
    const closeBtn = document.getElementById("modal-close-btn");
    const iframe = document.getElementById("trailer-iframe");

    if (!modal || !closeBtn || !iframe) return;

    document.body.addEventListener("click", e => {
        const btn = e.target.closest(".btn-open-modal");
        if (btn) {
            iframe.src = `${btn.dataset.trailerUrl}?autoplay=1`;
            modal.classList.add("active");
        }
    });

    const close = () => {
        modal.classList.remove("active");
        iframe.src = "";
    };

    closeBtn.addEventListener("click", close);
    modal.addEventListener("click", e => e.target === modal && close());
}

/** ---------------- USER MENU (Sự kiện Click) ------------------- */
function setupUserMenuListeners() {
    const btn = document.getElementById("user-menu-btn");
    const dropdown = document.getElementById("user-dropdown");
    if (!btn || !dropdown) return;

    btn.addEventListener("click", e => {
        e.stopPropagation();
        dropdown.classList.toggle("active");
    });

    window.addEventListener("click", () => dropdown.classList.remove("active"));
}

/* ==========================================================
   ⭐⭐⭐ CÁC HÀM CHUẨN XỬ LÝ LOGIN/LOGOUT ⭐⭐⭐
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
            "http://localhost/LT-Web_Dat-Ve-Xem-Phim/backend/api/auth/logout.php",
            { credentials: "include" }
        );
        updateHeaderUI(null); 
        window.location.href = "index.html";
    });
}