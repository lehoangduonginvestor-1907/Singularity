# Kế Hoạch Train XGBoost — Project Singularity
> Senior ML Engineer perspective | Astronomy-aware | Cập nhật: 2026-05-09

---

## 1. Mục Tiêu

**Không phải:** Thay thế physics engine bằng black-box ML.  
**Mà là:** Dùng XGBoost làm **lớp hiệu chỉnh** (correction layer) học bias hệ thống giữa physics engine và thực tế.

```
NWP Data (OpenMeteo)
       │
       ▼
 Physics Engine ──────────────────────┐
 (HV57 + Tatarski + K-S + Beer-Lambert)│
       │                              │
       │ physics_prediction           │ features
       ▼                              │
   XGBoost ◄─────────────────────────┘
   (learns residual bias)
       │
       │ corrected_prediction
       ▼
   Output tốt hơn
```

**Lý do chọn kiến trúc hybrid này:**
- Physics engine có nền tảng vật lý đúng — chỉ bị giới hạn bởi độ phân giải của NWP.
- XGBoost học phần residual (sai số hệ thống) mà physics không thể mô hình hóa.
- Khi không có sensor → vẫn có thể dùng physics. Khi có đủ data → XGBoost tăng độ chính xác.
- Interpretable: có thể xem feature importance để hiểu *tại sao* model sai và cải thiện physics engine.

---

## 2. Những Thứ Đã Có ✅

### 2.1 Data thu thập (catalog.csv — hiện ~75 rows)

| Nhóm | Cột | Vai trò trong ML |
|---|---|---|
| **NWP Inputs** | `atmos_*hpa_temp_c`, `atmos_*hpa_wind_ms` (5 tầng) | Features thô từ khí quyển (GFS, v.v.) |
| **NWP Inputs** | `surf_temp_c`, `surf_rh_pct`, `surf_pressure_hpa`, `surf_cloud_cover_pct`, `surf_aqi` | Features thô bề mặt |
| **Ephemeris** | `moon_phase_deg`, `moon_alt_deg` | Lunar penalty context |
| **Physics predictions** | `seeing_arcsec`, `transparency`, `sqm_mag_arcsec2` | **Features quan trọng nhất** (physics prior) |
| **Scores** | `seeing_score_10`, `transparency_score_10`, `v_model_10` | Derived features |
| **Benchmark** | `bench_seeing_raw`, `bench_trans_raw`, `bench_v_model` | Feature so sánh độc lập |
| **Flags** | `delta_t_dew_c`, `dew_danger` | Constraints |

### 2.2 Google Apps Script (v4.0)

Đã có ensemble data từ 3 NWP models:
- Lấy `ens_*hpa_temp_c`, `ens_*hpa_wind_ms` — weighted average (GFS 30% + ECMWF 40% + ICON 30%)
- Lấy gió tại 300hPa của từng model để làm `jet_spread_ms` và `ensemble_confidence` đánh giá mức độ tin cậy.

### 2.3 Lõi Physics Engine (Vật Lý Cốt Lõi)

Output của engine (`seeing_arcsec`, `transparency`, `sqm`) sẽ không phải là target, mà trở thành **features** mạnh nhất cho XGBoost.

---

## 3. Những Thứ Đang Thiếu ❌

### 3.1 ❌ THIẾU NGHIÊM TRỌNG: Ground Truth (Target Variable)

XGBoost cần biết **đáp án đúng** để học. Hiện tại bảng dữ liệu thiếu các nhãn mục tiêu thực tế.

| Cột cần có | Nguồn/Sensor | Tại sao lại thiếu |
|---|---|---|
| `sqm_measured` | **TSL2591** | Đã có code đọc TSL2591 nhưng giá trị đo thực tế chưa được đồng bộ liên tục vào CSV cùng với dữ liệu NWP. |
| `seeing_measured` | Cần DIMM/Camera | Quá đắt đỏ/khó triển khai liên tục cho dự án nghiệp dư. |

