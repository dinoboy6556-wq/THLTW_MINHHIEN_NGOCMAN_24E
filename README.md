# Hướng dẫn cài đặt và dùng thử MyShop

## 1. Project cần có

- XAMPP (MySQL), PHP 8.2+, Composer, Node.js/npm.
- Website chạy ở `http://localhost:3000`.
- API Laravel chạy ở `http://127.0.0.1:8000`.
- Database: `thltw_minhhien_ngocman_24e`.

## 2. Cài database

1. Mở XAMPP Control Panel, bấm **Start** ở MySQL.
2. Mở `http://localhost/phpmyadmin`.
3. Chọn **Import / Nhập**, chọn file `doc/code.sql` của project rồi bấm **Thực hiện**.(Hoặc copy code trong file code.sql chép vào spl rồi chạy lệnh)
4. Chỉ nhập vào database mới/rỗng. Nếu đã có dữ liệu, hãy Export sao lưu trước; không nhập file nhiều lần.

## 3. Cấu hình backend lần đầu

Mở PowerShell:

```powershell
cd F:\Code\THLTW_MINHHIEN_NGOCMAN_24E\backend
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Mở `backend/.env`, cấu hình MySQL (đổi user/mật khẩu nếu XAMPP của bạn khác):

```cau hinh file .env
APP_NAME=Laravel
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file
# APP_MAINTENANCE_STORE=database

# PHP_CLI_SERVER_WORKERS=4

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=thltw_minhhien_ngocman_24e
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=database
# CACHE_PREFIX=

MEMCACHED_HOST=127.0.0.1

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=log
MAIL_SCHEME=null
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

VITE_APP_NAME="${APP_NAME}"
OPENAI_API_KEY=
OPENAI_MODEL=gpt-6-luna
OPENAI_RESPONSES_URL=https://api.openai.com/v1/responses

VNPAY_FRONTEND_URL=http://localhost:3000
VNPAY_TMN_CODE=
VNPAY_RETURN_URL=http://127.0.0.1:8000/api/payments/vnpay/return
VNPAY_PAYMENT_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_HASH_SECRET=


MAIL_MAILER=smtp
MAIL_SCHEME=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-account@gmail.com
MAIL_PASSWORD=your-new-16-character-app-password
MAIL_FROM_ADDRESS=your-account@gmail.com
MAIL_FROM_NAME="MyShop"
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

Nếu cần đổi địa chỉ API, sao chép `frontend/.env.example` thành `frontend/.env.local` rồi sửa `NEXT_PUBLIC_API_URL`. File `.env.local` là cấu hình riêng trên máy, không đưa lên Git.

Mở `http://localhost:3000`. Muốn tắt mỗi máy chủ, bấm **Ctrl+C** trong cửa sổ tương ứng.

## 5. Tài khoản dùng thử

| Vai trò    | Tên đăng nhập | Email                      | Mật khẩu   |
| ---------- | ------------- | -------------------------- | ---------- |
| Admin      | `admin_test`  | `admin@example.com`        | `123456`   |
| Người dùng | `MinhHien`    | `hienhoingao123@gmail.com` | `12345678` |

Đăng nhập tại trang **Đăng nhập**; tài khoản admin sẽ vào trang quản trị. Nếu không đăng nhập được, database có thể đang lưu mật khẩu khác với thông tin trên.

**Lưu ý:** đây là thông tin đăng nhập được ghi trong tài liệu project. Hãy đổi mật khẩu và xóa thông tin cá nhân khỏi README trước khi đưa project lên GitHub hoặc gửi cho người khác.

### Mở user và admin cùng lúc trên hai tab

Phiên đăng nhập được lưu riêng trong từng tab. Mở tab thứ nhất, đăng nhập user và vào trang chủ. Mở tab thứ hai, đăng nhập admin rồi vào `http://localhost:3000/admin`. Đăng nhập ở tab này sẽ không thay tài khoản trong tab kia. Sau cập nhật phiên đăng nhập, hãy đăng nhập lại ở mỗi tab một lần.

## 6. Cách áp mã khuyến mãi

1. Đăng nhập, thêm sản phẩm vào giỏ và mở trang **Giỏ hàng/Thanh toán**.
2. Nhập mã vào ô **Mã ưu đãi / Khuyến mãi**.
3. Bấm **Áp dụng**. Nếu mã hợp lệ, tổng tiền sẽ cập nhật; sau đó tiếp tục đặt hàng.
4. Nếu mã báo lỗi, kiểm tra mã đã bật chưa, thời gian bắt đầu/kết thúc, giá trị đơn tối thiểu và lượt sử dụng còn lại.
5. Để tạo/sửa mã, admin vào **Quản trị → Mã giảm giá**. Muốn mã dùng ngay, đặt **Bắt đầu** trống hoặc chọn thời điểm hiện tại; đặt ngày kết thúc trong tương lai rồi lưu.

## 7. Thử thanh toán VNPAY sandbox

Trong trang thanh toán chọn **Chuyển khoản / QR qua VNPAY**. Khi VNPAY mở trang thanh toán, chọn ngân hàng **NCB** và nhập thẻ thử nghiệm:

| Trường trên VNPAY      | Giá trị thử           |
| ---------------------- | --------------------- |
| Số thẻ                 | `9704198526191432198` |
| Tên chủ thẻ            | `NGUYEN VAN A`        |
| Ngày phát hành (MM/YY) | `07/15`               |
| OTP                    | `123456`              |

