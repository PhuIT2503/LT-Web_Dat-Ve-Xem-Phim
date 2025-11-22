const API_BASE_URL = "http://localhost/LT-Web_Dat-Ve-Xem-Phim/backend/api";

document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
});

async function initializeApp() {
    try {
        // 1. Load HTML components
        await Promise.all([
            loadComponent("#header-placeholder", "components/header.html"),
            loadComponent("#footer-placeholder", "components/footer.html"),
            loadComponent("#modal-placeholder", "components/modal-trailer.html"),
            loadComponent("#banner-slider-placeholder", "components/banner-slider.html")
        ]);

        // 2. Check login & Setup Header
        await checkLoginStatus();
        addHeaderScrollEffect();
        setupModalListeners();
        setupUserMenuListeners();
        setupHeaderSearchListeners();

        // 3. ⭐ GỌI API THAY VÌ DÙNG MOCKDATA ⭐
        await loadBanner();         
        await loadMovieGrids();     

    } catch (error) {
        console.error("Lỗi khởi tạo trang:", error);
    }
}

// --- LOAD BANNER TỪ API ---
async function loadBanner() {
    try {
        // Lấy phim có ID = 1 làm banner
        const res = await fetch(`${API_BASE_URL}/movies/detail.php?id=1`);
        if (!res.ok) return;
        const movie = await res.json();
        populateBannerData(movie);
    } catch (err) {
        console.error("Lỗi tải banner:", err);
    }
}

function populateBannerData(movie) {
    const banner = document.querySelector(".banner-slider-container");
    if (!banner) return;

    const bgImage = movie.bannerUrl || movie.imageUrl;
    banner.style.backgroundImage = `url(${bgImage})`;
    banner.querySelector(".banner-title").textContent = movie.title;
    banner.querySelector(".banner-description").textContent = movie.description;

    const trailerBtn = banner.querySelector(".btn-open-modal");
    if (trailerBtn) trailerBtn.dataset.trailerUrl = movie.trailerUrl;

    const watchBtn = banner.querySelector(".btn.btn-primary");
    if (watchBtn) {
        watchBtn.addEventListener("click", () => {
            window.location.href = `movie-detail.html?id=${movie.id}`;
        });
    }
}

// --- LOAD DANH SÁCH PHIM TỪ API ---
async function loadMovieGrids() {
    try {
        const templateRes = await fetch("components/movie-card.html");
        const template = await templateRes.text();

        // 1. Phim Mới
        const newRes = await fetch(`${API_BASE_URL}/movies/list.php?type=new`);
        const newMovies = await newRes.json();
        renderGrid("new-movies-grid", newMovies, template);

        // 2. Phim Thịnh Hành
        const trendRes = await fetch(`${API_BASE_URL}/movies/list.php?type=trending`);
        const trendMovies = await trendRes.json();
        renderGrid("trending-movies-grid", trendMovies, template);

    } catch (err) {
        console.error("Lỗi tải danh sách phim:", err);
    }
}

function renderGrid(elementId, movies, template) {
    const container = document.getElementById(elementId);
    if (!container) return;

    if (!movies || movies.length === 0) {
        container.innerHTML = "<p style='color:white'>Đang cập nhật phim...</p>";
        return;
    }

    container.innerHTML = movies.map(m => {
        const year = m.release_date ? m.release_date.split('-')[0] : '2025';
        return template
            .replace(/{id}/g, m.id)
            .replace(/{imageUrl}/g, m.imageUrl)
            .replace(/{title}/g, m.title)
            .replace(/{year}/g, year);
    }).join("");
}

// --- CÁC HÀM HELPER KHÁC ---
async function loadComponent(id, url) { try { document.querySelector(id).innerHTML = await (await fetch(url)).text(); } catch(e){} }
async function checkLoginStatus() { try { const res = await fetch(`${API_BASE_URL}/auth/me.php`, {credentials:"include"}); const data=await res.json(); updateHeaderUI(res.ok?data.username:null); } catch(e){} }
function updateHeaderUI(username) { 
    const btn = document.getElementById("user-menu-btn");
    const dropdown = document.getElementById("user-dropdown");
    if (username) {
        btn.innerHTML = `<i class="fa-solid fa-user"></i> ${username}`;
        dropdown.innerHTML = `<a href="profile.html">Tài khoản</a><a href="#" id="logout-btn">Đăng xuất</a>`;
        setTimeout(() => { document.getElementById('logout-btn')?.addEventListener('click', async (e)=>{ e.preventDefault(); await fetch(`${API_BASE_URL}/auth/logout.php`, {credentials:"include"}); window.location.href="index.html"; })}, 500);
    } else {
        btn.innerHTML = `<i class="fa-solid fa-user"></i>`;
        dropdown.innerHTML = `<a href="login.html">Đăng nhập</a><a href="register.html">Đăng kí</a>`;
    }
}
function addHeaderScrollEffect() { const h=document.querySelector('.main-header'); if(h) window.addEventListener('scroll', ()=>h.classList.toggle('scrolled', window.scrollY>50)); }
function setupModalListeners() { 
    const modal = document.getElementById("trailer-modal");
    const iframe = document.getElementById("trailer-iframe");
    const closeBtn = document.getElementById("modal-close-btn");
    if(!modal) return;
    document.body.addEventListener("click", e => {
        const btn = e.target.closest(".btn-open-modal");
        if(btn) { iframe.src = `${btn.dataset.trailerUrl}?autoplay=1`; modal.classList.add("active"); }
    });
    closeBtn?.addEventListener("click", ()=>{ modal.classList.remove("active"); iframe.src=""; });
}
function setupUserMenuListeners() {
    const btn = document.getElementById('user-menu-btn');
    const dropdown = document.getElementById('user-dropdown');
    if(btn) btn.addEventListener('click', (e) => { e.stopPropagation(); dropdown.classList.toggle('active'); });
    window.addEventListener('click', () => dropdown?.classList.remove('active'));
}
function setupHeaderSearchListeners() {
    const input = document.getElementById('header-search-input');
    const btn = document.getElementById('header-search-btn');
    if(!input) return;
    const doSearch = () => { const q = input.value.trim(); window.location.href = q ? `movies.html?q=${encodeURIComponent(q)}` : "movies.html"; };
    input.addEventListener('keydown', e => e.key === 'Enter' && doSearch());
    btn.addEventListener('click', doSearch);
}