> **Giải pháp:** Chỉ train XGBoost để predict/hiệu chỉnh **SQM** trước. Ta sẽ sử dụng `sqm_measured` từ TSL2591 làm target. Seeing có thể giữ nguyên theo physics hoặc phân tích sau.

### 3.2 ❌ Thiếu: Local Sensor Features

NWP data là dự báo lưới rộng (grid 28km). Để có độ chính xác tại 1 điểm, cần dữ liệu thực tế tại mặt đất.

| Cột cần thêm | Nguồn | Thay thế cái gì |
|---|---|---|
| `sensor_temp_c` | BME280 | `surf_temp_c` (NWP) |
| `sensor_rh_pct` | BME280 | `surf_rh_pct` (NWP) |
| `sensor_pressure` | BME280 | `surf_pressure_hpa` (NWP) |
| `sky_ir_temp_c` | **MLX90614** | Rất quan trọng để thay thế `cloud_cover` sai số lớn của NWP. |
| `pm25_ugm3` | PMS5003 | Thay thế AQI bị trễ của OpenMeteo |

### 3.3 ❌ Thiếu: Derived Features (Đặc trưng dẫn xuất)

Tree-based models như XGBoost học cắt ngưỡng trên một giá trị tĩnh (VD: temp > 20), chúng **không tự hiểu gradient** (sự thay đổi) nếu ta không cung cấp. Về mặt vật lý, seeing và turbulence liên quan mật thiết đến gradient:

| Feature | Công thức | Tại sao quan trọng |
|---|---|---|
| `shear_1000_850` | `abs(wind_850 - wind_1000)` | Đứt gãy gió (wind shear) tầng thấp |
| `shear_850_500` | `abs(wind_500 - wind_850)` | Wind shear tầng đối lưu |
| `shear_500_300` | `abs(wind_300 - wind_500)` | Wind shear quanh Jet stream |
| `lapse_rate_*` | `dT / dh` | Độ ổn định nhiệt của các tầng (stability) |

### 3.4 ❌ Thiếu: Time Features

Tính chất mùa vụ (mưa/khô) ở Việt Nam rất rõ, ảnh hưởng lớn đến kết quả.
- Cần extract: `hour_utc` (0-23), `day_of_year` (1-365), `month` (1-12) ra các cột số nguyên riêng biệt để XGBoost học.

---

## 4. XGBoost Hoạt Động Như Thế Nào

### 4.1 Cơ Chế: Gradient Boosted Trees

XGBoost (eXtreme Gradient Boosting) là thuật toán Ensemble. Nó tạo ra một tập hợp các cây quyết định (Decision Trees) **tuần tự**.

```
Tree 1 -> Đoán thử -> Dư phần sai số (Residual)
Tree 2 -> Học cách dự đoán cái sai số của Tree 1
Tree 3 -> Học sai số của Tree 2
...
```

**Ví dụ:**
- Physics engine dự báo SQM = 18.0.
- Thực tế sensor đo là 19.5 (Trời tối hơn dự kiến).
- Sai số là +1.5.
- XGBoost sẽ học rằng: "À, nếu Mây (MLX90614) = ít, Độ ẩm > 90%, và Trăng lặn, thì Physics thường dự đoán thấp hơn thực tế 1.5. Tôi sẽ cộng bù 1.5 vào".

### 4.2 Tại Sao Chọn XGBoost?

1. **Tabular Data:** XGBoost là "vua" của dữ liệu dạng bảng (CSV), vượt trội hơn Deep Learning.
2. **Missing Values:** XGBoost tự động có nhánh rẽ mặc định khi một giá trị (VD: sensor offline) bị thiếu (`NaN`).
3. **Non-linear:** Học được các mối quan hệ phức tạp như `Seeing = f(wind_shear, lapse_rate, RH)`.
4. **Interpretable:** XGBoost cung cấp `Feature Importance` để ta biết nó đang dựa vào biến nào nhiều nhất.

---

## 5. Cách Train XGBoost (Quy Trình Chuẩn)

