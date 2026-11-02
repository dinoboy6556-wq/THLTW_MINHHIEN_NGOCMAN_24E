<?php

namespace App\Services;

use App\Mail\OrderStatusMail;
use App\Models\Order;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OrderNotificationService
{
    public function send(Order $order, string $eventLabel): void
    {
        if (!$order->cus_email) {
            return;
        }

        try {
            Mail::to($order->cus_email)->send(new OrderStatusMail($order, $eventLabel));
        } catch (\Throwable $exception) {
            Log::warning('Order notification email could not be sent.', [
                'order_id' => $order->id,
                'exception' => $exception::class,
            ]);
        }
    }
}
