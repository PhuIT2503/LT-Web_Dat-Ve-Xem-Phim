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
    await loadVouchersFromDB();    
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

    container.innerHTML = '<tr><td colspan="6" style="text-align:center;">Đang tải dữ liệu...</td></tr>';

    try {
        const res = await fetch(`${API_BASE_URL}/bookings/list.php`, {
            method: "GET",
            credentials: "include"
        });

        if (!res.ok) throw new Error(`Lỗi HTTP: ${res.status}`);

        const historyData = await res.json();

        if (!historyData || historyData.length === 0) {
            container.innerHTML = '<tr><td colspan="6" style="text-align:center;">Bạn chưa có giao dịch nào.</td></tr>';
            return;
        }

        const getStatusBadge = (status) => {
            if (status === 'success') return '<span class="status-badge status-success">Thành công</span>';
            if (status === 'pending') return '<span class="status-badge status-pending">Đang chờ</span>';
            return '<span class="status-badge status-cancel">Đã hủy</span>';
        };

        // Render bảng, thêm cột Hành động ở cuối
        container.innerHTML = historyData.map((h, index) => `
            <tr>
                <td class="order-id">${h.booking_code}</td>
                <td style="font-weight: 600;">${h.movie_title}</td>
                <td>${h.seats}</td>
                <td>${h.created_at}</td>
                <td class="order-total">${h.total}</td>
                
                <td>
                    <button class="btn-view-ticket" onclick='openTicketModal(${JSON.stringify(h)})'>
                        <i class="fa-solid fa-ticket"></i> Xem Vé
                    </button>
                </td>
            </tr>
        `).join('');
        
        // Setup modal (gọi 1 lần sau khi load dữ liệu)
        setupTicketModal();

    } catch (err) {
        console.error(err);
        container.innerHTML = `<tr><td colspan="6" style="text-align:center; color: red;">Lỗi tải dữ liệu.</td></tr>`;
    }
}

// --- LOGIC MODAL VÉ (MỚI) ---
function setupTicketModal() {
    const modal = document.getElementById('ticket-modal');
    const closeBtn = document.getElementById('close-ticket-btn');

    if(closeBtn) {
        closeBtn.onclick = () => { modal.style.display = "none"; };
    }
    
    // Đóng khi click ra ngoài
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

// Hàm được gọi khi bấm nút "Xem Vé"
function openTicketModal(ticket) {
    const modal = document.getElementById('ticket-modal');
    
    // Điền dữ liệu vào vé
    document.getElementById('t-movie-title').textContent = ticket.movie_title;
    document.getElementById('t-showtime').textContent = ticket.show_time;
    document.getElementById('t-room').textContent = ticket.cinema_room;
    document.getElementById('t-seats').textContent = ticket.seats;
    document.getElementById('t-code').textContent = ticket.booking_code;
    document.getElementById('t-price').textContent = ticket.total;

    // Tạo QR Code giả lập theo mã vé
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.booking_code}`;
    document.getElementById('t-qr-img').src = qrUrl;

    // Hiện modal
    modal.style.display = "flex";
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

async function loadVouchersFromDB() {
    const container = document.getElementById('voucher-list');
    if(!container) return;

    // Hiển thị trạng thái đang tải
    container.innerHTML = '<p style="color: var(--grey-color);">Đang tải ưu đãi...</p>';

    try {
        // Gọi API
        const res = await fetch(`${API_BASE_URL}/vouchers/list.php`);
        const vouchers = await res.json();

        // Kiểm tra nếu không có voucher nào
        if (!vouchers || vouchers.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--grey-color);">Hiện chưa có mã giảm giá nào.</p>';
            return;
        }

        // Render danh sách voucher ra HTML
        container.innerHTML = vouchers.map(v => `
            <div class="voucher-item">
                <span class="voucher-code">${v.code}</span>
                <p>${v.desc}</p>
                <small style="color: var(--grey-color)">HSD: ${v.exp}</small>
            </div>
        `).join('');

    } catch (err) {
        console.error("Lỗi tải voucher:", err);
        container.innerHTML = '<p style="color: #ff5555;">Không thể tải danh sách voucher.</p>';
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