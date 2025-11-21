/* === NỘI DUNG TỪ frontend/js/booking.js (CẬP NHẬT MODAL VOUCHER) === */
document.addEventListener('DOMContentLoaded', () => {
    initializeBookingPage();
});

const DEFAULT_POSTER = 'https://via.placeholder.com/300x450?text=No+Poster';
const DEFAULT_COMBO_IMG = 'https://via.placeholder.com/150x150?text=Combo';

let appliedVoucher = null;
let discountAmount = 0;

// Danh sách Voucher hợp lệ (Dữ liệu giả lập)
const VALID_VOUCHERS = {
    'CINE50': { type: 'percent', value: 0.5, desc: 'Giảm 50% giá vé' },
    'FREECORN': { type: 'fixed', value: 20000, desc: 'Giảm 20k (Tương đương bắp nhỏ)' },
    'BIRTHDAY': { type: 'fixed', value: 100000, desc: 'Giảm 100k mừng sinh nhật' },
    'NEWMEMBER': { type: 'percent', value: 0.1, desc: 'Giảm 10% cho thành viên mới' }
};

async function initializeBookingPage() {
    try {
        await checkLoginStatus(); 

        addHeaderScrollEffect();
        setupModalListeners(); // Modal trailer cũ
        setupHeaderSearchListeners();
        setupUserMenuListeners();

        // --- KHỞI TẠO MODAL VOUCHER MỚI ---
        setupVoucherListModal();

        const params = new URLSearchParams(window.location.search);
        const movieId = params.get('id');
        if (!movieId) {
            const titleEl = document.getElementById('booking-title');
            if(titleEl) titleEl.textContent = 'Lỗi: Không có phim để đặt vé';
            return;
        }

        const movie = findMovieInMock(movieId);
        
        // --- XỬ LÝ ẢNH POSTER PHIM ---
        const posterEl = document.getElementById('movie-poster');
        const titleEl = document.getElementById('movie-title');
        const infoEl = document.getElementById('movie-year-rating');
        const durEl = document.getElementById('movie-duration-genre');

        if (movie) {
            posterEl.src = movie.imageUrl || DEFAULT_POSTER;
            posterEl.onerror = function() { this.src = DEFAULT_POSTER; };
            posterEl.style.display = 'block';

            if(titleEl) titleEl.textContent = movie.title;
            if(infoEl) infoEl.textContent = `Năm: ${movie.year || 'N/A'} | Rating: ${movie.rating || 'N/A'}`;
            if(durEl) durEl.textContent = `Thời lượng: ${movie.duration || 'N/A'} | Thể loại: ${movie.genre || 'N/A'}`;
        } else {
            if(titleEl) titleEl.textContent = `Phim #${movieId}`;
            posterEl.src = DEFAULT_POSTER;
            posterEl.style.display = 'block';
        }
        
        renderWeekSelector(movieId);
        renderShowtimes(movieId, selectedDate);
        renderComboSelector(); 
        await loadSeatMap(movieId, selectedDate);

        const confirmBtn = document.getElementById('confirm-booking');
        if(confirmBtn) {
            confirmBtn.addEventListener('click', () => confirmBooking(movieId));
        }

        // Sự kiện áp dụng voucher
        const applyBtn = document.getElementById('apply-voucher-btn');
        if (applyBtn) {
            applyBtn.addEventListener('click', handleApplyVoucher);
        }
        const voucherInput = document.getElementById('voucher-input');
        if (voucherInput) {
            voucherInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleApplyVoucher();
            });
        }

    } catch (err) {
        console.error('Lỗi khởi tạo booking:', err);
    }
}

