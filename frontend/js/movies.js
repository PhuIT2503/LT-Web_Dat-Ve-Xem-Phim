document.addEventListener('DOMContentLoaded', () => {
    initializeMoviesPage();
});

async function initializeMoviesPage() {
    try {
        await Promise.all([
            loadComponent('#header-placeholder', 'components/header.html'),
            loadComponent('#footer-placeholder', 'components/footer.html'),
            loadComponent('#modal-placeholder', 'components/modal-trailer.html')
        ]);

        addHeaderScrollEffect();
        setupModalListeners();
        setupHeaderSearchListeners();
        setupUserMenuListeners();
        renderSearchResults();

    } catch (err) {
        console.error('Lỗi khởi tạo trang movies:', err);
    }
}

async function renderSearchResults() {
    try {
        const params = new URLSearchParams(window.location.search);
        const q = (params.get('q') || '').trim().toLowerCase();

        // Tải template
        const resp = await fetch('components/movie-card.html');
        if (!resp.ok) throw new Error('Không thể tải template movie-card');
        const cardTemplate = await resp.text();

        // Gộp tất cả phim
        const allMovies = [mockData.banner, ...mockData.newMovies, ...mockData.trendingMovies];

        const filtered = q === '' ? allMovies : allMovies.filter(m => (m.title || '').toLowerCase().includes(q));

        const container = document.getElementById('movies-results');
        const title = document.getElementById('results-title');

        if (!container) return;

        if (q) {
            title.textContent = `Kết quả tìm kiếm cho "${q}"`;
        } else {
            title.textContent = 'Tất cả phim';
        }

        if (filtered.length === 0) {
            container.innerHTML = '<p>Không tìm thấy kết quả.</p>';
            return;
        }

        let html = '';
        filtered.forEach(m => {
            html += cardTemplate
                .replace(/{id}/g, m.id)
                .replace(/{trailerUrl}/g, m.trailerUrl || '')
                .replace(/{imageUrl}/g, m.imageUrl || '')
                .replace(/{title}/g, m.title || '')
                .replace(/{year}/g, m.year || '');
        });

        container.innerHTML = html;
    } catch (err) {
        console.error('Lỗi khi render kết quả tìm kiếm:', err);
    }
}

// Copy helper functions from main.js/movie-detail.js to reuse
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
        console.warn('Không tìm thấy các thành phần của Modal.');
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

function setupUserMenuListeners() {
    const btn = document.getElementById('user-menu-btn');
    const dropdown = document.getElementById('user-dropdown');

    if (!btn || !dropdown) {
        console.warn('Không tìm thấy các thành phần của User Menu.');
        return;
    }

    // Bật/tắt khi click vào nút
    btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Ngăn sự kiện click nổi bọt lên window
        dropdown.classList.toggle('active');
    });

    // Tắt khi click ra ngoài (click vào window)
    window.addEventListener('click', (e) => {
        if (dropdown.classList.contains('active')) {
            // Chỉ đóng nếu click ra ngoài cả nút và cả dropdown
            if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        }
    });
}