Đây là thẻ thử trên môi trường sandbox, không phải thẻ ngân hàng thật. Cần điền đúng thông tin merchant sandbox (`VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`) vào `backend/.env`; không đưa các giá trị này lên Git.

### Cho VNPAY gọi ngược về máy đang chạy

VNPAY sandbox không truy cập được `127.0.0.1`. Khi thử thanh toán online, mở thêm một cửa sổ PowerShell và tạo đường hầm tới **backend ở cổng 8000**:

```powershell
ngrok http 8000
```

Trong dòng `Forwarding`, lấy địa chỉ HTTPS hiện tại, ví dụ `https://abc123.ngrok-free.dev`, rồi đặt trong `backend/.env`:

```dotenv
VNPAY_RETURN_URL=https://abc123.ngrok-free.dev/api/payments/vnpay/return
```

Thay `abc123...` bằng địa chỉ ngrok thật của bạn. Mỗi lần khởi động lại ngrok miễn phí, kiểm tra địa chỉ mới và cập nhật `VNPAY_RETURN_URL`. Sau đó chạy `php artisan config:clear` trong thư mục `backend`, khởi động lại Laravel và tạo giao dịch mới. Giữ cả Laravel lẫn ngrok đang chạy cho tới khi VNPAY chuyển về website. Nếu không có URL HTTPS đang hoạt động, callback không tới được máy và luồng thanh toán sẽ không hoàn tất.

Thông tin thẻ thử theo [tài liệu sandbox chính thức của VNPAY](https://sandbox.vnpayment.vn/apis/docs/gioi-thieu/).

## 8. Ảnh sản phẩm bị mất khi chuyển project

Database chỉ lưu **đường dẫn** ảnh, không lưu nội dung ảnh. Các ảnh mẫu của bản SQL đã được đặt trong `backend/public/images/products` để khi clone/import SQL, đường dẫn mẫu vẫn hoạt động.

Ảnh do quản trị viên tải lên được lưu tại `backend/storage/app/public` và thư mục này không đưa lên Git. Khi chuyển sang máy/thư mục project mới, nếu còn bản cũ, hãy sao chép toàn bộ nội dung `backend/storage/app/public` sang cùng đường dẫn trong bản mới (giữ nguyên các thư mục `products`, `posts`, `avatars`, `reviews` nếu có), rồi chạy trong `backend`:

```powershell
php artisan storage:link
```

Nếu bản cũ và bản sao lưu đều không còn các file ảnh đã tải lên, chỉ có database thì không thể khôi phục ảnh gốc từ các đường dẫn; cần tải lại ảnh trong trang quản trị hoặc phục hồi từ backup.

## 9. Nhận email khi thanh toán thành công

Khi VNPAY xác nhận giao dịch thành công, hệ thống gửi email đến địa chỉ khách nhập trong đơn hàng. Email có mã đơn, sản phẩm, tổng tiền và trạng thái thanh toán. Để email được gửi ra Gmail thật:

1. Bật **Xác minh 2 bước** cho tài khoản Gmail dùng làm địa chỉ gửi.
2. Tạo **Mật khẩu ứng dụng (App Password)** trong phần bảo mật tài khoản Google. Gmail SMTP yêu cầu đăng nhập SMTP; dùng App Password, không dùng mật khẩu Gmail thường.
3. Điền cấu hình dưới đây vào `backend/.env` (thay bằng Gmail và App Password của bạn):

```dotenv
MAIL_MAILER=smtp
MAIL_SCHEME=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-account@gmail.com
MAIL_PASSWORD=your-new-16-character-app-password
MAIL_FROM_ADDRESS=your-account@gmail.com
MAIL_FROM_NAME="MyShop"
```

4. Trong PowerShell tại `backend`, chạy `php artisan config:clear`, sau đó khởi động lại Laravel.
5. Đặt một đơn VNPAY sandbox bằng email của bạn và hoàn thành giao dịch bằng thẻ test ở mục trên. Kiểm tra Hộp thư đến/Spam.

Khi `MAIL_MAILER=log`, thư chỉ được ghi vào `backend/storage/logs/laravel.log`, không gửi tới Gmail. Không đưa App Password vào Git hoặc gửi trong ảnh chụp màn hình. Xem hướng dẫn của Google về [Mật khẩu ứng dụng](https://support.google.com/accounts/answer/185833) và [máy chủ SMTP Gmail](https://support.google.com/mail/answer/7104828).

## 10. Kiểm tra nhanh

- Backend: mở `http://127.0.0.1:8000/up`; Laravel phải phản hồi.
- Frontend: mở `http://localhost:3000`; thử xem sản phẩm và danh mục.
- Đặt hàng: thêm sản phẩm vào giỏ, chọn COD, kiểm tra đơn trong **Hồ sơ → Đơn hàng**.
- Quản trị: đăng nhập admin, vào `http://localhost:3000/admin`.
- Kiểm thử tự động backend:

```powershell
cd F:\Code\THLTW_MINHHIEN_NGOCMAN_24E\backend
php artisan test
```

## 11. Nếu website không lấy được dữ liệu

1. Kiểm tra XAMPP MySQL đang chạy.
2. Kiểm tra cửa sổ backend vẫn chạy ở cổng 8000.
3. Mở `http://127.0.0.1:8000/up`.
4. Kiểm tra tên database và `DB_*` trong `backend/.env`.
5. Sau khi sửa `.env`, chạy `php artisan config:clear` và khởi động lại backend.
6. Giữ hai cửa sổ PowerShell chạy trong lúc sử dụng website.
