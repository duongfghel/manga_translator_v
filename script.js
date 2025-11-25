// Khai báo các thành phần HTML cần thiết
const imageUpload = document.getElementById('imageUpload');
const mangaCanvas = document.getElementById('mangaCanvas');
const ctx = mangaCanvas.getContext('2d');
const processingMessage = document.querySelector('p');

// Hàm logger mới để cập nhật tiến trình ra màn hình
function updateStatus(message) {
    processingMessage.style.display = 'block';
    processingMessage.textContent = "V đang làm việc: " + message;
}

// Ẩn dòng "Đang xử lý..." ban đầu
processingMessage.style.display = 'none';

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
            mangaCanvas.style.border = '2px solid red';

            // 2. Chạy OCR bằng phương pháp đơn giản (không dùng Worker)
            try {
                updateStatus("SẴN SÀNG OCR: Bắt đầu tải Tiếng Việt...");
                 // Dùng Tesseract.recognize() trực tiếp
                const { data: { text } } = await Tesseract.recognize(
                    mangaCanvas,
                    'vie', // Ngôn ngữ Tiếng Việt 
                    { 
                        logger: m => {
                            if (m.status === 'recognizing') {
                                updateStatus(`Đang nhận dạng... (${Math.round(m.progress * 100)}%)`);
                            } else if (m.status === 'loading language traineddata') {
                                updateStatus(`Đang tải Tiếng Việt... (${Math.round(m.progress * 100)}%)`);
                            } else {
                                updateStatus(m.status);
                            }
                        },
                        // Tùy chọn Pre-processing
                        tessedit_pageseg_mode: 3,
                        tessedit_char_whitelist: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZáàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸἴĐ' 
                    }
                );                
                processingMessage.style.display = 'none';
                
                // Hiển thị kết quả
                alert("KẾT QUẢ OCR (TIẾNG VIỆT) LÀ: \n\n" + text);
               

            } catch (error) {
                // Báo lỗi nếu Tesseract bị đứng hoặc lỗi mạng
                updateStatus("LỖI KHỦNG KHIẾP: " + error.message);
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});






