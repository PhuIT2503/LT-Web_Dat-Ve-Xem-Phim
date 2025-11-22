// ĐƯỜNG DẪN TUYỆT ĐỐI ĐẾN API (Sửa tên thư mục ở đây nếu cần)
const API_BASE_URL = "http://localhost/LT-Web_Dat-Ve-Xem-Phim/backend/api";

document.addEventListener("DOMContentLoaded", async () => {
    await Promise.all([
        loadComponent("#header-placeholder", "components/header.html"),
        loadComponent("#footer-placeholder", "components/footer.html"),
        loadComponent("#modal-placeholder", "components/modal-trailer.html")
    ]);

    const userData = await checkLoginStatusReturnData();
    
    if (!userData) {
        alert("Vui lòng đăng nhập để truy cập trang này!");
        window.location.href = "login.html";
        return;
    }

    setupTabs();
    populateUserData(userData);
    renderMockVouchers();
    
    // Gọi hàm lấy lịch sử thật
    await fetchBookingHistory(); 
    
    setupLogoutBtn();
    addHeaderScrollEffect();
    setupUserMenuListeners();
    setupHeaderSearchListeners();
});

// --- HÀM LẤY LỊCH SỬ TỪ DATABASE ---
async function fetchBookingHistory() {
    const container = document.getElementById('history-list');
    if(!container) return;

    container.innerHTML = '<tr><td colspan="5" style="text-align:center;">Đang kết nối Database...</td></tr>';

    try {
        // GỌI API VỚI ĐƯỜNG DẪN CHUẨN
        const res = await fetch(`${API_BASE_URL}/bookings/list.php`, {
            method: "GET",
            credentials: "include" // Quan trọng: Gửi kèm cookie session
        });

        if (!res.ok) {
            throw new Error(`Lỗi HTTP: ${res.status}`);
        }

        const historyData = await res.json();
        console.log("Dữ liệu lịch sử nhận được:", historyData); // Debug

        if (!historyData || historyData.length === 0) {
            container.innerHTML = '<tr><td colspan="5" style="text-align:center;">Bạn chưa có giao dịch nào.</td></tr>';
            return;
        }

        const getStatusBadge = (status) => {
            if (status === 'success') return '<span class="status-badge status-success">Thành công</span>';
            if (status === 'pending') return '<span class="status-badge status-pending">Đang chờ</span>';
            return '<span class="status-badge status-cancel">Đã hủy</span>';
        };

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
        console.error("Chi tiết lỗi:", err);
        container.innerHTML = `<tr><td colspan="5" style="text-align:center; color: red;">Lỗi: ${err.message}. Hãy kiểm tra Console.</td></tr>`;
    }
}

// --- CÁC HÀM KHÁC (Giữ nguyên logic) ---
function setupTabs() {
    const btns = document.querySelectorAll('.menu-btn:not(.logout-btn)');
    const sections = document.querySelectorAll('.content-section');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            btn.classList.add('active');
            const tabId = btn.dataset.tab;
            document.getElementById(`tab-${tabId}`)?.classList.add('active');
        });
    });
}

function populateUserData(user) {
    document.getElementById('sidebar-username').textContent = user.username;
    document.getElementById('sidebar-email').textContent = user.email;
    document.getElementById('profile-name').value = user.username;
    document.getElementById('profile-email').value = user.email;
}

function renderMockVouchers() {
    const vouchers = [
        { code: "CINE50", desc: "Giảm 50% vé xem phim", exp: "30/12/2025" },
        { code: "FREECORN", desc: "Tặng 1 bắp ngọt nhỏ", exp: "15/05/2025" }
    ];
    const container = document.getElementById('voucher-list');
    if(container) {
        container.innerHTML = vouchers.map(v => `
            <div class="voucher-item">
                <span class="voucher-code">${v.code}</span>
                <p>${v.desc}</p>
                <small style="color: var(--grey-color)">HSD: ${v.exp}</small>
            </div>
        `).join('');
    }
}

function setupLogoutBtn() {
    document.getElementById('profile-logout-btn')?.addEventListener('click', async () => {
        if(confirm("Bạn có chắc muốn đăng xuất?")) {
            await fetch(`${API_BASE_URL}/auth/logout.php`, { credentials: "include" });
            window.location.href = "index.html";
        }
    });
}

async function checkLoginStatusReturnData() {
    try {
        const res = await fetch(`${API_BASE_URL}/auth/me.php`, { method: "GET", credentials: "include" });
        if (res.ok) return await res.json();
        return null;
    } catch (err) { return null; }
}

// Helper functions (copy from other files)
async function loadComponent(id, url) { try { document.querySelector(id).innerHTML = await (await fetch(url)).text(); } catch(e){} }
function addHeaderScrollEffect() { /* ... */ }
function setupUserMenuListeners() { 
    const btn = document.getElementById('user-menu-btn');
    const dropdown = document.getElementById('user-dropdown');
    if(btn) btn.addEventListener('click', (e) => { e.stopPropagation(); dropdown.classList.toggle('active'); });
    window.addEventListener('click', () => dropdown?.classList.remove('active'));
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