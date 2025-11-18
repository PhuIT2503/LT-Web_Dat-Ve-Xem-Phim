/* === NỘI DUNG MỚI CHO frontend/js/auth.js === */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Gọi các hàm setup cho header (luôn chạy)
    addHeaderScrollEffect();
    setupModalListeners();
    setupHeaderSearchListeners();
    setupUserMenuListeners(); // Xử lý click
    
    // 2. KIỂM TRA ĐĂNG NHẬP (luôn chạy)
    await checkLoginStatus(); 

    // 3. Gán sự kiện cho form Đăng nhập (nếu có trên trang này)
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }

    // 4. Gán sự kiện cho form Đăng kí (nếu có trên trang này)
    const registerForm = document.getElementById("register-form");
    if (registerForm) {
        registerForm.addEventListener("submit", handleRegister);
    }
});

/**
 * Xử lý sự kiện submit form Đăng nhập
 */
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const btn = document.querySelector("#login-form .btn-primary");
    btn.disabled = true;
    btn.textContent = "Đang xử lý...";

    try {
        const res = await fetch(
            "http://localhost/LT-Web_Dat-Ve-Xem-Phim/backend/api/auth/login.php",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password })
            }
        );

        const data = await res.json();
        alert(data.message);

        if (res.ok) {
            window.location.href = "index.html"; // Chuyển về trang chủ
        } else {
            btn.disabled = false;
            btn.textContent = "Đăng Nhập";
        }
    } catch (err) {
        alert("Lỗi kết nối máy chủ.");
        btn.disabled = false;
        btn.textContent = "Đăng Nhập";
    }
}

/**
 * Xử lý sự kiện submit form Đăng kí
 */
async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPass = document.getElementById("confirm-password").value;

    if (password !== confirmPass) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
    }

    const btn = document.querySelector("#register-form .btn-primary");
    btn.disabled = true;
    btn.textContent = "Đang xử lý...";

    try {
        const res = await fetch(
            "http://localhost/LT-Web_Dat-Ve-Xem-Phim/backend/api/auth/register.php",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ username, email, password })
            }
        );

        const data = await res.json();
        alert(data.message);

        if (res.ok) { // 201 Created
            window.location.href = "login.html"; // Chuyển sang trang đăng nhập
        } else {
            btn.disabled = false;
            btn.textContent = "Đăng Kí";
        }
    } catch (err) {
        alert("Lỗi kết nối máy chủ.");
        btn.disabled = false;
        btn.textContent = "Đăng Kí";
    }
}


/* ==========================================================
   ⭐⭐⭐ CÁC HÀM HELPER CHUẨN (CHO TẤT CẢ CÁC TRANG) ⭐⭐⭐
   ========================================================== */

/**
 * ⭐ HÀM CHUẨN 1: Kiểm tra trạng thái đăng nhập
 * Gọi API me.php và cập nhật UI
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
        updateHeaderUI(null); // Lỗi -> coi như chưa đăng nhập
    }
}

/**
 * ⭐ HÀM CHUẨN 2: Cập nhật UI Header
 * @param {string|null} username Tên người dùng, hoặc null nếu chưa đăng nhập
 */
function updateHeaderUI(username) {
    const userMenuBtn = document.getElementById("user-menu-btn");
    const userDropdown = document.getElementById("user-dropdown");

    if (!userMenuBtn || !userDropdown) return;

    if (username) {
        // ĐÃ ĐĂNG NHẬP
        userMenuBtn.innerHTML = `<i class="fa-solid fa-user"></i> Chào, ${username}`;
        userDropdown.innerHTML = `
            <a href="#">Tài khoản của tôi</a>
            <a href="#" id="logout-btn">Đăng xuất</a>
        `;
        setupLogoutListener();
    } else {
        // CHƯA ĐĂNG NHẬP
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


/* ==========================================================
   CÁC HÀM HELPER CƠ BẢN (COPY TỪ CÁC FILE KHÁC)
   ========================================================== */

function addHeaderScrollEffect() {
    const header = document.querySelector('.main-header');
    if (!header) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    });
}

function setupModalListeners() {
    const modal = document.getElementById('trailer-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const trailerIframe = document.getElementById('trailer-iframe');
    if (!modal || !closeBtn || !trailerIframe) return;

    document.body.addEventListener('click', (event) => {
        const openBtn = event.target.closest('.btn-open-modal');
        if (openBtn) {
            const url = openBtn.dataset.trailerUrl;
            if (url) {
                trailerIframe.src = `${url}?autoplay=1`;
                modal.classList.add('active');
            }
        }
    });

    function closeModal() {
        modal.classList.remove('active');
        trailerIframe.src = '';
    }
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });
}

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
    if (!btn || !dropdown) return;

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