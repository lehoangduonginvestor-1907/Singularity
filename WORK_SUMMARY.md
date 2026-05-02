# BÁO CÁO CÔNG VIỆC TRONG NGÀY (WORK SUMMARY)
**Ngày thực hiện:** 01/05/2026
**Dự án:** Project Singularity
**Vai trò:** Senior Frontend Developer & Technical Architect

---

## 1. GIAI ĐOẠN 1: TÁI THIẾT KẾ GIAO DIỆN (UI REDESIGN) DỰA THEO ẢNH 2
**Mục tiêu:** Chuyển đổi giao diện Dashboard (Target Explorer) từ kính mờ (glassmorphism) sang thiết kế phẳng (flat design), tối màu, chống chói.

* **Typography:** Tích hợp thành công font chữ `Plus Jakarta Sans` (thay thế cho Google Sans) làm font `sans-serif` mặc định của toàn bộ dự án, kết hợp `Roboto Mono` cho các chỉ số kỹ thuật.
* **Metric Cards:**
  * Gỡ bỏ toàn bộ hiệu ứng bóng đổ (box-shadow) và glow.
  * Chuyển nền thẻ thành khối xám đậm (`#171717`) với viền mỏng tinh tế (`#2a2a2a`).
  * Tích hợp Icon vào các thẻ (Globe, Eye, Sparkles, Target) để tối ưu trực quan.
* **Target Explorer (Biểu đồ):**
  * Giữ lại phong cách đổ màu (Area fill) của biểu đồ dự báo (Physics Score & Benchmark Score).
  * Xóa bỏ ảnh nền bản đồ sao ẩn dưới đồ thị, làm sạch khu vực hiển thị data để tăng độ đọc (readability).
  * Đơn giản hóa Dropdown chọn mục tiêu thành dạng phẳng (`#222`).
* **Header Controls:** Nhóm toàn bộ các nút điều khiển (EN/VI, Red Vision, Tọa độ GPS, SYNC) vào một khối Pill-shaped thống nhất, loại bỏ hoàn toàn các nút phát sáng chói lóa.

---

## 2. GIAI ĐOẠN 2: TÁI THIẾT KẾ TRANG ĐÍCH (LANDING PAGE) DỰA THEO ẢNH 1
**Mục tiêu:** Tái tạo chính xác trang Landing theo phong cách Futuristic Nebula từ file `Anh1.png`.

* **Quyết định Kiến trúc:** Giữ nguyên hệ sinh thái đang chạy cực kỳ ổn định là **Vite + React** (gắn liền với FastAPI backend), từ chối đập bỏ để dựng Next.js nhằm tránh làm "gãy" toàn bộ hệ thống.
* **Background & Layout:** 
  * Áp dụng `Anh1.png` làm ảnh nền cover toàn màn hình (fullscreen).
  * Setup Typography chính cho tiêu đề "PROJECT SINGULARITY" được bẻ thành 2 dòng, ép hiệu ứng Neon Cyan Glow nổi bật trên nền vũ trụ.
* **Glassmorphism Navbar:** Code thanh Header trên cùng bám sát nguyên gốc (Logo tam giác, chữ trong suốt, nút Red Vision "OFF" bo tròn dạng viên thuốc).
* **Target Locator (Khung tìm kiếm):** 
  * Sử dụng Glassmorphism (`bg-white/5 backdrop-blur-md`) xen kẽ viền Cyan.
  * Bổ sung dải phân cách và nút "LOCK" kèm Icon ổ khóa, hover state mượt mà, phản hồi tốt trên mobile.
* **Version Control:** Đã tự động commit và Push toàn bộ source code nâng cấp lên nhánh `main` của kho lưu trữ GitHub.

---

## 3. GIAI ĐOẠN 3: FIX BUG HỆ THỐNG DATA COLLECTOR (GOOGLE APPS SCRIPT)
**Mục tiêu:** Điều tra nguyên nhân script đồng bộ dữ liệu vào Google Sheets bị "chết đứng" từ mốc 9h sáng.

* **Phát hiện (Root Cause):** Cột `timestamp_utc` lưu thời gian là `"2026-05-01 02:00"` (không chứa ký tự `Z`). Google Sheets và môi trường V8 của Apps Script tự động dịch sai mốc giờ này thành Giờ VN (GMT+7) thay vì UTC gốc, làm tính toán thời gian `startTs` bị lùi về quá khứ và văng khỏi vùng cần fetch data mới.
* **Giải pháp:** 
  1. Cập nhật hàm `_getLastTimestamp` sử dụng `getDisplayValue()` thay vì `getValue()` để tránh Sheets tự ép kiểu Object Date sai lệch.
  2. Ép chuỗi String thành định dạng chuẩn ISO 8601 UTC (thêm chữ `T` và `:00Z`) trước khi parse thành `Date()`.
* Hệ thống hiện đã hoạt động hoàn hảo, sẵn sàng thu thập và backfill dữ liệu 24/7.

---

## 4. GIAI ĐOẠN 4: ĐỊNH HƯỚNG KIẾN TRÚC AI (STRATEGIC ADVISORY)
**Mục tiêu:** Tư vấn xử lý tình trạng đói dữ liệu và đánh giá lựa chọn giữa Transformer + RL vs XGBoost/LSTM.

* **Giải quyết bài toán Dữ liệu (Data Pipeline):**
  * Tận dụng API từ các Đài Thiên Văn lớn kết hợp ERA5 Reanalysis.
  * Xây dựng mạng lưới Sensor IoT (ESP32 Mesh Network) cung cấp cho cộng đồng.
  * Khai thác ảnh mây vệ tinh (Satellite Imagery) để downscaling số liệu.
* **Lựa chọn Kiến trúc AI:** Phân tích bẫy "ảo giác" (hallucination) của Transformer khi áp dụng cho dữ liệu mảng thời tiết ngắn. Khuyến nghị sử dụng **Lõi Vật Lý + XGBoost** để học phần sai số (residuals), kết hợp LSTM cho dải thời gian. Chỉ dùng RL cho bài toán Recommendation (gợi ý mục tiêu), tuyệt đối không dùng RL để tinh chỉnh thông số vật lý cốt lõi.
