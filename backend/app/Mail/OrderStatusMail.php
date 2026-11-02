<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use App\Models\Order;
use Illuminate\Queue\SerializesModels;

class OrderStatusMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order, public string $eventLabel)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "MyShop - {$this->eventLabel} ({$this->order->order_code})",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order-status',
            with: [
                'order' => $this->order->loadMissing('items.product'),
                'eventLabel' => $this->eventLabel,
            ],
        );
    }

}
