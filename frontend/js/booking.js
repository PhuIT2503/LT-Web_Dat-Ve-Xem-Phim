const API_BASE_URL = "http://localhost/LT-Web_Dat-Ve-Xem-Phim/backend/api";
const SEAT_PRICE = 90000; 

let selectedSeats = [];
let selectedShowtimeId = null;
let bookedSeatsList = []; 
let currentMovieId = null;

document.addEventListener('DOMContentLoaded', async () => {
    await checkLoginStatus(); 
    addHeaderScrollEffect();
    setupUserMenuListeners();

    const params = new URLSearchParams(window.location.search);
    currentMovieId = params.get('id');
    
    if (!currentMovieId) { alert("Chưa chọn phim!"); window.location.href="index.html"; return; }

    initializeBookingPage(currentMovieId);
});

async function initializeBookingPage(movieId) {
    // 1. Tải thông tin phim vào Sidebar (Cột phải)
    await loadMovieInfo(movieId);

    // 2. Tạo thanh chọn ngày và tự động tải suất chiếu ngày đầu tiên
    generateDateSelector(movieId);

    // 3. Gán sự kiện nút Tiếp tục
    const btnConfirm = document.getElementById('confirm-booking');
    if(btnConfirm) {
        // Clone để xóa các event cũ nếu có
        const newBtn = btnConfirm.cloneNode(true);
        btnConfirm.parentNode.replaceChild(newBtn, btnConfirm);
        newBtn.addEventListener('click', confirmBooking);
    }
}

// --- TẢI THÔNG TIN PHIM (SIDEBAR) ---
async function loadMovieInfo(movieId) {
    try {
        const res = await fetch(`${API_BASE_URL}/movies/detail.php?id=${movieId}`);
        if (!res.ok) return;
        const movie = await res.json();

        // Điền dữ liệu vào cột phải
        document.getElementById('movie-title').textContent = movie.title;
        document.getElementById('movie-poster').src = movie.imageUrl;
        document.getElementById('movie-poster').style.display = 'block';
        document.getElementById('movie-year-rating').textContent = `Năm: ${movie.year} | Rating: ${movie.rating}`;
        document.getElementById('movie-duration-genre').textContent = `Thời lượng: ${movie.duration} | Thể loại: ${movie.genre}`;
    } catch (err) {
        console.error("Lỗi tải info phim:", err);
    }
}

// --- TẠO THANH CHỌN NGÀY ---
function generateDateSelector(movieId) {
    const container = document.getElementById('date-selector');
    container.innerHTML = '';

    const today = new Date(); 
    
    // Tạo 7 ngày tiếp theo
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        // Format ngày gửi lên API: YYYY-MM-DD
        const apiDate = date.toISOString().split('T')[0];
        
        // Format ngày hiển thị: DD/MM
        const displayDate = `${date.getDate()}/${date.getMonth() + 1}`;
        const dayName = i === 0 ? "Hôm nay" : `Thứ ${date.getDay() + 1 === 1 ? 'CN' : date.getDay() + 1}`;

        const btn = document.createElement('div');
        btn.className = 'date-item';
        if (i === 0) btn.classList.add('selected'); // Mặc định chọn hôm nay
        
        btn.innerHTML = `<div>${dayName}</div><div style="font-size:1.2rem; font-weight:bold">${displayDate}</div>`;
        
        btn.addEventListener('click', () => {
            // Đổi style active
            document.querySelectorAll('.date-item').forEach(el => el.classList.remove('selected'));
            btn.classList.add('selected');
            
            // Load suất chiếu theo ngày đã chọn
            loadShowtimes(movieId, apiDate);
        });

        container.appendChild(btn);
    }

    // Mặc định load suất chiếu của ngày hôm nay
    const todayApi = today.toISOString().split('T')[0];
    loadShowtimes(movieId, todayApi);
}

// --- LOAD SUẤT CHIẾU ---
async function loadShowtimes(movieId, date) {
    const container = document.getElementById('showtime-selector');
    container.innerHTML = '<p>Đang tìm suất chiếu...</p>';
    
    // Reset sơ đồ ghế khi đổi ngày/suất
    document.getElementById('seat-map').innerHTML = 'Vui lòng chọn suất chiếu.';
    selectedShowtimeId = null;
    selectedSeats = [];
    updateSummary();

    try {
        const res = await fetch(`${API_BASE_URL}/showtimes/list.php?movie_id=${movieId}&date=${date}`);
        const showtimes = await res.json();
        container.innerHTML = '';

        if (!showtimes || showtimes.length === 0) {
            container.innerHTML = '<p style="color: #ff5555; font-style: italic;">Không có suất chiếu nào vào ngày này.</p>';
            return;
        }

        showtimes.forEach(st => {
            const btn = document.createElement('div');
            btn.className = 'time-item';
            btn.textContent = `${st.show_time}`; 
            
            btn.addEventListener('click', () => {
                document.querySelectorAll('.time-item').forEach(el => el.classList.remove('selected'));
                btn.classList.add('selected');
                selectedShowtimeId = st.id;
                
                // Load ghế đã đặt
                loadBookedSeats(st.id);
            });
            container.appendChild(btn);
        });
    } catch (err) { console.error(err); container.innerHTML = 'Lỗi tải suất chiếu'; }
}

