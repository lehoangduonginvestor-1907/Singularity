# PROJECT SINGULARITY
**Global Astro-Physics Forecast Engine**

## 1. TỔNG QUAN (OVERVIEW)
Project Singularity là một hệ sinh thái phần mềm toàn diện (Full-stack Ecosystem) được thiết kế để dự báo các điều kiện khí quyển và môi trường vi mô phục vụ cho quan sát thiên văn. Bằng cách kết hợp giữa các nguyên lý Vật lý Khí quyển phức tạp (Atmospheric Physics) và Học máy (Machine Learning), Singularity cho phép tính toán chính xác mức độ nhiễu loạn khí quyển (Seeing), độ trong suốt (Transparency), và độ sáng bầu trời (Sky Quality) tại bất kỳ tọa độ nào trên Trái Đất.

---

## 2. LÕI VẬT LÝ VÀ THUẬT TOÁN (PHYSICS ENGINE v3.1)
Thay vì phụ thuộc hoàn toàn vào các mô hình thời tiết hộp đen (Black-box API), Singularity sở hữu một Lõi Vật lý (Physics Core) mạnh mẽ để tự tổng hợp các tham số từ dữ liệu thô:

### 2.1. Nhiệt động lực học (Thermodynamics)
* **Mô hình Magnus-Tetens:** Tính toán chính xác Điểm sương (Dew Point) dựa trên Nhiệt độ bề mặt và Độ ẩm tương đối. 
* **Tản nhiệt bức xạ (Radiative Cooling):** Ước tính mức độ giảm nhiệt của vật kính (Telescope Lens) so với môi trường dựa trên lượng mây bao phủ (Cloud Cover), từ đó cảnh báo rủi ro đọng sương (Dew Risk).

### 2.2. Tán xạ ánh sáng (Scattering)
* **Tán xạ Rayleigh:** Tính toán suy giảm ánh sáng qua các tầng khí quyển dựa trên Áp suất bề mặt.
* **Tán xạ Mie:** Mô phỏng sự hấp thụ của hạt lơ lửng (Aerosols) thông qua Chỉ số chất lượng không khí (AQI) và mức độ bão hòa hơi nước.
* **Định luật Beer-Lambert:** Tổng hợp hệ số nội suy suy giảm (Extinction Coefficient) để đưa ra thang điểm Độ trong suốt (Transparency) chính xác.

### 2.3. Nhiễu loạn khí quyển (Turbulence & Seeing)
* **Phương trình Hypsometric:** Xây dựng mô hình cột độ cao giả định từ dữ liệu áp suất và nhiệt độ tại 5 tầng khí quyển (1000hPa, 850hPa, 700hPa, 500hPa, 300hPa).
* **Mô hình Hufnagel-Valley (HV57):** Tính toán chỉ số cấu trúc chiết suất $C_n^2$ dọc theo cột không khí dựa trên sự cắt kéo của gió (Wind Shear) tại tầng Jet Stream (300hPa) và đối lưu bề mặt. Tích phân toàn bộ cột không khí để suy ra bán kính Fried ($r_0$) và quy đổi thành chỉ số Seeing (đơn vị arcseconds).

### 2.4. Hình phạt Ánh trăng (Lunar Penalty - Krisciunas-Schaefer)
* Tính toán tọa độ và góc pha Mặt Trăng theo thuật toán Ephemeris tiêu chuẩn.
* Sử dụng mô hình Krisciunas-Schaefer để giả lập mức độ ô nhiễm ánh sáng do Mặt Trăng gây ra (SQM - Sky Quality Meter), tính toán sự suy giảm độ tương phản của các vật thể Deep Sky (DSO) dựa trên góc cách góc (Angular Separation).

---

## 3. THUẬT TOÁN HỌC MÁY (AI / MACHINE LEARNING ARCHITECTURE)
**Chiến lược ML lai (Hybrid ML Strategy):**
Hệ thống không dùng AI thay thế Lõi Vật lý, mà sử dụng kiến trúc AI kết hợp:
* **Physics-Informed XGBoost:** Dùng XGBoost để học phần "Sai số" (Residuals) giữa kết quả của Lõi Vật lý và thực tế tại các vùng vi khí hậu. Cây quyết định (Gradient Boosting) được ưu tiên vì tính chất giải thích được (Explainable AI) và hiệu năng cực cao với tabular data.
* **LSTM (Long Short-Term Memory):** Nắm bắt tính chu kỳ và xu hướng thời gian (Temporal dependencies) trong việc tụt/tăng nhiệt độ và áp suất qua đêm.
* **Reinforcement Learning (RL):** Dự kiến áp dụng riêng cho thuật toán Gợi ý Mục tiêu (Target Recommendation), học thói quen quan sát của người dùng.

---

## 4. DATA PIPELINES VÀ TÍCH HỢP API
* **Open-Meteo API:** Đóng vai trò cung cấp Raw Data toàn cầu với độ phân giải cao (Grid Data). Lấy dữ liệu bề mặt (Surface) và Dữ liệu Cắt lớp (Profile) tại 5 tầng áp suất.
* **7Timer API (Benchmark):** Dùng làm hệ quy chiếu (Ground Truth / Benchmark). Hệ thống tự động so sánh Score của Lõi Singularity với mô hình ASTRO của 7Timer để đánh giá sai số.
* **OpenStreetMap (Nominatim):** API Geocoding (Forward/Reverse) tích hợp trong thanh tìm kiếm để phân tích chuỗi ký tự thành tọa độ GPS (Latitude/Longitude).
* **Google Apps Script & Sheets:** Vai trò là một "Data Lake" mini. Tự động thu thập dữ liệu 24/7 (Data Collector) và đồng bộ file log (Sensor CSV) từ ESP32 trên Google Drive. Có cơ chế tự động bù đắp (Backfill) khi hệ thống gián đoạn.

---

## 5. KIẾN TRÚC PHẦN MỀM (FULL-STACK ARCHITECTURE)
Dự án áp dụng mô hình phân tách Frontend/Backend hiện đại và dễ bảo trì:

### 5.1. Backend (Python / FastAPI)
* Đảm nhận toàn bộ trọng trách xử lý toán học (Math-heavy).
* Tổ chức thành các module lõi `physics/` (Thermodynamics, Scattering, Turbulence) rành mạch.
* Sinh ra các Endpoints API tốc độ cao, xử lý Concurrent requests mượt mà.

### 5.2. Frontend (Vite + React + Tailwind CSS)
* **Giao diện (UI/UX):** Phong cách Dark Futuristic Nebula (Glassmorphism, Flat Cards, Neon Accents) kết hợp thư viện biểu đồ Recharts và Framer Motion.
* **Responsive:** Hoạt động hoàn hảo trên cả Desktop và Mobile. Tối ưu UX với các thành phần Progressive Disclosure (Debug Console, Visibility Window).

### 5.3. Triển khai (Deployment)
* **Phiên bản & Lưu trữ:** Được quản lý phiên bản qua Git và lưu trữ mã nguồn mở trên GitHub.
* **CI/CD:** Có khả năng tự động hóa quy trình deploy. Frontend có thể render qua Vercel hoặc Netlify, trong khi Backend API (Python) có thể host qua Render, Heroku hoặc AWS EC2. Tương tác với nhau hoàn toàn qua các biến môi trường (Environment Variables) cực kỳ bảo mật.

---
**Project Singularity** không chỉ là một website xem thời tiết, nó là một cỗ máy nghiên cứu khí quyển thu nhỏ được tinh chỉnh cho độ chính xác cực đoan.