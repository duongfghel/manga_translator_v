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
    if (tesseractWorker) return tesseractWorker; // Nếu đã có worker, dùng lại

    updateStatus("Đang khởi tạo Worker OCR...");
    
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
}


// Lắng nghe sự kiện khi người dùng chọn file
imageUpload.addEventListener('change', async function() {
    if (!this.files || this.files.length === 0) return;

    const file = this.files[0];
    
    // Bắt đầu xử lý
    updateStatus("Đang đọc tệp tin...");
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = async function() {
            // 1. Vẽ ảnh lên Canvas
            mangaCanvas.width = img.width;
            mangaCanvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // 2. Khởi tạo Worker và chạy OCR
            try {
                const worker = await initializeWorker();
                
                updateStatus("Bắt đầu nhận dạng chữ viết...");
                const { data: { text } } = await worker.recognize(mangaCanvas);
                
                // Không terminate worker nữa để lần sau chạy nhanh hơn
                
                processingMessage.style.display = 'none';
                
                // Hiển thị kết quả
                alert("Kết quả OCR (Tiếng Anh) là: \n\n" + text);

            } catch (error) {
                // Báo lỗi nếu Tesseract bị đứng hoặc lỗi mạng
                updateStatus("LỖI KHỦNG KHIẾP: " + error.message);
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});