// --- LOAD GHẾ ĐÃ ĐẶT ---
async function loadBookedSeats(showtimeId) {
    const mapContainer = document.getElementById('seat-map');
    mapContainer.innerHTML = '<p style="color:white">Đang cập nhật sơ đồ...</p>';

    try {
        const res = await fetch(`${API_BASE_URL}/showtimes/booked_seats.php?id=${showtimeId}`);
        bookedSeatsList = await res.json(); 
        renderSeatMap();
    } catch (err) {
        console.error(err);
    }
}

// --- VẼ SƠ ĐỒ GHẾ ---
function renderSeatMap() {
    const container = document.getElementById('seat-map');
    container.innerHTML = ''; 
    selectedSeats = [];
    updateSummary();

    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const cols = 12; 
    let currentSeatId = 1;

    rows.forEach((rowName) => {
        for (let i = 1; i <= cols; i++) {
            const seatDiv = document.createElement('div');
            const isBooked = bookedSeatsList.includes(currentSeatId);
            
            seatDiv.className = isBooked ? 'seat booked' : 'seat available';
            seatDiv.textContent = rowName + i;
            seatDiv.dataset.id = currentSeatId;
            seatDiv.dataset.label = rowName + i;
            
            if (isBooked) {
                seatDiv.title = "Đã có người đặt";
            } else {
                seatDiv.addEventListener('click', function() {
                    this.classList.toggle('selected');
                    handleSeatSelect(parseInt(this.dataset.id), this.dataset.label);
                });
            }
            container.appendChild(seatDiv);
            currentSeatId++;
        }
    });
}

function handleSeatSelect(id, label) {
    const index = selectedSeats.findIndex(s => s.id === id);
    if (index > -1) selectedSeats.splice(index, 1);
    else selectedSeats.push({ id, label });
    updateSummary();
}

function updateSummary() {
    const list = document.getElementById('selected-list');
    const total = document.getElementById('total-price');
    
    if(selectedSeats.length === 0) {
        list.textContent = "(chưa chọn)";
        total.textContent = "0 VND";
        return;
    }
    list.textContent = selectedSeats.map(s => s.label).join(', ');
    total.textContent = (selectedSeats.length * SEAT_PRICE).toLocaleString('vi-VN') + " VND";
}

// ⭐ HÀM QUAN TRỌNG: CẬP NHẬT LOGIC LƯU INFO PHIM ⭐
function confirmBooking() {
    if (!selectedShowtimeId) { alert("Vui lòng chọn suất chiếu!"); return; }
    if (selectedSeats.length === 0) { alert("Vui lòng chọn ghế!"); return; }

    // 1. Lấy thông tin phim từ giao diện hiện tại
    const movieTitle = document.getElementById('movie-title').textContent;
    const movieImg = document.getElementById('movie-poster').src;

    // 2. Lấy ngày và giờ đã chọn (từ class .selected)
    // Ngày ở div thứ 2 trong .date-item
    const selectedDateEl = document.querySelector('.date-item.selected div:nth-child(2)');
    const selectedDate = selectedDateEl ? selectedDateEl.textContent : '';

    const selectedTimeEl = document.querySelector('.time-item.selected');
    const selectedTime = selectedTimeEl ? selectedTimeEl.textContent : '';

    // 3. Đóng gói dữ liệu
    const bookingData = {
        showtime_id: selectedShowtimeId, 
        seat_ids: selectedSeats.map(s => s.id),
        seat_labels: selectedSeats.map(s => s.label).join(', '),
        total_amount: selectedSeats.length * SEAT_PRICE,
        
        // Thêm các trường này để trang Payment dùng
        movie_title: movieTitle,
        movie_image: movieImg,
        show_date: selectedDate,
        show_time: selectedTime
    };

    sessionStorage.setItem('bookingDetails', JSON.stringify(bookingData));
    window.location.href = 'payment.html';
}

// Helper functions
async function checkLoginStatus() {
    try {
        const res = await fetch(`${API_BASE_URL}/auth/me.php`, { credentials: "include" });
        const data = await res.json();
        updateHeaderUI(res.ok ? data.username : null);
    } catch (e) {}
}
function updateHeaderUI(username) {
    const btn = document.getElementById("user-menu-btn");
    const dropdown = document.getElementById("user-dropdown");
    if (username) {
        btn.innerHTML = `<i class="fa-solid fa-user"></i> ${username}`;
        dropdown.innerHTML = `<a href="profile.html">Tài khoản</a><a href="#" id="logout-btn">Đăng xuất</a>`;
        setTimeout(() => { document.getElementById('logout-btn')?.addEventListener('click', async (e)=>{ e.preventDefault(); await fetch(`${API_BASE_URL}/auth/logout.php`, {credentials:"include"}); window.location.href="index.html"; })}, 500);
    } else {
        btn.innerHTML = `<i class="fa-solid fa-user"></i>`;
        dropdown.innerHTML = `<a href="login.html">Đăng nhập</a><a href="register.html">Đăng kí</a>`;
    }
}
function addHeaderScrollEffect() { const h=document.querySelector('.main-header'); if(h) window.addEventListener('scroll', ()=>h.classList.toggle('scrolled', window.scrollY>50)); }
function setupUserMenuListeners() {
    const btn = document.getElementById('user-menu-btn');
    const dropdown = document.getElementById('user-dropdown');
    if(btn) btn.addEventListener('click', (e) => { e.stopPropagation(); dropdown.classList.toggle('active'); });
    window.addEventListener('click', () => dropdown?.classList.remove('active'));
}