### Bước 1: Feature Engineering & Xử lý Data
1. Nối (merge) dữ liệu `catalog.csv` (features NWP + Physics) và `sensor_log.csv` (Ground Truth) dựa trên thời gian gần nhất (nearest `timestamp`).
2. Sinh ra các cột tính toán: `wind_shear`, `lapse_rate`, `hour`, `month`.
3. Drop các dòng không có giá trị Target (`sqm_measured` = NaN).

### Bước 2: Time-based Split (CỰC KỲ QUAN TRỌNG)
Trong dữ liệu chuỗi thời gian (time-series), **KHÔNG ĐƯỢC dùng Random Split** (Train_test_split thông thường). Nếu trộn ngẫu nhiên, mô hình sẽ vô tình "nhìn trước" thời tiết tương lai để dự đoán hiện tại (Data Leakage).
- **Cách làm:** Lấy 80% thời gian đầu (VD: Tháng 1-Tháng 8) làm Tập Huấn Luyện (Train). Lấy 20% thời gian sau (Tháng 9-Tháng 10) làm Tập Đánh Giá (Test).

### Bước 3: Training & Hyperparameter Tuning
Thiết lập XGBoost Regressor với Loss function là `RMSE` (Root Mean Squared Error):
```python
model = xgb.XGBRegressor(
    n_estimators=300,        # Tổng số cây
    learning_rate=0.05,      # Tốc độ học (nhỏ thì ổn định)
    max_depth=4,             # Độ sâu cây (hạn chế overfit)
    subsample=0.8,           # Lấy mẫu ngẫu nhiên row
    colsample_bytree=0.8,    # Lấy mẫu ngẫu nhiên column
    early_stopping_rounds=30 # Dừng sớm nếu test không tốt lên
)
model.fit(X_train, y_train, eval_set=[(X_val, y_val)])
```

### Bước 4: So Sánh Base vs ML
1. Lấy độ lệch chuẩn (RMSE) của Physics Engine so với Sensor. (VD: lệch trung bình 0.8 SQM)
2. Lấy độ lệch chuẩn (RMSE) của XGBoost so với Sensor. (Kỳ vọng: lệch trung bình < 0.3 SQM)

---

## 6. Các Lưu Ý và Nguy Cơ (Caveats)

1. **Data Imbalance (Thiếu đa dạng):** Hiện tại đa số row của bạn có thể rơi vào một kiểu thời tiết (VD: toàn mây, độ ẩm cao). Nếu không có data đêm trời quang, XGBoost không thể học được điểm tối đa của SQM.
2. **Cần Bao Nhiêu Dữ Liệu?** XGBoost cần khoảng **10 lần số rows so với số features** để bắt đầu hội tụ. Nếu bạn có 30 features, bạn cần ít nhất **300-500 giờ quan sát CÓ KÈM SENSOR** thì mô hình mới đủ tin cậy. (Lý tưởng là 1000-3000 rows).
3. **Sensor Maintenance:** Cảm biến TSL2591 nếu bị bụi, sương mù đọng bẩn kính sẽ cho kết quả sai, lúc đó Ground Truth sai -> ML học sai ("Garbage In, Garbage Out").

---

## 7. Roadmap Đề Xuất

1. **Tạm Thời Ngay Lúc Này:** Sửa đổi hệ thống để đảm bảo `sqm_measured` từ TSL2591 và dữ liệu thời tiết NWP được lưu chung/khớp timestamp một cách hoàn hảo. 
2. **Tháng Tới:** Gắn thêm MLX90614 (đo mây) và BME280 để có Sensor Local. Bổ sung `wind_shear` vào GAS.
3. **Thu Thập Mùa Hè:** Để hệ thống chạy nền thu thập 3-4 tháng.
4. **Cuối Năm:** Khi có đủ ~1000-2000 điểm dữ liệu, lấy ra Train XGBoost. Tích hợp mô hình đã train (.json / .pkl) vào FastAPI thay thế layer cuối.
