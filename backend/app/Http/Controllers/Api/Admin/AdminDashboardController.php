<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Order;
use App\Models\Post;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $now = now();
        $monthStart = $now->copy()->startOfMonth();
        $monthEnd = $now->copy()->endOfMonth();
        $chartStart = $now->copy()->startOfDay()->subDays(6);

        $monthlyOrders = Order::query()
            ->whereBetween('created_at', [$monthStart, $monthEnd])
            ->where('status', '!=', 4);

        $dailyTotals = Order::query()
            ->selectRaw('DATE(created_at) as report_date, COUNT(*) as order_count, SUM(total_amount) as revenue')
            ->whereBetween('created_at', [$chartStart, $now])
            ->where('status', '!=', 4)
            ->groupByRaw('DATE(created_at)')
            ->get()
            ->keyBy('report_date');

        $revenueLastSevenDays = collect(range(0, 6))->map(function (int $dayOffset) use ($chartStart, $dailyTotals): array {
            $day = $chartStart->copy()->addDays($dayOffset);
            $dailyTotal = $dailyTotals->get($day->toDateString());

            return [
                'date' => $day->toDateString(),
                'label' => $day->format('d/m'),
                'order_count' => (int) ($dailyTotal?->order_count ?? 0),
                'revenue' => (float) ($dailyTotal?->revenue ?? 0),
            ];
        });

        $orderStatusTotals = Order::query()
            ->select('status')
            ->selectRaw('COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $recentOrders = Order::query()
            ->latest()
            ->limit(8)
            ->get(['id', 'order_code', 'cus_name', 'total_amount', 'status', 'created_at'])
            ->map(fn (Order $order): array => [
                'id' => $order->id,
                'order_code' => $order->order_code,
                'customer_name' => $order->cus_name,
                'total_amount' => (float) $order->total_amount,
                'status' => (int) $order->status,
                'created_at' => $order->created_at?->toIso8601String(),
            ]);

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => [
                    'monthly_revenue' => (float) $monthlyOrders->sum('total_amount'),
                    'orders_this_month' => (clone $monthlyOrders)->count(),
                    'pending_orders' => Order::query()->where('status', 0)->count(),
                    'active_products' => Product::query()->where('status', 1)->count(),
                    'active_categories' => Category::query()->where('status', 1)->count(),
                    'active_users' => User::query()->where('status', 1)->count(),
                    'published_posts' => Post::query()->where('status', 1)->count(),
                ],
                'revenue_last_seven_days' => $revenueLastSevenDays->values(),
                'order_statuses' => collect(range(0, 4))->map(fn (int $status): array => [
                    'status' => $status,
                    'total' => (int) ($orderStatusTotals->get($status) ?? 0),
                ]),
                'recent_orders' => $recentOrders->values(),
            ],
        ]);
    }
}
