<div>
    <!-- Because you are alive, everything is possible. - Thich Nhat Hanh -->
</div>
<!doctype html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $eventLabel }}</title>
</head>
<body style="margin:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#111827">
    <main style="max-width:640px;margin:32px auto;padding:28px;background:#fff;border-radius:16px">
        <h1 style="color:#4f46e5">MyShop</h1>
        <h2>{{ $eventLabel }}</h2>
        <p>Xin chào {{ $order->cus_name }},</p>
        <p>Đơn hàng <strong>{{ $order->order_code }}</strong> {{ mb_strtolower($eventLabel) }}.</p>
        <p>Trạng thái hiện tại: <strong>{{ [0 => 'Chờ xử lý', 1 => 'Đã xác nhận', 2 => 'Đang giao', 3 => 'Hoàn thành', 4 => 'Đã hủy'][$order->status] ?? 'Đang cập nhật' }}</strong></p>
        <ul>
            @foreach ($order->items as $item)
                <li>{{ $item->product?->name ?? 'Sản phẩm' }} × {{ $item->quantity }}</li>
            @endforeach
        </ul>
        <p>Tổng tiền: <strong>{{ number_format((float) $order->total_amount, 0, ',', '.') }} đ</strong></p>
        <p style="color:#6b7280">Cảm ơn bạn đã mua sắm tại MyShop.</p>
    </main>
</body>
</html>
