# Project Singularity — Dev Log (May 1, 2026)

## 🚀 Architectural & Data Pipeline Upgrades

Hôm nay, hệ thống thu thập dữ liệu và lõi vật lý của dự án đã được nâng cấp lên một tầm cao mới, hướng tới sự ổn định 24/7 và chất lượng dữ liệu chuẩn nghiên cứu (Data Science).

1. **Autonomous 24/7 Data Collector (Google Apps Script v3.1):**
   - Đã viết lại toàn bộ hệ thống thu thập dữ liệu chạy trên máy chủ Google (Serverless), đảm bảo hệ thống hoạt động không ngừng nghỉ ngay cả khi tắt PC.
   - **Smart Backfill:** Tích hợp cơ chế tự động phát hiện khoảng trống dữ liệu (gap) và gọi API lịch sử để bù đắp, đảm bảo chuỗi thời gian (time-series) luôn liền mạch.
   - **Decoupled Sensor Ingestion:** Luồng dữ liệu thời tiết (Open-Meteo/7Timer) và luồng dữ liệu cảm biến thực tế (từ ESP32 tải lên Drive) được tách biệt độc lập. Sẵn sàng chống chịu lỗi nếu phần cứng gặp sự cố (mất điện, mưa bão).

2. **Comprehensive 45-Parameter Dataset (`catalog.csv` & Sheets):**
   - Nâng cấp số lượng trường dữ liệu thu thập lên 45 cột.
   - Tích hợp thêm dữ liệu phân tầng khí quyển 3D (Nhiệt độ, Tốc độ gió, Hướng gió tại các tầng 1000hPa - 300hPa).
   - Tự động quy đổi và ước tính **Bortle Class** từ chỉ số SQM (Sky Quality Meter) cho các điểm quan sát.

## 🎨 Trải Nghiệm Người Dùng (UX/UI) & Frontend Refactoring

Giao diện React/Vite cũ đã được "đập đi xây lại" hoàn toàn, chuyển mình từ một bảng điều khiển thô cứng thành một ứng dụng quan trắc thiên văn cao cấp (Premium Astronomy-Native App).

1. **Astronomy-Native "Red Vision" Mode:**
   - Triển khai chế độ nhìn ban đêm thực thụ bằng CSS Filters cấp thấp (`sepia`, `hue-rotate`, `saturate`), biến toàn bộ UI thành dải màu đỏ/đen, bảo vệ tối đa khả năng thích ứng bóng tối (dark adaptation) của mắt khi ở ngoài thực địa.

2. **Progressive Disclosure Architecture (3-Layer Concept):**
   - **Layer 1 (Hero Dashboard):** Quyết định Go/No-Go trong 3 giây với các số liệu cốt lõi (Score, Seeing, Dew Risk).
   - **Layer 2 (5-Day Horizon):** Trình diễn đồ thị thanh tương tác hiển thị cửa sổ quan sát tốt nhất và thời điểm thiên thể lên cao nhất (Transit).
   - **Layer 3 (Deep Nerd Stats):** Khu vực gỡ lỗi vật lý được thiết kế lại với các dải băng khí quyển trực quan và dữ liệu nguyên thủy (Raw Telemetry) chi tiết cho các nhà thiên văn chuyên sâu.

3. **Modernization & Polishing:**
   - Thay thế các bảng biểu dày đặc bằng **Framer Motion** transitions, biểu đồ **Recharts** mượt mà, và hệ thống typography (Inter + Roboto Mono) mang hơi hướng thiết bị hàng không vũ trụ.
   - **Site Planner** được thiết kế lại thành dạng thẻ chiến thuật (Tactical Cards) với hệ thống màu chuẩn Bortle IDA và hỗ trợ thêm các điểm quan sát bí mật (Custom Spots) lưu tại LocalStorage.
   - **Gear Diagnostics** được thu gọn thành một công cụ nội dòng (Inline Toolbar) thanh lịch.

---

## 🎯 Đề Xuất 3 Công Việc Tiếp Theo (Next Steps)

Dựa trên nền tảng vững chắc hiện tại, dưới đây là 3 hướng đi chiến lược tiếp theo để đưa Project Singularity lên mức độ hoàn thiện cuối cùng:

**1. Data Science & Model Fine-Tuning (Hiệu chỉnh thuật toán V-Model)**
   - *Hành động:* Thu thập dữ liệu thực tế từ ESP32 trong 1-2 tuần. Dùng Python (Pandas/Scikit-learn) để join (gộp) bảng `raw_sensor` và `raw_data`. 
   - *Mục tiêu:* So sánh điểm số dự đoán của V-Model với dữ liệu SQM và mây thực tế đo được từ cảm biến để tìm ra sai số, từ đó hiệu chỉnh lại trọng số (weights) của lõi vật lý.

**2. Triển khai Alert/Notification System (Hệ thống Cảnh báo sớm)**
   - *Hành động:* Thêm một module nhỏ vào Google Apps Script hoặc Python Backend để quét dữ liệu dự báo mỗi sáng.
   - *Mục tiêu:* Nếu phát hiện có một đêm "Clear Sky" (Score >= 7) tại điểm quan sát Priority, hệ thống sẽ tự động bắn tin nhắn qua Telegram Bot hoặc Discord để bạn chủ động sạc pin thiết bị và chuẩn bị kính thiên văn.

**3. Nâng cấp Frontend thành Progressive Web App (PWA)**
   - *Hành động:* Cấu hình `vite-plugin-pwa` và file `manifest.json` cho giao diện React hiện tại.
   - *Mục tiêu:* Cho phép bạn "cài đặt" ứng dụng này lên màn hình chính của điện thoại (iOS/Android) như một app thực thụ. Quan trọng nhất là tính năng Service Worker sẽ giúp lưu bộ nhớ đệm (cache), cho phép bạn xem lại bản dự báo ngay cả khi ra đến bãi quan sát mà bị mất sóng 4G.
