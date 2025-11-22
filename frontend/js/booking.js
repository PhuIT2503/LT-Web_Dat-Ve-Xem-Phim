const API_BASE_URL = "http://localhost/LT-Web_Dat-Ve-Xem-Phim/backend/api";
const SEAT_PRICE = 90000; 

let selectedSeats = [];
let selectedShowtimeId = null;
let bookedSeatsList = []; 

document.addEventListener('DOMContentLoaded', async () => {
    await checkLoginStatus(); 
    addHeaderScrollEffect();
    setupUserMenuListeners();

    const params = new URLSearchParams(window.location.search);
    const movieId = params.get('id');
    
    if (!movieId) { alert("Chưa chọn phim!"); window.location.href="index.html"; return; }

    initializeBookingPage(movieId);
});

async function initializeBookingPage(movieId) {
    await loadShowtimes(movieId);
    
    // Gán sự kiện nút Tiếp tục
    const btnConfirm = document.getElementById('confirm-booking');
    if(btnConfirm) {
        const newBtn = btnConfirm.cloneNode(true);
        btnConfirm.parentNode.replaceChild(newBtn, btnConfirm);
        newBtn.addEventListener('click', confirmBooking);
    }
}

// --- 1. LOAD SUẤT CHIẾU ---
async function loadShowtimes(movieId) {
    const container = document.getElementById('showtime-selector');
    container.innerHTML = 'Đang tải suất chiếu...';
    
    try {
        const res = await fetch(`${API_BASE_URL}/showtimes/list.php?movie_id=${movieId}`);
        const showtimes = await res.json();
        container.innerHTML = '';

        if (!showtimes || showtimes.length === 0) {
            container.innerHTML = '<span style="color:red">Chưa có lịch chiếu.</span>';
            return;
        }

        showtimes.forEach(st => {
            const btn = document.createElement('div');
            btn.className = 'time-item';
            btn.textContent = `${st.show_time} (${st.room})`; // Hiển thị giờ + phòng
            
            btn.addEventListener('click', () => {
                document.querySelectorAll('.time-item').forEach(el => el.classList.remove('selected'));
                btn.classList.add('selected');
                selectedShowtimeId = st.id;
                
                // Load ghế đã đặt của suất này
                loadBookedSeats(st.id);
            });
            container.appendChild(btn);
        });
    } catch (err) { console.error(err); container.innerHTML = 'Lỗi tải suất chiếu'; }
}

// --- 2. LOAD GHẾ ĐÃ ĐẶT ---
async function loadBookedSeats(showtimeId) {
    const mapContainer = document.getElementById('seat-map');
    mapContainer.innerHTML = '<p style="color:white">Đang cập nhật sơ đồ...</p>';

    try {
        const res = await fetch(`${API_BASE_URL}/showtimes/booked_seats.php?id=${showtimeId}`);
        bookedSeatsList = await res.json(); // Mảng ID ghế [1, 2, 5...]
        renderSeatMap();
    } catch (err) {
        console.error(err);
    }
}

// --- 3. VẼ SƠ ĐỒ GHẾ ---
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

function confirmBooking() {
    if (!selectedShowtimeId) { alert("Vui lòng chọn suất chiếu!"); return; }
    if (selectedSeats.length === 0) { alert("Vui lòng chọn ghế!"); return; }

    const bookingData = {
        showtime_id: selectedShowtimeId, 
        seat_ids: selectedSeats.map(s => s.id),
        seat_labels: selectedSeats.map(s => s.label).join(', '),
        total_amount: selectedSeats.length * SEAT_PRICE
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
function addHeaderScrollEffect() {/*...*/}
function setupUserMenuListeners() {
    const btn = document.getElementById('user-menu-btn');
    const dropdown = document.getElementById('user-dropdown');
    if(btn) btn.addEventListener('click', (e) => { e.stopPropagation(); dropdown.classList.toggle('active'); });
    window.addEventListener('click', () => dropdown?.classList.remove('active'));
}