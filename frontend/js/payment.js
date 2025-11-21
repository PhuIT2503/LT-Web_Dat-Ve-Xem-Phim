// === DỮ LIỆU GIẢ LẬP (Cần thiết cho JS) ===
// (Copy 2 hằng số giá từ booking.js)
const SEAT_PRICE = 90000;
const MOCK_COMBOS = [
    {
        id: 'combo1',
        title: 'Combo 1 Lớn',
        price: 75000,
        description: '1 Bắp Lớn & 1 Nước Lớn',
        imageUrl: 'https://cdn.galaxycine.vn/media/2022/10/31/combo-1-lon-2_1667205008544.jpg'
    },
    {
        id: 'combo2',
        title: 'Combo 2 Lớn',
        price: 89000,
        description: '1 Bắp Lớn & 2 Nước Lớn',
        imageUrl: 'https://cdn.galaxycine.vn/media/2022/10/31/combo-2-lon-2_1667205029193.jpg'
    }
];

// === JS CHO TRANG THANH TOÁN ===
// ⭐ CẬP NHẬT: Thêm 'async'
document.addEventListener('DOMContentLoaded', async () => {
    initializePaymentPage();
    
    // (Các hàm setup header/search/user)
    
    // ⭐ CẬP NHẬT: Gọi hàm kiểm tra đăng nhập
    await checkLoginStatus(); 
    
    setupHeaderSearchListeners();
    addHeaderScrollEffect();
    setupUserMenuListeners(); // <-- Gọi hàm menu user
});

function initializePaymentPage() {
    // 1. Đọc dữ liệu từ sessionStorage
    const dataString = sessionStorage.getItem('bookingDetails');
    if (!dataString) {
        document.querySelector('.payment-container').innerHTML = 
            '<h2>Lỗi: Không tìm thấy thông tin đặt vé. Vui lòng thử lại.</h2>';
        return;
    }
    
    const data = JSON.parse(dataString);

    // 2. Tính toán lại tổng tiền (để bảo mật)
    let seatTotal = 0;
    let comboTotal = 0;
    
    // Tính tiền ghế
    seatTotal = (data.seats || []).length * SEAT_PRICE;
    
    // Tính tiền combo
    const comboListEl = document.getElementById('combo-summary-list');
    let comboHtml = '';
    for (const comboId in data.combos) {
        const quantity = data.combos[comboId];
        if (quantity > 0) {
            const comboData = MOCK_COMBOS.find(c => c.id === comboId);
            if (comboData) {
                const itemTotal = comboData.price * quantity;
                comboTotal += itemTotal;
                comboHtml += `
                    <div class="summary-item">
                        <span>${quantity} x ${comboData.title}</span>
                        <span>${itemTotal.toLocaleString('vi-VN')} VND</span>
                    </div>
                `;
            }
        }
    }
    comboListEl.innerHTML = comboHtml;
    if (comboTotal === 0) comboListEl.style.display = 'none';

    const finalTotal = seatTotal + comboTotal;

    // 3. Điền thông tin vào trang
    document.getElementById('summary-title').textContent = data.movie.title;
    document.getElementById('summary-poster').src = data.movie.imageUrl;
    document.getElementById('summary-booking-id').textContent = data.bookingId;
    document.getElementById('summary-date-time').textContent = 
        `Ngày: ${data.date} | Suất: ${data.showtime}`;
    
    document.getElementById('summary-seat-total').textContent = `${seatTotal.toLocaleString('vi-VN')} VND`;
    document.getElementById('summary-seat-list').textContent = 
        (data.seats || []).map(s => s.key).join(', ');
        
    document.getElementById('summary-final-total').textContent = `${finalTotal.toLocaleString('vi-VN')} VND`;

    // 4. Gán sự kiện cho Tabs
    setupPaymentTabs();
    
    
    // 5. Gán sự kiện cho nút Thanh Toán (Giả lập)
    document.getElementById('confirm-payment').addEventListener('click', () => {
        const btn = document.getElementById('confirm-payment');
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';
        
        // Giả lập gọi API thanh toán (chờ 2.5 giây)
        setTimeout(async () => {
            try {
                // 1. Chuẩn bị dữ liệu để lưu
                // Lấy thông tin từ sessionStorage (đã lưu ở trang booking.html)
                const dataString = sessionStorage.getItem('bookingDetails');
                if (dataString) {
                    const bookingData = JSON.parse(dataString);
                    
                    // Tạo nội dung tóm tắt (VD: Mai (2 vé) + Combo bắp)
                    let itemSummary = bookingData.movie.title;
                    if (bookingData.seats && bookingData.seats.length > 0) {
                        itemSummary += ` (${bookingData.seats.length} vé)`;
                    }
                    
                    // Gọi API lưu lịch sử
                    await fetch('http://localhost/LT-Web_Dat-Ve-Xem-Phim/backend/api/transactions/create.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include', // Quan trọng để lấy session user_id
                        body: JSON.stringify({
                            booking_code: bookingData.bookingId,
                            item_name: itemSummary,
                            total_amount: bookingData.totalPrice
                        })
                    });
                }
            } catch (error) {
                console.error("Lỗi khi lưu lịch sử giao dịch:", error);
            }

            // 2. Hiện modal thành công và xóa dữ liệu tạm
            document.getElementById('payment-success-modal').style.display = 'flex';
            sessionStorage.removeItem('bookingDetails');

        }, 2500);
    });
    
    // 6. Gán sự kiện cho nút "Về Trang Chủ"
    document.getElementById('back-to-home').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

function setupPaymentTabs() {
    const tabContainer = document.querySelector('.payment-tabs');
    const tabs = tabContainer.querySelectorAll('.tab-btn');
    const contents = document.querySelector('.payment-methods').querySelectorAll('.tab-content');
    
    tabContainer.addEventListener('click', (e) => {
        const tabBtn = e.target.closest('.tab-btn');
        if (!tabBtn) return;
        
        const tabId = tabBtn.dataset.tab;
        
        // Bỏ active ở tất cả
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        
        // Thêm active cho cái được click
        tabBtn.classList.add('active');
        document.getElementById(`tab-${tabId}`).classList.add('active');
    });
}

// --- CÁC HÀM HELPER (Cho header/search/user) ---
function addHeaderScrollEffect() {
    const header = document.querySelector('.main-header');
    if (!header) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
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

/**
 * Thêm sự kiện Bật/Tắt cho User Menu (Đăng nhập/Đăng kí)
 */
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