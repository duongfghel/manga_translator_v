// Khai báo các thành phần HTML cần thiết
const imageUpload = document.getElementById('imageUpload');
const mangaCanvas = document.getElementById('mangaCanvas');
const ctx = mangaCanvas.getContext('2d');
const processingMessage = document.querySelector('p');

// Biến toàn cục để lưu trữ Tesseract Worker
let tesseractWorker = null;

// Hàm logger mới để cập nhật tiến trình ra màn hình
function updateStatus(message) {
    processingMessage.style.display = 'block';
    processingMessage.textContent = "V đang làm việc: " + message;
}

// Ẩn dòng "Đang xử lý..." ban đầu
processingMessage.style.display = 'none';

// Hàm khởi tạo Worker (chỉ gọi 1 lần khi cần)
async function initializeWorker() {
    if (tesseractWorker) return tesseractWorker;

    updateStatus("Đang khởi tạo Worker OCR...");
    
    try {
        // TẠO WORKER VÀ TẢI NGÔN NGỮ ENG
        tesseractWorker = await Tesseract.createWorker({
            logger: m => {
                if (m.status === 'recognizing') {
                    updateStatus(`Đang nhận dạng... (${Math.round(m.progress * 100)}%)`);
                } else if (m.status === 'loading language traineddata') {
                    updateStatus(`Đang tải Tiếng Anh... (${Math.round(m.progress * 100)}%)`);
                } else {
                    updateStatus(m.status);
                }
            }
        });

        await tesseractWorker.loadLanguage('eng');
        await tesseractWorker.initialize('eng');
        
        updateStatus("OCR Worker đã sẵn sàng!");
        return tesseractWorker;
    } catch (error) {
        // Bẫy lỗi ngay tại đây
        updateStatus("LỖI KHỞI TẠO: " + error.message);
        return null; // Trả về null nếu có lỗi
    }
}
