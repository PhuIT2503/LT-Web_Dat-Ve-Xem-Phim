/* === NỘI DUNG TỪ frontend/js/booking.js (ĐÃ CẬP NHẬT) === */
document.addEventListener('DOMContentLoaded', () => {
    initializeBookingPage();
});

// ⭐ CẬP NHẬT: Đảm bảo hàm là 'async'
async function initializeBookingPage() {
    try {
        // (Giả sử header/footer/modal được hard-code trong HTML)
        
        // ⭐ CẬP NHẬT: Gọi hàm kiểm tra đăng nhập
        await checkLoginStatus(); 

        addHeaderScrollEffect();
        setupModalListeners();
        setupHeaderSearchListeners();
        setupUserMenuListeners(); // <-- Gọi hàm menu user

        const params = new URLSearchParams(window.location.search);
        const movieId = params.get('id');
        if (!movieId) {
            document.getElementById('booking-title').textContent = 'Lỗi: Không có phim để đặt vé';
            return;
        }

        const movie = findMovieInMock(movieId);
        if (movie) {
            document.getElementById('movie-poster').src = movie.imageUrl;
            document.getElementById('movie-poster').style.display = 'block';
            document.getElementById('movie-title').textContent = movie.title;
            document.getElementById('movie-year-rating').textContent = `Năm: ${movie.year || 'N/A'} | Rating: ${movie.rating || 'N/A'}`;
            document.getElementById('movie-duration-genre').textContent = `Thời lượng: ${movie.duration || 'N/A'} | Thể loại: ${movie.genre || 'N/A'}`;
        } else {
            document.getElementById('movie-title').textContent = `Phim #${movieId}`;
        }
        
        renderWeekSelector(movieId);
        renderShowtimes(movieId, selectedDate);
        renderComboSelector(); 
        await loadSeatMap(movieId, selectedDate);

        document.getElementById('confirm-booking').addEventListener('click', () => confirmBooking(movieId));

    } catch (err) {
        console.error('Lỗi khởi tạo booking:', err);
    }
}

// ... (Toàn bộ code logic của booking.js: findMovieInMock, renderWeekSelector, v.v...)
// ... (Bạn giữ nguyên phần code logic ở giữa) ...

function findMovieInMock(id) {
    const numeric = parseInt(id, 10);
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
        title: 'Combo 1 Lớn',
        price: 75000,
        description: '1 Bắp Lớn & 1 Nước Lớn',
        imageUrl: 'bapnuoc.jpg'
    },
    {
        id: 'combo2',
        title: 'Combo 2 Lớn',
        price: 89000,
        description: '1 Bắp Lớn & 2 Nước Lớn',
        imageUrl: 'bapnuoc.jpg'
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
            <img src="${combo.imageUrl}" alt="${combo.title}">
            <div class="combo-info">
                <h4>${combo.title}</h4>
                <p>${combo.price.toLocaleString('vi-VN')} VND</p>
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
        const comboId = e.target.dataset.id;
        if (!comboId) return;
        const currentQty = selectedCombos[comboId];
        if (e.target.classList.contains('btn-plus')) {
            selectedCombos[comboId] = currentQty + 1;
        } else if (e.target.classList.contains('btn-minus')) {
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
    container.innerHTML = 'Đang tải sơ đồ chỗ ngồi...';
    try {
        console.log(`Đang giả lập tải ghế cho phim ${movieId}, ngày ${date}, suất ${selectedShowtime}`);
        const rows = [];
        const seatRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        const seatCols = 12; 
        seatRows.forEach(row => {
            const rowData = { row: row, seats: [] };
            for (let i = 1; i <= seatCols; i++) {
                const isBooked = Math.random() > 0.8;
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
        container.innerHTML = '<p style="color:red">Không thể tải sơ đồ chỗ ngồi. Vui lòng khởi động backend (nếu có).</p>';
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
    const totalPriceEl = document.getElementById('total-price');
    const finalTotal = seatTotal + comboTotal;
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
    const bookingDetails = {
        bookingId: bookingId,
        movie: {
            title: movie ? movie.title : 'Phim đã chọn',
            imageUrl: movie ? movie.imageUrl : ''
        },
        date: selectedDate,
        showtime: selectedShowtime,
        seats: selectedSeats, 
        combos: finalCombos
    };
    try {
        sessionStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));
        document.getElementById('booking-message').textContent = 'Đã lưu thông tin, đang chuyển đến trang thanh toán...';
        setTimeout(() => {
            window.location.href = 'payment.html';
        }, 1500);
    } catch (err) {
        console.error('Lỗi khi lưu sessionStorage:', err);
        window.alert('Lỗi khi lưu chi tiết vé: ' + (err.message || err));
    }
}

// --- CÁC HÀM HELPER (Cho header/modal/search) ---
async function loadComponent(placeholderId, componentUrl) {
    try {
        const response = await fetch(componentUrl);
        if (!response.ok) {
            throw new Error(`Không thể tải ${componentUrl}: ${response.statusText}`);
        }
        const html = await response.text();
        const placeholder = document.querySelector(placeholderId);
        if (placeholder) {
            placeholder.innerHTML = html;
        }
    } catch (error) {
        console.error(`Lỗi khi tải component ${componentUrl}:`, error);
        const placeholder = document.querySelector(placeholderId);
        if (placeholder) {
            placeholder.innerHTML = `<p style="color:red;">Lỗi tải ${componentUrl}</p>`;
        }
    }
}

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
    if (!btn || !dropdown) {
        return;
    }
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
   (Dán 3 hàm mới vào đây)
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
        userMenuBtn.innerHTML = `<i class="fa-solid fa-user"></i> Chào, ${username}`;
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
            "http://localhost/LT-Web_Dat-Ve-Xem-Phim/backend/api/auth/login.php",
            { credentials: "include" }
        );
        updateHeaderUI(null); 
        window.location.href = "index.html";
    });
}