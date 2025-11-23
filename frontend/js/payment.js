const API_BASE_URL = "http://localhost/LT-Web_Dat-Ve-Xem-Phim/backend/api";

// Biến toàn cục để lưu giá gốc và voucher
let originalTotalAmount = 0; 
let currentDiscount = 0;
let currentVoucherCode = null;

document.addEventListener('DOMContentLoaded', async () => {
    await checkLoginStatus();

    // 1. QUAN TRỌNG: Phải gọi hàm này để hiển thị thông tin vé
    initializePaymentPage(); 

    // 2. Tải danh sách Voucher vào dropdown
    await loadVoucherList();

    setupPaymentTabs();

    // Gán sự kiện nút thanh toán
    document.getElementById('confirm-payment')?.addEventListener('click', processRealPayment);
    
    // Gán sự kiện nút áp dụng voucher (lưu ý: Code mới dùng nút này với Dropdown)
    document.getElementById('apply-voucher-btn')?.addEventListener('click', handleApplyVoucher);
});

// --- HÀM 1: KHỞI TẠO TRANG (HIỂN THỊ THÔNG TIN VÉ) ---
function initializePaymentPage() {
    const dataString = sessionStorage.getItem('bookingDetails');
    
    // Nếu không có dữ liệu vé -> Đẩy về trang chọn phim
    if (!dataString) {
        alert("Không tìm thấy thông tin đặt vé. Vui lòng chọn phim lại.");
        window.location.href = 'movies.html';
        return;
    }

    const bookingData = JSON.parse(dataString);
    
    // Lưu lại tổng tiền gốc
    originalTotalAmount = bookingData.total_amount;

    // --- ĐỔ DỮ LIỆU VÀO GIAO DIỆN (PHẦN BỊ LỖI CỦA BẠN) ---
    
    // 1. Ảnh và Tên phim
    document.getElementById('summary-title').textContent = bookingData.movie_title || "Phim chưa xác định";
    if (bookingData.movie_image) {
        document.getElementById('summary-poster').src = bookingData.movie_image;
        document.getElementById('summary-poster').style.display = 'block';
    }

    // 2. Ngày giờ và Mã đơn ảo
    if (bookingData.show_date) {
        document.getElementById('summary-date-time').textContent = `Ngày: ${bookingData.show_date} | Suất: ${bookingData.show_time}`;
    }
    document.getElementById('summary-booking-id').textContent = "CGV" + Math.floor(100000 + Math.random() * 900000);

    // 3. Ghế ngồi
    document.getElementById('summary-seat-list').textContent = bookingData.seat_labels || "Chưa chọn ghế";
    
    // Tính tiền ghế riêng để hiển thị (Giá vé * số ghế)
    // Lưu ý: bookingData.total_amount đã bao gồm combo, nên ta tính lại tiền ghế để hiển thị cho rõ
    // Giả sử giá vé là 90k như bên booking.js
    const seatPriceTotal = (bookingData.seat_ids ? bookingData.seat_ids.length : 0) * 90000; 
    document.getElementById('summary-seat-total').textContent = seatPriceTotal.toLocaleString('vi-VN') + " VND";

    // 4. Hiển thị Combo (Nếu có)
    const comboContainer = document.getElementById('combo-summary-list');
    if (comboContainer && bookingData.combos && bookingData.combos.length > 0) {
        comboContainer.innerHTML = bookingData.combos.map(c => `
            <div class="summary-item">
                <span>${c.qty} x ${c.name}</span>
                <span>${(c.qty * c.price).toLocaleString('vi-VN')} VND</span>
            </div>`).join('');
    } else {
        if(comboContainer) comboContainer.innerHTML = '';
    }

    // 5. Hiển thị Tổng tiền ban đầu
    updateTotalDisplay(originalTotalAmount);
}

// --- HÀM 2: TẢI DANH SÁCH VOUCHER (MỚI) ---
async function loadVoucherList() {
    const selectEl = document.getElementById('voucher-select');
    if (!selectEl) return;

    try {
        const res = await fetch(`${API_BASE_URL}/vouchers/list.php`);
        const vouchers = await res.json();

        // Xóa các option cũ trừ option đầu tiên
        selectEl.innerHTML = '<option value="">-- Chọn mã giảm giá --</option>';

        if (vouchers.length > 0) {
            vouchers.forEach(v => {
                const option = document.createElement('option');
                option.value = v.code;
                // Hiển thị: GIAM10K - Giảm 10k...
                option.textContent = `${v.code} - ${v.desc}`; 
                selectEl.appendChild(option);
            });
        } else {
            const option = document.createElement('option');
            option.textContent = "Không có mã giảm giá nào";
            selectEl.appendChild(option);
            selectEl.disabled = true;
        }
    } catch (err) {
        console.error("Lỗi tải voucher:", err);
    }
}

// --- HÀM 3: XỬ LÝ ÁP DỤNG VOUCHER (MỚI - DROP DOWN) ---
async function handleApplyVoucher() {
    const selectEl = document.getElementById('voucher-select');
    const msgEl = document.getElementById('voucher-message');
    const btn = document.getElementById('apply-voucher-btn');
    
    // Nếu nút đang là "Hủy", reset lại
    if (btn.textContent === "Hủy") {
        currentDiscount = 0;
        currentVoucherCode = null;
        updateTotalDisplay(originalTotalAmount);
        
        selectEl.disabled = false;
        selectEl.value = "";
        btn.textContent = "Áp dụng";
        msgEl.textContent = "";
        document.getElementById('discount-row').style.display = 'none';
        return;
    }

    const code = selectEl.value; 

    if (!code) {
        msgEl.textContent = "Vui lòng chọn một mã giảm giá.";
        msgEl.style.color = '#ff5555';
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/vouchers/check.php?code=${code}`);
        const data = await res.json();

        if (data.valid) {
            msgEl.textContent = `${data.message}`;
            msgEl.style.color = '#4caf50'; // Màu xanh
            currentVoucherCode = code;
            
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
            
            // Khóa ô chọn và đổi nút thành Hủy
            selectEl.disabled = true;
            btn.textContent = "Hủy";

        } else {
            msgEl.textContent = data.message;
            msgEl.style.color = '#ff5555';
            currentDiscount = 0;
            updateTotalDisplay(originalTotalAmount);
        }
    } catch (err) {
        console.error(err);
    }
}

// --- HÀM 4: CẬP NHẬT HIỂN THỊ TỔNG TIỀN ---
function updateTotalDisplay(amount) {
    document.getElementById('summary-final-total').textContent = amount.toLocaleString('vi-VN') + " VND";
}

// --- HÀM 5: XỬ LÝ THANH TOÁN ---
async function processRealPayment() {
    const btn = document.getElementById('confirm-payment');
    const dataString = sessionStorage.getItem('bookingDetails');
    if (!dataString) return;

    let bookingData = JSON.parse(dataString);
    const finalAmount = Math.max(0, originalTotalAmount - currentDiscount);

    // Payload gửi lên server
    const payload = {
        showtime_id: bookingData.showtime_id,
        seats: bookingData.seat_ids,
        seat_labels: bookingData.seat_labels, 
        
        customer_name: bookingData.customer_name || document.getElementById('card-name')?.value || "Khách hàng",
        customer_phone: bookingData.customer_phone || "",
        total_amount: finalAmount,
        voucher_code: currentVoucherCode || null,
        discount_amount: currentDiscount || 0
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

// --- HÀM BỔ TRỢ: TAB ---
function setupPaymentTabs() {
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