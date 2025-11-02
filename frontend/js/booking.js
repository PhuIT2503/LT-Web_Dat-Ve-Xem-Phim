document.addEventListener('DOMContentLoaded', () => {
    initializeBookingPage();
});

async function initializeBookingPage() {
    try {
        await Promise.all([
            loadComponent('#header-placeholder', 'components/header.html'),
            loadComponent('#footer-placeholder', 'components/footer.html'),
            loadComponent('#modal-placeholder', 'components/modal-trailer.html')
        ]);

        addHeaderScrollEffect();
        setupModalListeners();
        setupHeaderSearchListeners();

        // Read movie id from URL
        const params = new URLSearchParams(window.location.search);
        const movieId = params.get('id');
        if (!movieId) {
            document.getElementById('booking-title').textContent = 'Lỗi: Không có phim để đặt vé';
            return;
        }

        // Render movie info from mockData
        const movie = findMovieInMock(movieId);
        const movieInfoEl = document.getElementById('movie-info');
        movieInfoEl.textContent = movie ? `${movie.title} (${movie.year})` : `Phim #${movieId}`;

    // render date selector (next 7 days) and load seats for selected date
    renderWeekSelector(movieId);
    // load seats from backend for default selected date
    await loadSeatMap(movieId, selectedDate);

        // setup confirm
        document.getElementById('confirm-booking').addEventListener('click', () => confirmBooking(movieId));

    } catch (err) {
        console.error('Lỗi khởi tạo booking:', err);
    }
}

function findMovieInMock(id) {
    const numeric = parseInt(id, 10);
    const allMovies = [mockData.banner, ...mockData.newMovies, ...mockData.trendingMovies];
    return allMovies.find(m => m.id === numeric) || null;
}

let currentSeats = []; // flattened seat data
let selectedSeats = [];
const SEAT_PRICE = 90000; // VND per seat (example)
let selectedDate = new Date().toISOString().slice(0,10); // default today (YYYY-MM-DD)

/**
 * Render next 7 days as selectable items and attach handlers.
 * When a date is selected, reload the seat map for that date.
 */
function renderWeekSelector(movieId) {
    const container = document.getElementById('date-selector');
    if (!container) return;
    container.innerHTML = '';

    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const iso = d.toISOString().slice(0,10);
        const weekday = new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(d); // e.g., 'Th 4'
        const label = `${weekday} ${d.getDate()}/${d.getMonth()+1}`;

        const btn = document.createElement('div');
        btn.className = 'date-item';
        btn.dataset.date = iso;
        btn.innerHTML = `<div style="font-weight:600">${label}</div><div style="font-size:12px;color:#444">${iso}</div>`;
        if (iso === selectedDate) btn.classList.add('selected');
        btn.addEventListener('click', async () => {
            // toggle selected class
            const prev = container.querySelector('.date-item.selected');
            if (prev) prev.classList.remove('selected');
            btn.classList.add('selected');
            selectedDate = iso;
            // clear any selected seats
            selectedSeats = [];
            updateSelectedDisplay();
            // reload seat map for the chosen date
            await loadSeatMap(movieId, selectedDate);
        });
        container.appendChild(btn);
    }
}

async function loadSeatMap(movieId, date) {
    const container = document.getElementById('seat-map');
    container.innerHTML = 'Đang tải sơ đồ chỗ ngồi...';
    try {
        const q = date ? `?date=${encodeURIComponent(date)}` : '';
        const resp = await fetch(`http://localhost:3000/api/movies/${movieId}/seats${q}`);
        if (!resp.ok) throw new Error('Không thể tải dữ liệu ghế');
        const data = await resp.json();
        renderSeatMap(data.rows);
        // show selected date in UI (optional)
        const title = document.getElementById('booking-title');
        if (title && data.date) {
            title.textContent = `Đặt Vé — ${data.date}`;
        }
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p style="color:red">Không thể tải sơ đồ chỗ ngồi. Vui lòng khởi động backend (xem README trong thư mục backend).</p>';
    }
}

