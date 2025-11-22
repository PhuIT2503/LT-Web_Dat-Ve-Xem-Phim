const API_BASE_URL = "http://localhost/LT-Web_Dat-Ve-Xem-Phim/backend/api";

document.addEventListener('DOMContentLoaded', async () => {
    await checkLoginStatus();
    initializePaymentPage();
    
    // Tab chuyển đổi phương thức thanh toán
    setupPaymentTabs();

    document.getElementById('confirm-payment')?.addEventListener('click', processRealPayment);
});

function initializePaymentPage() {
    const dataString = sessionStorage.getItem('bookingDetails');
    if (!dataString) {
        alert("Không tìm thấy vé. Vui lòng chọn lại.");
        window.location.href = 'movies.html';
        return;
    }
    const bookingData = JSON.parse(dataString);
    
    // 1. Hiển thị Ghế
    document.getElementById('summary-seat-list').textContent = bookingData.seat_labels;
    
    // 2. Hiển thị Giá Vé Riêng
    const seatPrice = bookingData.seat_ids.length * 90000; // Hoặc lấy từ data nếu muốn
    document.getElementById('summary-seat-total').textContent = seatPrice.toLocaleString('vi-VN') + " VND";

    // ⭐ 3. HIỂN THỊ COMBO (MỚI) ⭐
    const comboContainer = document.getElementById('combo-summary-list');
    if (comboContainer) {
        if (bookingData.combos && bookingData.combos.length > 0) {
            let html = '';
            bookingData.combos.forEach(c => {
                html += `
                    <div class="summary-item">
                        <span>${c.qty} x ${c.name}</span>
                        <span>${(c.qty * c.price).toLocaleString('vi-VN')} VND</span>
                    </div>
                `;
            });
            comboContainer.innerHTML = html;
        } else {
            comboContainer.innerHTML = ''; // Xóa nếu không có combo
        }
    }

    // 4. Hiển thị Tổng Tiền Cuối Cùng (Đã bao gồm combo)
    document.getElementById('summary-final-total').textContent = bookingData.total_amount.toLocaleString('vi-VN') + " VND";

    // 5. Thông tin phim, ngày giờ, poster (Giữ nguyên)
    document.getElementById('summary-title').textContent = bookingData.movie_title || "Phim chưa xác định";
    if (bookingData.movie_image) {
        document.getElementById('summary-poster').src = bookingData.movie_image;
    }
    if (bookingData.show_date && bookingData.show_time) {
        document.getElementById('summary-date-time').textContent = `Ngày: ${bookingData.show_date} | Suất: ${bookingData.show_time}`;
    }
    document.getElementById('summary-booking-id').textContent = "CGV" + Math.floor(100000 + Math.random() * 900000);
}

async function processRealPayment() {
    const btn = document.getElementById('confirm-payment');
    const dataString = sessionStorage.getItem('bookingDetails');
    if (!dataString) return;

    const bookingData = JSON.parse(dataString);

    // 1. Lấy tên và SĐT từ dữ liệu đã lưu ở bước trước (booking.js)
    // Ưu tiên tên nhập ở bước Booking, nếu không có thì mới lấy "Khách hàng"
    const finalName = bookingData.customer_name || document.getElementById('card-name')?.value || "Khách hàng";
    const finalPhone = bookingData.customer_phone || ""; 

    // 2. Payload gửi lên PHP
    const payload = {
        showtime_id: bookingData.showtime_id,
        seats: bookingData.seat_ids, 
        customer_name: finalName,   // <--- Phải dùng biến này
        customer_phone: finalPhone, // <--- QUAN TRỌNG: Phải dùng biến này, KHÔNG ĐƯỢC ĐỂ SỐ CỨNG
        total_amount: bookingData.total_amount
    };

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';
    
    try {
        const res = await fetch(`${API_BASE_URL}/bookings/create.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include' 
        });

        const text = await res.text(); 
        let result;
        try { result = JSON.parse(text); } catch(e) { throw new Error("Lỗi Server: " + text); }

        if (res.ok) {
            document.getElementById('payment-success-modal').style.display = 'flex';
            sessionStorage.removeItem('bookingDetails');
            
            document.getElementById('back-to-home').addEventListener('click', () => {
                window.location.href = 'index.html';
            });

        } else {
            alert("Lỗi đặt vé: " + result.message);
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-lock"></i> Thanh Toán';
        }
    } catch (err) {
        console.error(err);
        alert("Lỗi kết nối: " + err.message);
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-lock"></i> Thanh Toán';
    }
}

function setupPaymentTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Xóa active cũ
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            // Thêm active mới
            tab.classList.add('active');
            const targetId = tab.dataset.tab;
            document.getElementById(`tab-${targetId}`).classList.add('active');
        });
    });
}

async function checkLoginStatus() {
    try { await fetch(`${API_BASE_URL}/auth/me.php`, { credentials: "include" }); } catch (e) {}
}