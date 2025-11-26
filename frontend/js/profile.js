// ======================= CONFIG API ==========================
const API_BASE_URL = "http://localhost/LT-Web_Dat-Ve-Xem-Phim/backend/api";

// ======================= MAIN APP ============================
document.addEventListener("DOMContentLoaded", async () => {

    // Load header/footer
    await Promise.all([
        loadComponent("#header-placeholder", "components/header.html"),
        loadComponent("#footer-placeholder", "components/footer.html"),
        loadComponent("#modal-placeholder", "components/modal-trailer.html")
    ]);

    // Kiểm tra đăng nhập
    const userData = await checkLoginStatusReturnData();
    if (!userData) {
        alert("Vui lòng đăng nhập để truy cập trang này!");
        window.location.href = "login.html";
        return;
    }

    // Setup giao diện
    setupTabs();
    setupLogoutBtn();
    addHeaderScrollEffect();
    setupUserMenuListeners();
    setupHeaderSearchListeners();

    // Đổ thông tin user
    populateUserData(userData);

    // Load lịch sử đặt vé
    await fetchBookingHistory();

    // Load voucher mock
    renderMockVouchers();

    // ====== THIẾT LẬP CRUD USER Ở ĐÂY ======
    setupUserUpdateHandlers();
});

// =================== LOAD LỊCH SỬ BOOKING ====================
async function fetchBookingHistory() {
    const container = document.getElementById('history-list');
    if (!container) return;

    container.innerHTML = '<tr><td colspan="6" style="text-align:center;">Đang tải dữ liệu...</td></tr>';

    try {
        const res = await fetch(`${API_BASE_URL}/bookings/list.php`, { credentials: "include" });
        const historyData = await res.json();

        if (!historyData || historyData.length === 0) {
            container.innerHTML =
                '<tr><td colspan="6" style="text-align:center;">Bạn chưa có giao dịch nào.</td></tr>';
            return;
        }

        container.innerHTML = historyData.map(h => `
            <tr>
                <td>${h.booking_code}</td>
                <td>${h.movie_title}</td>
                <td>${h.seats}</td>
                <td>${h.created_at}</td>
                <td>${h.total}</td>
                <td>
                    <button class="btn-view-ticket" onclick='openTicketModal(${JSON.stringify(h)})'>
                        Xem Vé
                    </button>
                </td>
            </tr>
        `).join('');

        setupTicketModal();
    } catch (err) {
        console.error(err);
    }
}

// =================== MODAL VÉ ====================
function setupTicketModal() {
    const modal = document.getElementById('ticket-modal');
    const closeBtn = document.getElementById('close-ticket-btn');

    closeBtn.onclick = () => modal.style.display = "none";

    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = "none";
    }
}

function openTicketModal(ticket) {
    const modal = document.getElementById('ticket-modal');

    document.getElementById('t-movie-title').textContent = ticket.movie_title;
    document.getElementById('t-showtime').textContent = ticket.show_time;
    document.getElementById('t-room').textContent = ticket.cinema_room;
    document.getElementById('t-seats').textContent = ticket.seats;
    document.getElementById('t-code').textContent = ticket.booking_code;
    document.getElementById('t-price').textContent = ticket.total;

    document.getElementById('t-qr-img').src =
        `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.booking_code}`;

    modal.style.display = "flex";
}

// =================== ĐỔ USER ====================
function populateUserData(user) {
    document.getElementById('sidebar-username').textContent = user.username;
    document.getElementById('sidebar-email').textContent = user.email;
    document.getElementById('profile-name').value = user.username;
    document.getElementById('profile-email').value = user.email;
    document.getElementById('profile-phone').value = user.phone ?? "";
    document.getElementById('profile-birthday').value = user.birthday ?? "";
}

// =================== CRUD USER ====================
function setupUserUpdateHandlers() {

    const saveInfoBtn = document.getElementById("save-info-btn");
    const changePassBtn = document.getElementById("change-pass-btn");
    const deleteAccBtn = document.getElementById("delete-account-btn");

    const nameInput = document.getElementById("profile-name");
    const phoneInput = document.getElementById("profile-phone");
    const dobInput = document.getElementById("profile-birthday");

    const oldPass = document.getElementById("old-password");
    const newPass = document.getElementById("new-password");
    const confirmPass = document.getElementById("confirm-password");

    // --- UPDATE INFO ---
    saveInfoBtn.addEventListener("click", async () => {
    const payload = {
        username: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        dob: dobInput.value
    };

    const res = await fetch(`${API_BASE_URL}/user/update_profile.php`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    alert(data.message);
    });


    // --- CHANGE PASSWORD ---
    changePassBtn.addEventListener("click", async () => {
        if (newPass.value !== confirmPass.value) {
            alert("Mật khẩu mới không khớp!");
            return;
        }

        const res = await fetch(`${API_BASE_URL}/user/change_password.php`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                old: oldPass.value,
                new: newPass.value
            })
        });

        const data = await res.json();
        alert(data.message);
    });

    // --- DELETE ACCOUNT ---
    deleteAccBtn.addEventListener("click", async () => {
        if (!confirm("Bạn có chắc muốn xóa tài khoản?")) return;

        const res = await fetch(`${API_BASE_URL}/user/delete_account.php`, {
            method: "POST",
            credentials: "include"
        });

        const data = await res.json();

        alert(data.message);
        if (data.success) window.location.href = "index.html";
    });
}

// =================== VOUCHER MOCK ====================
function renderMockVouchers() {
    const vouchers = [
        { code: "CINE50", desc: "Giảm 50% vé xem phim", exp: "30/12/2025" },
        { code: "FREECORN", desc: "Tặng 1 bắp ngọt nhỏ", exp: "15/05/2025" }
    ];
    const container = document.getElementById('voucher-list');
    container.innerHTML = vouchers.map(v => `
        <div class="voucher-item">
            <span class="voucher-code">${v.code}</span>
            <p>${v.desc}</p>
            <small>HSD: ${v.exp}</small>
        </div>
    `).join('');
}

// =================== AUTH ====================
function setupLogoutBtn() {
    const btn = document.getElementById('profile-logout-btn');
    if (btn) {
        btn.addEventListener('click', async () => {
            await fetch(`${API_BASE_URL}/auth/logout.php`, { credentials: "include" });
            window.location.href = "index.html";
        });
    }
}

async function checkLoginStatusReturnData() {
    try {
        const res = await fetch(`${API_BASE_URL}/auth/me.php`, { credentials: "include" });
        return res.ok ? res.json() : null;
    } catch {
        return null;
    }
}

// =================== HELPERS ====================
async function loadComponent(id, url) {
    try { document.querySelector(id).innerHTML = await (await fetch(url)).text(); }
    catch (e) {}
}

function setupTabs() {
    const btns = document.querySelectorAll('.menu-btn:not(.logout-btn)');
    const sections = document.querySelectorAll('.content-section');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
        });
    });
}

function addHeaderScrollEffect() { /* giữ nguyên */ }
function setupUserMenuListeners() { /* giữ nguyên */ }
function setupHeaderSearchListeners() { /* giữ nguyên */ }