// --- ⭐ HÀM MỚI: XỬ LÝ MODAL DANH SÁCH VOUCHER ---
function setupVoucherListModal() {
    const modal = document.getElementById('voucher-list-modal');
    const openBtn = document.getElementById('open-voucher-modal'); // Link "Lấy mã voucher"
    const closeBtn = document.getElementById('close-voucher-list-modal'); // Nút X
    const listContainer = document.getElementById('voucher-list-container');

    if (!modal || !openBtn || !closeBtn) return;

    // Mở Modal
    openBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Chặn chuyển trang
        renderVoucherList(listContainer);
        modal.classList.add('active');
    });

    // Đóng Modal
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    // Click ra ngoài để đóng
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// --- ⭐ HÀM MỚI: RENDER DANH SÁCH VOUCHER VÀO MODAL ---
// --- CẬP NHẬT HÀM RENDER VOUCHER (Logic "Chọn là dùng ngay") ---
// --- 1. Sửa hàm lấy danh sách voucher cho Modal (Gọi API list.php) ---
async function renderVoucherList(container) {
    container.innerHTML = '<p>Đang tải voucher...</p>';
    
    try {
        // Gọi API lấy danh sách voucher từ DB
        const res = await fetch('http://localhost/LT-Web_Dat-Ve-Xem-Phim/backend/api/vouchers/list.php');
        const vouchers = await res.json();

        container.innerHTML = ''; // Xóa loading

        if (vouchers.length === 0) {
            container.innerHTML = '<p>Hiện chưa có voucher nào.</p>';
            return;
        }
        
        // Tiêu đề hướng dẫn
        const hint = document.createElement('p');
        hint.textContent = "Chọn voucher bên dưới để áp dụng ngay:";
        hint.style.color = "#aaa";
        hint.style.fontSize = "0.9rem";
        hint.style.marginBottom = "15px";
        container.appendChild(hint);

        // Render từng voucher từ DB
        vouchers.forEach(v => {
            const row = document.createElement('div');
            row.className = 'voucher-item-row';
            
            // Format ngày cho đẹp
            const expDate = new Date(v.exp).toLocaleDateString('vi-VN');

            row.innerHTML = `
                <div class="voucher-info">
                    <span class="voucher-code-display">${v.code}</span>
                    <span class="voucher-desc">${v.desc}</span>
                    <small style="display:block; color:#666; font-size:0.8rem">HSD: ${expDate}</small>
                </div>
                <button class="btn-use-code" data-code="${v.code}">Dùng ngay</button>
            `;
            container.appendChild(row);
        });

        // Gán sự kiện click (Giữ nguyên logic cũ)
        const useBtns = container.querySelectorAll('.btn-use-code');
        useBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const code = btn.dataset.code;
                const voucherInput = document.getElementById('voucher-input');
                const modal = document.getElementById('voucher-list-modal');

                if (voucherInput) voucherInput.value = code;
                if (modal) modal.classList.remove('active');
                
                // Tự động áp dụng
                handleApplyVoucher(); 
            });
        });

    } catch (err) {
        console.error(err);
        container.innerHTML = '<p style="color:red">Lỗi tải danh sách voucher.</p>';
    }
}

// --- 2. Sửa hàm Áp dụng Voucher (Gọi API check.php) ---
async function handleApplyVoucher() {
    const input = document.getElementById('voucher-input');
    const msg = document.getElementById('voucher-message');
    const btn = document.getElementById('apply-voucher-btn');
    const code = input.value.trim(); // Không cần toUpperCase() vì DB có thể phân biệt hoa thường, hoặc tùy bạn

    if (!code) {
        msg.textContent = 'Vui lòng nhập mã voucher.';
        msg.style.color = 'orange';
        return;
    }

    // UI Loading
    btn.disabled = true;
    btn.textContent = '...';
    msg.textContent = '';

    try {
        // Gọi API kiểm tra mã
        const res = await fetch(`http://localhost/LT-Web_Dat-Ve-Xem-Phim/backend/api/vouchers/check.php?code=${encodeURIComponent(code)}`);
        const result = await res.json();

        if (result.success) {
            // Áp dụng thành công
            appliedVoucher = { 
                code: result.data.code, 
                type: result.data.type, 
                value: result.data.value, 
                desc: result.data.desc 
            };

            msg.textContent = `Áp dụng thành công: ${result.data.desc}`;
            msg.style.color = '#4caf50';
            
            input.disabled = true;
            btn.textContent = 'Đã dùng';
        } else {
            // Lỗi từ API (Mã sai hoặc hết hạn)
            appliedVoucher = null;
            msg.textContent = result.message;
            msg.style.color = '#ff5555';
            btn.disabled = false;
            btn.textContent = 'Áp dụng';
        }

    } catch (err) {
        console.error(err);
        msg.textContent = 'Lỗi kết nối server.';
        msg.style.color = '#ff5555';
        btn.disabled = false;
        btn.textContent = 'Áp dụng';
    }
    
    // Cập nhật lại tổng tiền
    updateBookingSummary(); 
}

// ... (Các hàm findMovieInMock, renderWeekSelector, renderShowtimes giữ nguyên) ...
function findMovieInMock(id) {
    const numeric = parseInt(id, 10);
    if (typeof mockData === 'undefined') {
        return null;
    }
    const allMovies = [mockData.banner, ...mockData.newMovies, ...mockData.trendingMovies];
    return allMovies.find(m => m.id === numeric) || null;
}

