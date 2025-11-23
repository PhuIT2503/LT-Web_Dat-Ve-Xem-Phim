const API_BASE_URL = "http://localhost/LT-Web_Dat-Ve-Xem-Phim/backend/api";

// Biến toàn cục để lưu giá gốc và voucher
let originalTotalAmount = 0; 
let currentDiscount = 0;

document.addEventListener('DOMContentLoaded', async () => {
    await checkLoginStatus();
    initializePaymentPage();
    setupPaymentTabs();

    document.getElementById('confirm-payment')?.addEventListener('click', processRealPayment);
    
    // ⭐ CODE MỚI: Gán sự kiện nút áp dụng voucher
    document.getElementById('apply-voucher-btn')?.addEventListener('click', handleApplyVoucher);
});

function initializePaymentPage() {
    const dataString = sessionStorage.getItem('bookingDetails');
    if (!dataString) {
        alert("Không tìm thấy vé. Vui lòng chọn lại.");
        window.location.href = 'movies.html';
        return;
    }
    const bookingData = JSON.parse(dataString);
    
    // Lưu lại tổng tiền gốc
    originalTotalAmount = bookingData.total_amount;

    // Hiển thị thông tin cơ bản
    document.getElementById('summary-seat-list').textContent = bookingData.seat_labels;
    const seatPrice = bookingData.seat_ids.length * 90000;
    document.getElementById('summary-seat-total').textContent = seatPrice.toLocaleString('vi-VN') + " VND";

    // Hiển thị Combo
    const comboContainer = document.getElementById('combo-summary-list');
    if (comboContainer && bookingData.combos) {
        comboContainer.innerHTML = bookingData.combos.length > 0 ? 
            bookingData.combos.map(c => `
                <div class="summary-item">
                    <span>${c.qty} x ${c.name}</span>
                    <span>${(c.qty * c.price).toLocaleString('vi-VN')} VND</span>
                </div>`).join('') : '';
    }

    // Hiển thị Tổng tiền ban đầu
    updateTotalDisplay(originalTotalAmount);

    // Thông tin phim
    document.getElementById('summary-title').textContent = bookingData.movie_title || "Phim chưa xác định";
    if (bookingData.movie_image) document.getElementById('summary-poster').src = bookingData.movie_image;
    if (bookingData.show_date) document.getElementById('summary-date-time').textContent = `Ngày: ${bookingData.show_date} | Suất: ${bookingData.show_time}`;
    document.getElementById('summary-booking-id').textContent = "CGV" + Math.floor(100000 + Math.random() * 900000);
}

// ⭐ CODE MỚI: Hàm xử lý Voucher
async function handleApplyVoucher() {
    const codeInput = document.getElementById('voucher-input');
    const msgEl = document.getElementById('voucher-message');
    const code = codeInput.value.trim().toUpperCase();

    if (!code) return;

    try {
        const res = await fetch(`${API_BASE_URL}/vouchers/check.php?code=${code}`);
        const data = await res.json();

        if (data.valid) {
            msgEl.textContent = `${data.message} (${data.desc})`;
            msgEl.style.color = '#4caf50'; // Màu xanh
            
            // Tính toán giảm giá
            if (data.is_percent) {
                currentDiscount = originalTotalAmount * (data.discount_value / 100);
            } else {
                currentDiscount = data.discount_value;
            }

            // Cập nhật giao diện
            document.getElementById('discount-row').style.display = 'flex';
            document.getElementById('discount-amount').textContent = `-${currentDiscount.toLocaleString('vi-VN')} VND`;
            
            // Tính lại tổng cuối
            const finalTotal = Math.max(0, originalTotalAmount - currentDiscount);
            updateTotalDisplay(finalTotal);
            
            // Khóa ô nhập để không spam
            codeInput.disabled = true;
            document.getElementById('apply-voucher-btn').textContent = "Đã dùng";
            document.getElementById('apply-voucher-btn').disabled = true;

        } else {
            msgEl.textContent = data.message;
            msgEl.style.color = '#ff5555'; // Màu đỏ
            currentDiscount = 0;
            document.getElementById('discount-row').style.display = 'none';
            updateTotalDisplay(originalTotalAmount);
        }
    } catch (err) {
        console.error(err);
    }
}

function updateTotalDisplay(amount) {
    document.getElementById('summary-final-total').textContent = amount.toLocaleString('vi-VN') + " VND";
    // Cập nhật lại vào sessionStorage để gửi đi khi bấm Thanh toán
    // Lưu ý: Ta chỉ cập nhật số tiền hiển thị, data gốc giữ nguyên để server xử lý nếu cần
}

async function processRealPayment() {
    const btn = document.getElementById('confirm-payment');
    const dataString = sessionStorage.getItem('bookingDetails');
    if (!dataString) return;

    let bookingData = JSON.parse(dataString);
    
    // ⭐ CẬP NHẬT TỔNG TIỀN ĐÃ TRỪ GIẢM GIÁ ⭐
    const finalAmount = Math.max(0, originalTotalAmount - currentDiscount);

    const payload = {
        showtime_id: bookingData.showtime_id,
        seats: bookingData.seat_ids, 
        customer_name: bookingData.customer_name || document.getElementById('card-name')?.value || "Khách hàng",
        customer_phone: bookingData.customer_phone || "",
        total_amount: finalAmount // Gửi số tiền đã giảm
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

        const result = await res.json();

        if (res.ok) {
            document.getElementById('payment-success-modal').style.display = 'flex';
            sessionStorage.removeItem('bookingDetails');
            document.getElementById('back-to-home').addEventListener('click', () => window.location.href = 'index.html');
        } else {
            alert("Lỗi đặt vé: " + result.message);
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-lock"></i> Thanh Toán';
        }
    } catch (err) {
        console.error(err);
        alert("Lỗi kết nối server.");
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-lock"></i> Thanh Toán';
    }
}

function setupPaymentTabs() { /* ... Giữ nguyên code cũ ... */ 
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const targetId = tab.dataset.tab;
            document.getElementById(`tab-${targetId}`).classList.add('active');
        });
    });
}
async function checkLoginStatus() { try { await fetch(`${API_BASE_URL}/auth/me.php`, { credentials: "include" }); } catch (e) {} }