<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use Illuminate\Http\JsonResponse;

class MenuController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => MenuItem::query()
                ->where('status', true)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get(['id', 'label', 'url', 'sort_order', 'open_new_tab']),
        ]);
    }
}