let currentSeats = [];
let selectedSeats = [];
const SEAT_PRICE = 90000;
let selectedDate = new Date().toISOString().slice(0,10);
let selectedShowtime = '09:30';
const MOCK_SHOWTIMES = ['09:30', '13:00', '16:30', '19:00', '21:15'];

const MOCK_COMBOS = [
    {
        id: 'combo1',
        title: 'Combo 1: Nhỏ',
        price: 75000,
        description: '1 Bắp Nhỏ & 1 Nước Nhỏ',
        imageUrl: 'assets/bapnuoc.jpg' 
    },
    {
        id: 'combo2',
        title: 'Combo 2: Lớn',
        price: 89000,
        description: '1 Bắp Lớn & 2 Nước Lớn',
        imageUrl: 'assets/bapnuoc.jpg'
    }
];
let selectedCombos = {};

function renderWeekSelector(movieId) {
    const container = document.getElementById('date-selector');
    if (!container) return;
    container.innerHTML = '';
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const iso = d.toISOString().slice(0,10);
        const weekday = new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(d);
        let dayLabel = weekday;
        if (i === 0) dayLabel = 'Hôm nay';
        if (i === 1) dayLabel = 'Ngày mai';
        const dateLabel = `${d.getDate()}/${d.getMonth()+1}`;
        const btn = document.createElement('div');
        btn.className = 'date-item';
        btn.dataset.date = iso;
        btn.innerHTML = `<div style="font-weight:600">${dayLabel}</div><div style="font-size:12px;">${dateLabel}</div>`;
        if (iso === selectedDate) btn.classList.add('selected');
        btn.addEventListener('click', async () => {
            const prev = container.querySelector('.date-item.selected');
            if (prev) prev.classList.remove('selected');
            btn.classList.add('selected');
            selectedDate = iso;
            selectedShowtime = MOCK_SHOWTIMES[0];
            renderShowtimes(movieId, selectedDate);
            selectedSeats = [];
            updateBookingSummary();
            await loadSeatMap(movieId, selectedDate);
        });
        container.appendChild(btn);
    }
}

function renderShowtimes(movieId, date) {
    const container = document.getElementById('showtime-selector');
    if (!container) return;
    container.innerHTML = '';
    MOCK_SHOWTIMES.forEach(time => {
        const btn = document.createElement('div');
        btn.className = 'time-item';
        btn.dataset.time = time;
        btn.textContent = time;
        if (time === selectedShowtime) {
            btn.classList.add('selected');
        }
        btn.addEventListener('click', async () => {
            const prev = container.querySelector('.time-item.selected');
            if (prev) prev.classList.remove('selected');
            btn.classList.add('selected');
            selectedShowtime = time;
            selectedSeats = [];
            updateBookingSummary();
            await loadSeatMap(movieId, selectedDate);
        });
        container.appendChild(btn);
    });
}

// ... (renderComboSelector, loadSeatMap, renderSeatMap, onSeatClick giữ nguyên) ...
function renderComboSelector() {
    const container = document.getElementById('combo-list-container');
    if (!container) return;
    container.innerHTML = '';
    MOCK_COMBOS.forEach(combo => {
        const comboId = combo.id;
        if (!selectedCombos[comboId]) {
            selectedCombos[comboId] = 0;
        }
        const item = document.createElement('div');
        item.className = 'combo-item';
        item.id = `combo-item-${comboId}`;
        
        item.innerHTML = `
            <img src="${combo.imageUrl}" alt="${combo.title}" onerror="this.src='${DEFAULT_COMBO_IMG}'">
            <div class="combo-info">
                <h4>${combo.title}</h4>
                <p>${combo.description}</p>
                <p class="price-tag">${combo.price.toLocaleString('vi-VN')} VND</p>
            </div>
            <div class="combo-quantity-selector">
                <button class="quantity-btn btn-minus" data-id="${comboId}" ${selectedCombos[comboId] === 0 ? 'disabled' : ''}>-</button>
                <span class="quantity-display">${selectedCombos[comboId]}</span>
                <button class="quantity-btn btn-plus" data-id="${comboId}">+</button>
            </div>
        `;
        container.appendChild(item);
    });
    container.addEventListener('click', (e) => {
        const btn = e.target.closest('.quantity-btn');
        if (!btn) return;
        
        const comboId = btn.dataset.id;
        if (!comboId) return;

        const currentQty = selectedCombos[comboId];
        if (btn.classList.contains('btn-plus')) {
            selectedCombos[comboId] = currentQty + 1;
        } else if (btn.classList.contains('btn-minus')) {
            if (currentQty > 0) {
                selectedCombos[comboId] = currentQty - 1;
            }
        }
        const itemUI = document.getElementById(`combo-item-${comboId}`);
        if (itemUI) {
            itemUI.querySelector('.quantity-display').textContent = selectedCombos[comboId];
            itemUI.querySelector('.btn-minus').disabled = selectedCombos[comboId] === 0;
        }
        updateBookingSummary();
    });
}

