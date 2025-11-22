document.addEventListener("DOMContentLoaded", async () => {
    // 1. Load Header/Footer
    await Promise.all([
        loadComponent("#header-placeholder", "components/header.html"),
        loadComponent("#footer-placeholder", "components/footer.html"),
        loadComponent("#modal-placeholder", "components/modal-trailer.html")
    ]);

    // 2. Kiểm tra đăng nhập
    const userData = await checkLoginStatusReturnData();
    
    if (!userData) {
        alert("Vui lòng đăng nhập để truy cập trang này!");
        window.location.href = "login.html";
        return;
    }

    // 3. Khởi tạo các chức năng
    setupTabs();                 // <-- QUAN TRỌNG: Giúp bấm chuyển tab được
    populateUserData(userData);  // Điền thông tin user
    renderMockVouchers();        // Voucher giả lập
    
    // Gọi hàm lấy lịch sử thật từ Database
    await fetchBookingHistory(); 
    
    // Các chức năng phụ trợ
    setupLogoutBtn();
    addHeaderScrollEffect();
    setupUserMenuListeners();
    setupHeaderSearchListeners();
});

/* =========================================
   CÁC HÀM CHỨC NĂNG CHÍNH (PROFILE)
   ========================================= */

// --- 1. LOGIC TAB CHUYỂN ĐỔI (Xử lý click menu bên trái) ---
function setupTabs() {
    const btns = document.querySelectorAll('.menu-btn:not(.logout-btn)');
    const sections = document.querySelectorAll('.content-section');

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Xóa class active cũ ở tất cả nút và nội dung
            btns.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Thêm class active cho nút vừa bấm
            btn.classList.add('active');
            
            // Hiện nội dung tương ứng
            const tabId = btn.dataset.tab;
            const section = document.getElementById(`tab-${tabId}`);
            if (section) {
                section.classList.add('active');
            }
        });
    });
}

// --- 2. ĐIỀN DỮ LIỆU USER ---
function populateUserData(user) {
    // Sidebar
    const sbName = document.getElementById('sidebar-username');
    const sbEmail = document.getElementById('sidebar-email');
    if(sbName) sbName.textContent = user.username;
    if(sbEmail) sbEmail.textContent = user.email;

    // Form Inputs
    const inpName = document.getElementById('profile-name');
    const inpEmail = document.getElementById('profile-email');
    if(inpName) inpName.value = user.username;
    if(inpEmail) inpEmail.value = user.email;
    
    // Dữ liệu giả lập (vì database chưa có cột này)
    const inpPhone = document.getElementById('profile-phone');
    const inpDob = document.getElementById('profile-dob');
    if(inpPhone) inpPhone.value = "0987654321"; 
    if(inpDob) inpDob.value = "1999-01-01";
}

// --- 3. LẤY LỊCH SỬ TỪ DATABASE (HÀM QUAN TRỌNG) ---
async function fetchBookingHistory() {
    const container = document.getElementById('history-list');
    if(!container) return;

    container.innerHTML = '<tr><td colspan="5" style="text-align:center;">Đang tải dữ liệu...</td></tr>';

    try {
        const res = await fetch(
            "http://localhost/LT-Web_Dat-Ve-Xem-Phim/backend/api/bookings/list.php", 
            {
                method: "GET",
                credentials: "include" // Quan trọng để gửi session
            }
        );

        if (!res.ok) throw new Error("Lỗi tải lịch sử");

        const historyData = await res.json();

        if (historyData.length === 0) {
            container.innerHTML = '<tr><td colspan="5" style="text-align:center;">Bạn chưa có giao dịch nào.</td></tr>';
            return;
        }

        // Map trạng thái sang HTML badge
        const getStatusBadge = (status) => {
            if (status === 'success') return '<span class="status-badge status-success">Thành công</span>';
            if (status === 'pending') return '<span class="status-badge status-pending">Đang chờ</span>';
            return '<span class="status-badge status-cancel">Đã hủy</span>';
        };

        // Render HTML
        container.innerHTML = historyData.map(h => `
            <tr>
                <td class="order-id">#${h.id}</td>
                <td style="font-weight: 600;">${h.item}</td>
                <td>${h.date}</td>
                <td class="order-total">${h.total}</td>
                <td>${getStatusBadge(h.status)}</td>
            </tr>
        `).join('');

    } catch (err) {
        console.error(err);
        container.innerHTML = '<tr><td colspan="5" style="text-align:center; color: red;">Không thể tải lịch sử giao dịch.</td></tr>';
    }
}

// --- 4. GIẢ LẬP VOUCHER (GIỮ NGUYÊN) ---
function renderMockVouchers() {
    const vouchers = [
        { code: "CINE50", desc: "Giảm 50% vé xem phim", exp: "30/12/2025" },
        { code: "FREECORN", desc: "Tặng 1 bắp ngọt nhỏ", exp: "15/05/2025" },
        { code: "BIRTHDAY", desc: "Vé miễn phí tháng sinh nhật", exp: "01/01/2026" }
    ];

    const container = document.getElementById('voucher-list');
    if (!container) return;
    
    container.innerHTML = vouchers.map(v => `
        <div class="voucher-item">
            <span class="voucher-code">${v.code}</span>
            <p>${v.desc}</p>
            <small style="color: var(--grey-color)">HSD: ${v.exp}</small>
            <button class="btn btn-primary" style="font-size:0.8rem; padding: 5px 10px; margin-top: 10px; width: 100%">Sao chép</button>
        </div>
    `).join('');
}

// --- 5. LOGIC LOGOUT RIÊNG CHO SIDEBAR ---
function setupLogoutBtn() {
    const btn = document.getElementById('profile-logout-btn');
    if (!btn) return;
    
    btn.addEventListener('click', async () => {
        if(confirm("Bạn có chắc muốn đăng xuất?")) {
            await fetch("http://localhost/LT-Web_Dat-Ve-Xem-Phim/backend/api/auth/logout.php", { credentials: "include" });
            window.location.href = "index.html";
        }
    });
}

// --- 6. HÀM HELPER: Lấy data user ---
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

/* =========================================
   CÁC HÀM HELPER CHUNG (HEADER/SEARCH/MODAL)
   ========================================= */

async function loadComponent(placeholderId, componentUrl) {
    try {
        const placeholder = document.querySelector(placeholderId);
        if(!placeholder) return;
        const response = await fetch(componentUrl);
        const html = await response.text();
        placeholder.innerHTML = html;
    } catch (error) { console.error(error); }
}

function addHeaderScrollEffect() {
    const header = document.querySelector(".main-header");
    if (!header) return;

    window.addEventListener("scroll", () => {
        header.classList.toggle("scrolled", window.scrollY > 50);
    });
}

function setupModalListeners() {
    const modal = document.getElementById("trailer-modal");
    const closeBtn = document.getElementById("modal-close-btn");
    const iframe = document.getElementById("trailer-iframe");

    if (!modal || !closeBtn || !iframe) return;

    document.body.addEventListener("click", e => {
        const btn = e.target.closest(".btn-open-modal");
        if (btn) {
            const url = btn.dataset.trailerUrl;
            if(url) {
                iframe.src = `${url}?autoplay=1`;
                modal.classList.add("active");
            }
        }
    });

    const close = () => {
        modal.classList.remove("active");
        iframe.src = "";
    };

    closeBtn.addEventListener("click", close);
    modal.addEventListener("click", e => e.target === modal && close());
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