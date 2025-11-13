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
document.addEventListener('DOMContentLoaded', () => {
    initializePaymentPage();
    
    // (Các hàm setup header/search/user)
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
        setTimeout(() => {
            // Hiện modal thành công
            document.getElementById('payment-success-modal').style.display = 'flex';
            
            // Xóa dữ liệu tạm
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