async function loadSeatMap(movieId, date) {
    const container = document.getElementById('seat-map');
    container.innerHTML = '<div style="color: white; padding: 20px;">Đang tải sơ đồ chỗ ngồi...</div>';
    try {
        const rows = [];
        const seatRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        const seatCols = 12; 
        seatRows.forEach(row => {
            const rowData = { row: row, seats: [] };
            for (let i = 1; i <= seatCols; i++) {
                const isBooked = Math.random() > 0.85; 
                rowData.seats.push({
                    row: row,
                    col: i,
                    status: isBooked ? 'booked' : 'available'
                });
            }
            rows.push(rowData);
        });
        await new Promise(res => setTimeout(res, 300)); 
        renderSeatMap(rows);
        const title = document.getElementById('booking-title');
        if (title && date) {
            const dateObj = new Date(date + 'T00:00:00');
            const dateString = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(dateObj);
            title.textContent = `Chọn Vé - Ngày ${dateString} | Suất ${selectedShowtime}`;
        }
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p style="color:red">Không thể tải sơ đồ chỗ ngồi.</p>';
    }
}

function renderSeatMap(rows) {
    const container = document.getElementById('seat-map');
    container.innerHTML = '';
    currentSeats = [];
    const COLS_PER_ROW = 14;
    const GAP_COLS = [2, 11]; 
    rows.forEach(r => {
        let seatIndex = 0; 
        for (let i = 0; i < COLS_PER_ROW; i++) {
            if (GAP_COLS.includes(i)) {
                const gap = document.createElement('div');
                gap.className = 'seat gap';
                container.appendChild(gap);
                continue;
            }
            if (seatIndex >= r.seats.length) {
                const gap = document.createElement('div');
                gap.className = 'seat gap';
                container.appendChild(gap);
                continue;
            }
            const s = r.seats[seatIndex];
            const el = document.createElement('div');
            el.className = 'seat ' + (s.status === 'booked' ? 'booked' : 'available');
            el.textContent = `${s.row}${s.col}`;
            el.dataset.row = s.row;
            el.dataset.col = s.col;
            if (s.status !== 'booked') {
                el.addEventListener('click', onSeatClick);
            }
            container.appendChild(el);
            currentSeats.push({ row: s.row, col: s.col, status: s.status, el });
            seatIndex++;
        }
    });
    updateBookingSummary();
}

function onSeatClick(e) {
    const el = e.currentTarget;
    const row = el.dataset.row;
    const col = parseInt(el.dataset.col, 10);
    const key = `${row}${col}`;
    const idx = selectedSeats.findIndex(s => s.key === key);
    if (idx >= 0) {
        selectedSeats.splice(idx, 1);
        el.classList.remove('selected');
    } else {
        if(selectedSeats.length >= 8) {
            alert("Bạn chỉ được chọn tối đa 8 ghế!");
            return;
        }
        selectedSeats.push({ row, col, key });
        el.classList.add('selected');
    }
    updateBookingSummary();
}

