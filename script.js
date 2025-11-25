// Khai báo các thành phần HTML cần thiết
const imageUpload = document.getElementById('imageUpload');
const mangaCanvas = document.getElementById('mangaCanvas');
const ctx = mangaCanvas.getContext('2d');
const processingMessage = document.querySelector('p'); // Dòng "Đang xử lý..."

// Ẩn dòng "Đang xử lý..." ban đầu
processingMessage.style.display = 'none';

// Lắng nghe sự kiện khi người dùng chọn file
imageUpload.addEventListener('change', async function() {
    // Nếu không có file, thoát
    if (!this.files || this.files.length === 0) return;

    const file = this.files[0];
    
    // Hiển thị dòng đang xử lý
    processingMessage.style.display = 'block';
    
    // Tạo đối tượng FileReader để đọc file
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = async function() {
            // 1. Thiết lập kích thước Canvas bằng kích thước ảnh
            mangaCanvas.width = img.width;
            mangaCanvas.height = img.height;

            // 2. Vẽ ảnh lên Canvas
            ctx.drawImage(img, 0, 0);

            // 3. Khởi tạo Tesseract và chạy OCR
            const worker = await Tesseract.createWorker({
                // Dùng log để mày xem tiến trình trong Console (Developer Tools)
                logger: m => console.log(m) 
            });

            // Set ngôn ngữ nhận dạng là Tiếng Nhật (Jap)
            await worker.loadLanguage('jpn');
            await worker.initialize('jpn');

            // 4. Chạy nhận dạng chữ viết trên Canvas
            const { data: { text } } = await worker.recognize(mangaCanvas);
            
            // 5. Kết thúc worker (rất quan trọng để giải phóng bộ nhớ)
            await worker.terminate();
            
            // 6. Ẩn dòng đang xử lý và hiển thị kết quả
            processingMessage.style.display = 'none';
            
            // Tạm thời, tao chỉ alert kết quả để mày kiểm tra
            alert("Kết quả OCR (Tiếng Nhật) là: \n\n" + text);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});