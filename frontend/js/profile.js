document.addEventListener("DOMContentLoaded", async () => {
    // 1. Load Header/Footer
    await Promise.all([
        loadComponent("#header-placeholder", "components/header.html"),
        loadComponent("#footer-placeholder", "components/footer.html"),
        loadComponent("#modal-placeholder", "components/modal-trailer.html")
    ]);

    // 2. Kiểm tra đăng nhập & Lấy thông tin user
    const userData = await checkLoginStatusReturnData();
    
    if (!userData) {
        alert("Vui lòng đăng nhập để truy cập trang này!");
        window.location.href = "login.html";
        return;
    }

    // 3. Khởi tạo các chức năng
    setupTabs();
    populateUserData(userData);
    renderMockVouchers();
    renderMockHistory();
    setupLogoutBtn(); // Nút logout ở sidebar
    
    // Setup header logic (search, user menu...)
    addHeaderScrollEffect();
    setupUserMenuListeners();
    setupHeaderSearchListeners();

    const urlParams = new URLSearchParams(window.location.search);
    const tabName = urlParams.get('tab');
    if (tabName) {
        const tabBtn = document.querySelector(`.menu-btn[data-tab="${tabName}"]`);
        if (tabBtn) {
            // Kích hoạt sự kiện click vào tab tương ứng
            tabBtn.click();
        }
    }
});

// --- LOGIC TAB CHUYỂN ĐỔI ---
function setupTabs() {
    const btns = document.querySelectorAll('.menu-btn:not(.logout-btn)');
    const sections = document.querySelectorAll('.content-section');

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class
            btns.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Add active class
            btn.classList.add('active');
            const tabId = btn.dataset.tab;
            document.getElementById(`tab-${tabId}`).classList.add('active');
        });
    });
}

// --- ĐIỀN DỮ LIỆU USER (Từ API thật + Giả lập) ---
function populateUserData(user) {
    // Sidebar
    document.getElementById('sidebar-username').textContent = user.username;
    document.getElementById('sidebar-email').textContent = user.email;

    // Form Inputs
    document.getElementById('profile-name').value = user.username;
    document.getElementById('profile-email').value = user.email;
    
    // Dữ liệu giả lập (vì backend chưa có field này)
    document.getElementById('profile-phone').value = "0987654321"; 
    document.getElementById('profile-dob').value = "1999-01-01";
}

// --- GIẢ LẬP VOUCHER ---
async function renderMockVouchers() {
    const container = document.getElementById('voucher-list');
    container.innerHTML = '<p>Đang tải ưu đãi...</p>';

    try {
        const res = await fetch('http://localhost/LT-Web_Dat-Ve-Xem-Phim/backend/api/vouchers/list.php');
        const vouchers = await res.json();
        
        if (!vouchers || vouchers.length === 0) {
            container.innerHTML = '<p>Bạn chưa có voucher nào.</p>';
            return;
        }

        container.innerHTML = vouchers.map(v => {
            const expDate = new Date(v.exp).toLocaleDateString('vi-VN');
            return `
            <div class="voucher-item">
                <span class="voucher-code">${v.code}</span>
                <p>${v.desc}</p>
                <p style="color: var(--primary-color); font-weight:bold; margin: 5px 0;">Giảm: ${v.discount_display}</p>
                <small style="color: var(--grey-color)">HSD: ${expDate}</small>
                <button class="btn btn-primary" onclick="navigator.clipboard.writeText('${v.code}')" style="font-size:0.8rem; padding: 5px 10px; margin-top: 10px; width: 100%">Sao chép</button>
            </div>
            `;
        }).join('');

    } catch (err) {
        console.error(err);
        container.innerHTML = '<p style="color:red">Không thể tải danh sách voucher.</p>';
    }
}

// --- GIẢ LẬP LỊCH SỬ ---
function renderMockHistory() {
    const history = [
        { id: "CGV99281", item: "Mai (2 Vé)", date: "15/02/2025", total: "180,000", status: "Thành công" },
        { id: "CGV88123", item: "Combo Bắp Nước", date: "15/02/2025", total: "79,000", status: "Thành công" },
        { id: "CGV77111", item: "Đào, Phở và Piano", date: "10/01/2025", total: "90,000", status: "Đã hủy" },
    ];

    const container = document.getElementById('history-list');
    container.innerHTML = history.map(h => `
        <tr>
            <td>#${h.id}</td>
            <td>${h.item}</td>
            <td>${h.date}</td>
            <td>${h.total} đ</td>
            <td class="${h.status === 'Thành công' ? 'status-success' : 'status-pending'}">${h.status}</td>
        </tr>
    `).join('');
}

// --- LOGIC LOGOUT RIÊNG CHO SIDEBAR ---
function setupLogoutBtn() {
    document.getElementById('profile-logout-btn').addEventListener('click', async () => {
        if(confirm("Bạn có chắc muốn đăng xuất?")) {
            await fetch("http://localhost/LT-Web_Dat-Ve-Xem-Phim/backend/api/auth/logout.php", { credentials: "include" });
            window.location.href = "index.html";
        }
    });
}

// --- HÀM HELPER: Lấy data user thay vì chỉ update UI ---
async function checkLoginStatusReturnData() {
    try {
        const res = await fetch("http://localhost/LT-Web_Dat-Ve-Xem-Phim/backend/api/auth/me.php", { method: "GET", credentials: "include" });
        const data = await res.json();
        if (res.ok) return data;
        return null;
    } catch (err) {
        return null;
    }
}

// --- COPY CÁC HÀM HELPER TỪ MAIN.JS (Để header hoạt động) ---
async function loadComponent(placeholderId, componentUrl) {
    try {
        const response = await fetch(componentUrl);
        const html = await response.text();
        document.querySelector(placeholderId).innerHTML = html;
    } catch (error) { console.error(error); }
}
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
        userMenuBtn.innerHTML = `<i class="fa-solid fa-user"></i> Xin chào, ${username} !`;
        userDropdown.innerHTML = `
            <a href="#">Tài khoản của tôi</a>
            <a href="#" id="logout-btn">Đăng xuất</a>
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