function updateBookingSummary() {
    let seatTotal = 0;
    let comboTotal = 0;
    const seatListEl = document.getElementById('selected-list');
    const seatTotalEl = document.getElementById('selected-seats-total');
    
    if (selectedSeats.length === 0) {
        seatListEl.textContent = '(chưa chọn)';
        seatTotalEl.textContent = '0 VND';
    } else {
        seatListEl.textContent = selectedSeats.map(s => s.key).join(', ');
        seatTotal = selectedSeats.length * SEAT_PRICE;
        seatTotalEl.textContent = `${seatTotal.toLocaleString('vi-VN')} VND`;
    }

    const comboListEl = document.getElementById('combo-summary-list');
    comboListEl.innerHTML = '';
    let comboHtml = '';
    for (const comboId in selectedCombos) {
        const quantity = selectedCombos[comboId];
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
    comboListEl.style.display = comboTotal > 0 ? 'block' : 'none';

    // --- TÍNH GIẢM GIÁ ---
    discountAmount = 0;
    if (appliedVoucher) {
        if (appliedVoucher.type === 'percent') {
            discountAmount = seatTotal * appliedVoucher.value;
        } else if (appliedVoucher.type === 'fixed') {
            discountAmount = appliedVoucher.value;
        }
        
        const tempTotal = seatTotal + comboTotal;
        if (discountAmount > tempTotal) discountAmount = tempTotal;

        const discountSection = document.getElementById('discount-section');
        const discountValEl = document.getElementById('discount-amount');
        if(discountSection && discountValEl) {
            discountSection.style.display = 'block';
            discountValEl.textContent = `-${discountAmount.toLocaleString('vi-VN')} VND`;
        }
    } else {
        const discountSection = document.getElementById('discount-section');
        if(discountSection) discountSection.style.display = 'none';
    }

    const totalPriceEl = document.getElementById('total-price');
    const finalTotal = seatTotal + comboTotal - discountAmount;
    totalPriceEl.textContent = `${finalTotal.toLocaleString('vi-VN')} VND`;
}

async function confirmBooking(movieId) {
    if (selectedSeats.length === 0) {
        window.alert('Vui lòng chọn ít nhất 1 ghế.');
        return;
    }
    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    if (!name || !phone) {
        window.alert('Vui lòng nhập tên và số điện thoại.');
        return;
    }
    const finalCombos = {};
    for (const comboId in selectedCombos) {
        if (selectedCombos[comboId] > 0) {
            finalCombos[comboId] = selectedCombos[comboId];
        }
    }
    const movie = findMovieInMock(movieId);
    const bookingId = `CGV${Math.floor(Math.random() * 100000)}`;
    
    const finalTotalStr = document.getElementById('total-price').textContent;
    const finalTotalPrice = parseInt(finalTotalStr.replace(/\D/g,''));

    const bookingDetails = {
        bookingId: bookingId,
        movie: {
            title: movie ? movie.title : 'Phim đã chọn',
            imageUrl: movie ? (movie.imageUrl || DEFAULT_POSTER) : DEFAULT_POSTER
        },
        date: selectedDate,
        showtime: selectedShowtime,
        seats: selectedSeats, 
        combos: finalCombos,
        customer: { name, phone },
        voucher: appliedVoucher,
        discount: discountAmount,
        totalPrice: finalTotalPrice
    };
    try {
        sessionStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));
        const msg = document.getElementById('booking-message');
        if(msg) msg.textContent = 'Đang chuyển đến trang thanh toán...';
        setTimeout(() => {
            window.location.href = 'payment.html';
        }, 1500);
    } catch (err) {
        console.error('Lỗi khi lưu sessionStorage:', err);
        window.alert('Lỗi: ' + err.message);
    }
}

// --- CÁC HÀM HELPER (Header/Modal/Login) ---
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

async function checkLoginStatus() {
    try {
        const res = await fetch(
            "http://localhost/LT-Web_Dat-Ve-Xem-Phim/backend/api/auth/me.php",
            { method: "GET", credentials: "include" }
        );
        const data = await res.json();
        updateHeaderUI(res.ok ? data.username : null);
    } catch (err) {
        console.error("Lỗi check login:", err);
        updateHeaderUI(null);
    }
}

function updateHeaderUI(username) {
    const userMenuBtn = document.getElementById("user-menu-btn");
    const userDropdown = document.getElementById("user-dropdown");
    if (!userMenuBtn || !userDropdown) return;

    if (username) {
        userMenuBtn.innerHTML = `<i class="fa-solid fa-user"></i>Xin chào, ${username} !`;
        userDropdown.innerHTML = `
            <a href="profile.html">Tài khoản của tôi</a> <a href="#" id="logout-btn">Đăng xuất</a>
        `;
        setupLogoutListener();
    } else {
        userMenuBtn.innerHTML = `<i class="fa-solid fa-user"></i>`;
        userDropdown.innerHTML = `
            <a href="login.html">Đăng nhập</a>
            <a href="register.html">Đăng kí</a>
        `;
    }
}

function setupLogoutListener() {
    const btn = document.getElementById("logout-btn");
    if (!btn) return;
    btn.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
            await fetch(
                "http://localhost/LT-Web_Dat-Ve-Xem-Phim/backend/api/auth/login.php",
                { credentials: "include" }
            );
        } catch(e) {}
        updateHeaderUI(null); 
        window.location.href = "index.html";
    });
}