# KẾ HOẠCH PHÁT TRIỂN DỰ ÁN: INTERSTELLAR WEB (MEGA-PROJECT)

## 1. TỔNG QUAN
- **Mục tiêu:** Xây dựng nền tảng thiên văn học toàn diện, tích hợp mô hình dự báo thời tiết thiên văn riêng (Sử dụng XGBoost) vượt trội so với các giải pháp hiện tại như 7Timer!.
- **Thời gian:** 5 tháng.
- **Nhân sự:**
  - **Người Lý (P):** Chuyên gia vật lý & xử lý dữ liệu thiên văn.
  - **Người Tin (S):** Chuyên gia hệ thống & kiến trúc phần mềm.
  - **AI (Gemini & Claude):** Hỗ trợ code, debug, documentation, và phân tích dữ liệu.

---

## 2. LỘ TRÌNH THỰC HIỆN (5 THÁNG)

### Tháng 1: Kiến trúc cốt lõi & Xây dựng Data Pipeline
- **Người Lý (P):**
  - Chuẩn hóa các công thức vật lý trong `physics/`.
  - Thiết kế cấu trúc dữ liệu đầu vào cho mô hình XGBoost.
- **Người Tin (S):**
  - Xây dựng API Gateway bằng FastAPI.
  - Thiết lập môi trường Docker, CI/CD pipeline cơ bản.
- **AI (Gemini & Claude):**
  - Viết Unit Test cho `physics/`.
  - Tạo cấu trúc folder và generate các boilerplate code.

### Tháng 2: Tích hợp Dữ liệu & Ingestion
- **Người Lý (P):**
  - Thu thập dữ liệu lịch sử thời tiết & dữ liệu ô nhiễm ánh sáng (Light Pollution Map).
  - Gán nhãn dữ liệu cho việc training XGBoost.
- **Người Tin (S):**
  - Tối ưu hóa Database (PostgreSQL/Redis) để cache dữ liệu thời gian thực.
  - Xây dựng service `ingestion` mạnh mẽ, tự động hóa fetch dữ liệu từ bên thứ 3.
- **AI:**
  - Viết script tự động kiểm tra tính toàn vẹn của dữ liệu (Data Validation).

### Tháng 3: Huấn luyện XGBoost & Mô phỏng Vật lý
- **Người Lý (P):**
  - Train mô hình XGBoost. Tinh chỉnh hyperparameter để vượt qua baseline của 7Timer!.
  - Kiểm định kết quả mô hình so với thực tế.
- **Người Tin (S):**
  - Tích hợp mô hình (model serving) vào backend.
  - Xây dựng API endpoint để client truy vấn dự báo thời tiết thiên văn.
- **AI:**
  - Hỗ trợ tối ưu hóa tham số cho XGBoost.
  - Theo dõi quá trình training qua log.

### Tháng 4: Visualization Engine (Stellarium-like)
- **Người Lý (P):**
  - Cung cấp logic thiên văn (tọa độ sao, pha trăng) để render bầu trời.
- **Người Tin (S):**
  - Sử dụng Three.js/WebGL để xây dựng dashboard 3D mô phỏng bầu trời.
  - Kết nối dữ liệu thời gian thực từ Backend lên Frontend thông qua WebSocket.
- **AI:**
  - Viết code cho các thành phần UI phức tạp (GearPanel, VisibilityWindow).
  - Debug các vấn đề về hiệu năng khi render trên trình duyệt.

### Tháng 5: Tối ưu, Bảo mật & Vận hành
- **Người Lý (P):**
  - Fine-tuning lần cuối cho mô hình XGBoost dựa trên phản hồi người dùng.
- **Người Tin (S):**
  - Stress test hệ thống.
  - Triển khai bảo mật, backup định kỳ.
- **AI:**
  - Đóng gói tài liệu `README.md` cuối cùng.
  - Tổng kết báo cáo dự án.

---

## 3. PHÂN BỔ NHIỆM VỤ AI
- **Gemini:** Chuyên trách về **Coding & Infrastructure**. Đảm nhận việc viết code mới, tối ưu hóa hệ thống, viết script tự động hóa và test.
- **Claude:** Chuyên trách về **System Design & Analysis**. Đảm nhận việc review kiến trúc, phân tích logic vật lý, soạn thảo tài liệu (docs) và phản biện chiến lược.

---

## 4. CHIẾN LƯỢC VƯỢT XA 7TIMER!
1. **Dữ liệu cục bộ:** Kết hợp dữ liệu vệ tinh toàn cầu với các trạm đo tại chỗ (nếu có).
2. **XGBoost Hyper-specialization:** Train mô hình chuyên biệt cho từng vùng địa lý thay vì mô hình dùng chung.
3. **Độ trễ thấp:** Kiến trúc API hướng sự kiện (Event-driven) cho phép cập nhật thông số thiên văn tức thì.
4. **Tích hợp UX:** Khác với 7Timer! chỉ hiển thị bảng, chúng ta sẽ có **Visualization 3D** giúp người dùng trực quan hóa khả năng quan sát thay vì chỉ đọc số liệu.

---
*Ghi chú: Bản kế hoạch này cần được duyệt bởi "Hội đồng" định kỳ mỗi cuối tuần để điều chỉnh kịp thời.*
