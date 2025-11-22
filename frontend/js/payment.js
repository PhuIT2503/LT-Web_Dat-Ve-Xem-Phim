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
    
    // 1. Hiển thị Ghế và Giá (Cũ)
    document.getElementById('summary-seat-list').textContent = bookingData.seat_labels;
    document.getElementById('summary-seat-total').textContent = bookingData.total_amount.toLocaleString('vi-VN') + " VND";
    document.getElementById('summary-final-total').textContent = bookingData.total_amount.toLocaleString('vi-VN') + " VND";

    // 2. ⭐ HIỂN THỊ THÔNG TIN PHIM (MỚI) ⭐
    document.getElementById('summary-title').textContent = bookingData.movie_title || "Phim chưa xác định";
    
    if (bookingData.movie_image) {
        document.getElementById('summary-poster').src = bookingData.movie_image;
    }
    
    // Hiển thị Ngày & Giờ chiếu
    if (bookingData.show_date && bookingData.show_time) {
        document.getElementById('summary-date-time').textContent = `Ngày: ${bookingData.show_date} | Suất: ${bookingData.show_time}`;
    }

    // Mã đặt vé tạm thời (Random cho đẹp)
    document.getElementById('summary-booking-id').textContent = "CGV" + Math.floor(100000 + Math.random() * 900000);
}

async function processRealPayment() {
    const btn = document.getElementById('confirm-payment');
    const dataString = sessionStorage.getItem('bookingDetails');
    if (!dataString) return;

    const bookingData = JSON.parse(dataString);
    const custName = document.getElementById('card-name')?.value || "Khách hàng"; // Lấy tên từ form thẻ hoặc mặc định

    // Payload gửi lên PHP
    const payload = {
        showtime_id: bookingData.showtime_id,
        seats: bookingData.seat_ids, // Mảng ID ghế
        customer_name: custName,
        customer_phone: "0909000111", // Có thể lấy từ input nếu muốn
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
            
            // Nút về trang chủ
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