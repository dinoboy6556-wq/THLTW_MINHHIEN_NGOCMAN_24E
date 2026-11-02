# Hướng dẫn cài đặt và dùng thử MyShop

## 1. Project cần có

- XAMPP (MySQL), PHP 8.2+, Composer, Node.js/npm.
- Website chạy ở `http://localhost:3000`.
- API Laravel chạy ở `http://127.0.0.1:8000`.
- Database: `thltw_minhhien_ngocman_24e`.

## 2. Cài database

1. Mở XAMPP Control Panel, bấm **Start** ở MySQL.
2. Mở `http://localhost/phpmyadmin`.
3. Chọn **Import / Nhập**, chọn file `doc/code.sql` của project rồi bấm **Thực hiện**.
4. Chỉ nhập vào database mới/rỗng. Nếu đã có dữ liệu, hãy Export sao lưu trước; không nhập file nhiều lần.

## 3. Cấu hình backend lần đầu

Mở PowerShell:

```powershell
cd F:\Code\THLTW_MINHHIEN_NGOCMAN_24E\backend
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Mở `backend/.env`, cấu hình MySQL (đổi user/mật khẩu nếu XAMPP của bạn khác):

```dotenv
APP_NAME=MyShop
APP_URL=http://127.0.0.1:8000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=thltw_minhhien_ngocman_24e
DB_USERNAME=root
DB_PASSWORD=
```

Cài thư viện và kiểm tra database:

```powershell
composer install
php artisan config:clear
php artisan migrate:status
```

Chỉ khi `APP_KEY` trong `.env` đang trống, chạy một lần `php artisan key:generate`. Đừng tạo key mới nếu project đã được cấu hình.

Nếu mới tạo database trống, chạy thêm `php artisan migrate`. Nếu vừa nhập `doc/code.sql`, không cần nhập lại; chỉ chạy `php artisan migrate` khi có migration Pending.

> Không chạy `php artisan migrate:fresh` trên database cần giữ: lệnh đó xóa toàn bộ bảng.

## 4. Mở project

Mở hai cửa sổ PowerShell và để cả hai chạy.

**Cửa sổ 1 – Backend:**

```powershell
cd F:\Code\THLTW_MINHHIEN_NGOCMAN_24E\backend
php artisan serve --host=127.0.0.1 --port=8000
```

**Cửa sổ 2 – Frontend:**

```powershell
cd F:\Code\THLTW_MINHHIEN_NGOCMAN_24E\frontend
npm install
npm run dev
```

Mở `http://localhost:3000`. Muốn tắt mỗi máy chủ, bấm **Ctrl+C** trong cửa sổ tương ứng.

## 5. Tài khoản dùng thử

| Vai trò | Tên đăng nhập | Email | Mật khẩu |
|---|---|---|---|
| Admin | `admin_test` | `admin@example.com` | `123456` |
| Người dùng | `MinhHien` | `hienhoingao123@gmail.com` | `12345678` |

Đăng nhập tại trang **Đăng nhập**; tài khoản admin sẽ vào trang quản trị. Nếu không đăng nhập được, database có thể đang lưu mật khẩu khác với thông tin trên.

**Lưu ý:** đây là thông tin đăng nhập được ghi trong tài liệu project. Hãy đổi mật khẩu và xóa thông tin cá nhân khỏi README trước khi đưa project lên GitHub hoặc gửi cho người khác.

## 6. Cách áp mã khuyến mãi

1. Đăng nhập, thêm sản phẩm vào giỏ và mở trang **Giỏ hàng/Thanh toán**.
2. Nhập mã vào ô **Mã ưu đãi / Khuyến mãi**.
3. Bấm **Áp dụng**. Nếu mã hợp lệ, tổng tiền sẽ cập nhật; sau đó tiếp tục đặt hàng.
4. Nếu mã báo lỗi, kiểm tra mã đã bật chưa, thời gian bắt đầu/kết thúc, giá trị đơn tối thiểu và lượt sử dụng còn lại.
5. Để tạo/sửa mã, admin vào **Quản trị → Mã giảm giá**. Muốn mã dùng ngay, đặt **Bắt đầu** trống hoặc chọn thời điểm hiện tại; đặt ngày kết thúc trong tương lai rồi lưu.

## 7. Thử thanh toán VNPAY sandbox

Trong trang thanh toán chọn **Chuyển khoản / QR qua VNPAY**. Khi VNPAY mở trang thanh toán, chọn ngân hàng **NCB** và nhập thẻ thử nghiệm:

| Trường trên VNPAY | Giá trị thử |
|---|---|
| Số thẻ | `9704198526191432198` |
| Tên chủ thẻ | `NGUYEN VAN A` |
| Ngày phát hành (MM/YY) | `07/15` |
| OTP | `123456` |

Đây là thẻ thử trên môi trường sandbox, không phải thẻ ngân hàng thật. Nếu trang thanh toán từ chối giao dịch, project cần được cấu hình đúng mã kết nối merchant sandbox (`VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`) trong `backend/.env`. Giao dịch callback cũng cần URL backend mà sandbox truy cập được; `127.0.0.1` chỉ truy cập được trên máy của bạn. Dùng COD để thử đặt hàng nếu chưa cấu hình sandbox.

Thông tin thẻ thử theo [tài liệu sandbox chính thức của VNPAY](https://sandbox.vnpayment.vn/apis/docs/gioi-thieu/).

## 8. Kiểm tra nhanh

- Backend: mở `http://127.0.0.1:8000/up`; Laravel phải phản hồi.
- Frontend: mở `http://localhost:3000`; thử xem sản phẩm và danh mục.
- Đặt hàng: thêm sản phẩm vào giỏ, chọn COD, kiểm tra đơn trong **Hồ sơ → Đơn hàng**.
- Quản trị: đăng nhập admin, vào `http://localhost:3000/admin`.
- Kiểm thử tự động backend:

```powershell
cd F:\Code\THLTW_MINHHIEN_NGOCMAN_24E\backend
php artisan test
```

## 9. Nếu website không lấy được dữ liệu

1. Kiểm tra XAMPP MySQL đang chạy.
2. Kiểm tra cửa sổ backend vẫn chạy ở cổng 8000.
3. Mở `http://127.0.0.1:8000/up`.
4. Kiểm tra tên database và `DB_*` trong `backend/.env`.
5. Sau khi sửa `.env`, chạy `php artisan config:clear` và khởi động lại backend.
6. Giữ hai cửa sổ PowerShell chạy trong lúc sử dụng website.