function renderSeatMap(rows) {
    const container = document.getElementById('seat-map');
    container.innerHTML = '';
    currentSeats = [];

    // We'll render with some padding columns for row letters
    // Build a flat grid: for each row, push an empty cell for spacing then seats
    rows.forEach(r => {
        // Row label cell
        const label = document.createElement('div');
        label.className = 'seat';
        label.style.visibility = 'hidden';
        container.appendChild(label);

        r.seats.forEach(s => {
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
        });

        // small gap between rows: add two invisible cells
        const gap1 = document.createElement('div'); gap1.className = 'seat'; gap1.style.visibility = 'hidden'; container.appendChild(gap1);
        const gap2 = document.createElement('div'); gap2.className = 'seat'; gap2.style.visibility = 'hidden'; container.appendChild(gap2);
    });

    updateSelectedDisplay();
}

function onSeatClick(e) {
    const el = e.currentTarget;
    const row = el.dataset.row;
    const col = parseInt(el.dataset.col, 10);
    const key = `${row}${col}`;
    const idx = selectedSeats.findIndex(s => s.key === key);
    if (idx >= 0) {
        // unselect
        selectedSeats.splice(idx, 1);
        el.classList.remove('selected');
    } else {
        selectedSeats.push({ row, col, key });
        el.classList.add('selected');
    }
    updateSelectedDisplay();
}

function updateSelectedDisplay() {
    const list = document.getElementById('selected-list');
    const totalEl = document.getElementById('total-price');
    if (selectedSeats.length === 0) {
        list.textContent = '(chưa chọn)';
        totalEl.textContent = '0';
    } else {
        list.textContent = selectedSeats.map(s => s.key).join(', ');
        totalEl.textContent = (selectedSeats.length * SEAT_PRICE).toLocaleString('vi-VN');
    }
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

    // Prepare payload
    const seatsPayload = selectedSeats.map(s => ({ row: s.row, col: s.col }));
    try {
        const resp = await fetch('http://localhost:3000/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ movieId, seats: seatsPayload, customer: { name, phone }, date: selectedDate })
        });

        if (resp.status === 409) {
            const body = await resp.json();
            window.alert('Lỗi: Một số ghế đã bị đặt bởi người khác: ' + (body.conflicts || []).join(', '));
            // Reload seat map
            await loadSeatMap(movieId);
            selectedSeats = [];
            updateSelectedDisplay();
            return;
        }

        if (!resp.ok) {
            const body = await resp.text();
            throw new Error(body || 'Lỗi khi tạo booking');
        }

        const data = await resp.json();
        document.getElementById('booking-message').textContent = 'Đặt vé thành công! Mã booking: ' + data.booking.id;
        // Clear selection and reload seats
        selectedSeats = [];
        await loadSeatMap(movieId);
        // Optionally navigate to a confirmation page
    } catch (err) {
        console.error('Lỗi khi gửi đặt vé:', err);
        window.alert('Lỗi khi gửi đặt vé: ' + (err.message || err));
    }
}

// --- helper functions copied from other scripts ---
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
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

function setupModalListeners() {
    const modal = document.getElementById('trailer-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const trailerIframe = document.getElementById('trailer-iframe');

    if (!modal || !closeBtn || !trailerIframe) {
        return;
    }

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
        if (event.target === modal) {
            closeModal();
        }
    });
}

function setupHeaderSearchListeners() {
    const input = document.getElementById('header-search-input');
    const btn = document.getElementById('header-search-btn');
    if (!input || !btn) return;

    function doSearch() {
        const q = input.value.trim();
        if (q === '') {
            window.location.href = 'movies.html';
        } else {
            window.location.href = `movies.html?q=${encodeURIComponent(q)}`;
        }
    }

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') doSearch();
    });

    btn.addEventListener('click', doSearch);
}
