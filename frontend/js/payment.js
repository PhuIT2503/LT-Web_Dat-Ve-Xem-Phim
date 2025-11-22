const API_BASE_URL = "http://localhost/LT-Web_Dat-Ve-Xem-Phim/backend/api";

document.addEventListener('DOMContentLoaded', async () => {
    await checkLoginStatus();
    initializePaymentPage();
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
    document.getElementById('summary-seat-list').textContent = bookingData.seat_labels;
    document.getElementById('summary-final-total').textContent = bookingData.total_amount.toLocaleString() + " VND";
}

async function processRealPayment() {
    const btn = document.getElementById('confirm-payment');
    const dataString = sessionStorage.getItem('bookingDetails');
    if (!dataString) return;

    const bookingData = JSON.parse(dataString);
    const custName = document.getElementById('card-name')?.value || "Khách hàng";

    // Payload gửi lên PHP
    const payload = {
        showtime_id: bookingData.showtime_id,
        seats: bookingData.seat_ids, // Mảng ID ghế
        customer_name: custName,
        customer_phone: "0909000111", 
        total_amount: bookingData.total_amount
    };

    btn.disabled = true;
    btn.innerHTML = 'Đang xử lý...';

    try {
        // GỌI API CREATE VỚI URL TUYỆT ĐỐI
        const res = await fetch(`${API_BASE_URL}/bookings/create.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include' 
        });

        const text = await res.text(); // Lấy text trước để debug
        console.log("Server Response:", text);

        let result;
        try { result = JSON.parse(text); } catch(e) { throw new Error("Lỗi Server (không phải JSON): " + text); }

        if (res.ok) {
            document.getElementById('payment-success-modal').style.display = 'flex';
            sessionStorage.removeItem('bookingDetails');
            setTimeout(() => { window.location.href = 'profile.html'; }, 2000);
        } else {
            alert("Lỗi đặt vé: " + result.message);
            btn.disabled = false;
            btn.innerHTML = 'Thanh Toán';
        }
    } catch (err) {
        console.error(err);
        alert("Lỗi: " + err.message);
        btn.disabled = false;
        btn.innerHTML = 'Thanh Toán';
    }
}

async function checkLoginStatus() {
    try { await fetch(`${API_BASE_URL}/auth/me.php`, { credentials: "include" }); } catch (e) {}
}