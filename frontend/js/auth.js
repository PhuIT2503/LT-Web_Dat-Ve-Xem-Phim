document.addEventListener('DOMContentLoaded', () => {
    // Gọi các hàm setup cho header
    addHeaderScrollEffect();
    setupModalListeners();
    setupHeaderSearchListeners();
    setupUserMenuListeners();

    // (Tương lai bạn có thể thêm logicxử lý form đăng nhập/đăng kí ở đây)
    // ví dụ:
    // const loginForm = document.getElementById('login-form');
    // if (loginForm) {
    //     loginForm.addEventListener('submit', (e) => {
    //         e.preventDefault();
    //         console.log('Đang xử lý đăng nhập...');
    //     });
    // }
});


// --- CÁC HÀM HELPER (Copy từ các file JS khác) ---

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

// =========================
// XỬ LÝ LOGIN
// =========================

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("login-form");
    if (!loginForm) return;

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const res = await fetch("http://localhost/LT-Web_Dat-Ve-Xem-Phim/backend/api/auth/login.php", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ email, password }),
            credentials: "include"
        });

        const data = await res.json();
        alert(data.message);

        // ⭐⭐ NẾU LOGIN THÀNH CÔNG → CHUYỂN VỀ TRANG CHỦ
        if (res.ok) {
            window.location.href = "index.html";
        }
    });

});

// =========================
// XỬ LÝ REGISTER
// =========================
document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("register-form");

    if (registerForm) {
        registerForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const username = document.getElementById("username").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            try {
                const res = await fetch("http://localhost/LT-Web_Dat-Ve-Xem-Phim/backend/api/auth/register.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, email, password }),
                    credentials: "include"
                });

                const text = await res.text();
                console.log("REGISTER RAW:", text);

                const data = JSON.parse(text);

                alert(data.message);

                if (data.message === "Đăng ký thành công!") {
                    window.location.href = "login.html";
                }

            } catch (error) {
                console.error("REGISTER ERROR:", error);
                alert("Không thể kết nối server!");
            }
        });
    }
});

// =========================
// XỬ LÝ LOGOUT
// =========================
document.addEventListener("DOMContentLoaded", function () {
    const logoutBtn = document.getElementById("logout-btn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async function (e) {
            e.preventDefault();

            try {
                const res = await fetch("http://localhost/LT-Web_Dat-Ve-Xem-Phim/backend/api/auth/logout.php", {
                    method: "POST",
                    credentials: "include"
                });

                const text = await res.text();
                console.log("LOGOUT RAW:", text);

                const data = JSON.parse(text);

                alert(data.message);

                // quay về trang login
                if (data.message === "Đăng xuất thành công!") {
                    window.location.href = "login.html";
                }

            } catch (error) {
                console.error("LOGOUT ERROR:", error);
                alert("Không thể kết nối server!");
            }
        });
    }
});

// =========================
// KIỂM TRA USER ĐANG ĐĂNG NHẬP (me.php)
// =========================

document.addEventListener("DOMContentLoaded", async function () {
    try {
        const res = await fetch("http://localhost/LT-Web_Dat-Ve-Xem-Phim/backend/api/auth/me.php", {
            method: "GET",
            credentials: "include"
        });

        const text = await res.text();
        console.log("ME RAW:", text);

        const data = JSON.parse(text);

        const userMenuBtn = document.getElementById("user-menu-btn");
        const userDropdown = document.getElementById("user-dropdown");

        if (data.user_id) {
            // Đã đăng nhập
            userMenuBtn.innerHTML = `<i class="fa-solid fa-user"></i> ${data.username}`;
            
            // Thay menu dropdown
            userDropdown.innerHTML = `
                <a href="#">Thông tin tài khoản</a>
                <a href="#" id="logout-btn">Đăng xuất</a>
            `;

            // Gắn sự kiện logout luôn
            const logoutBtn = document.getElementById("logout-btn");
            if (logoutBtn) {
                logoutBtn.addEventListener("click", async function () {
                    const res = await fetch("http://localhost/LT-Web_Dat-Ve-Xem-Phim/backend/api/auth/logout.php", {
                        method: "POST",
                        credentials: "include"
                    });
                    const data = await res.json();
                    alert(data.message);
                    window.location.href = "index.html";
                });
            }

        } else {
            // Chưa đăng nhập → hiện Login/Register
            userMenuBtn.innerHTML = `<i class="fa-solid fa-user"></i>`;
            userDropdown.innerHTML = `
                <a href="login.html">Đăng nhập</a>
                <a href="register.html">Đăng ký</a>
            `;
        }

    } catch (err) {
        console.error("ME ERROR:", err);
    }
});
