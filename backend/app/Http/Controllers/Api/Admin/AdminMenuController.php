<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminMenuController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => MenuItem::query()->orderBy('sort_order')->orderBy('id')->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $menuItem = MenuItem::create($this->validatedData($request));

        return response()->json(['success' => true, 'message' => 'Đã thêm mục menu.', 'data' => $menuItem], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $menuItem = MenuItem::findOrFail($id);
        $menuItem->update($this->validatedData($request));

        return response()->json(['success' => true, 'message' => 'Đã cập nhật mục menu.', 'data' => $menuItem]);
    }

    public function destroy(int $id): JsonResponse
    {
        $menuItem = MenuItem::findOrFail($id);
        $menuItem->delete();

        return response()->json(['success' => true, 'message' => 'Đã chuyển mục menu vào thùng rác.']);
    }

    /** @return array{label: string, url: string, sort_order: int, status: bool, open_new_tab: bool} */
    private function validatedData(Request $request): array
    {
        return $request->validate([
            'label' => ['required', 'string', 'max:100'],
            'url' => ['required', 'string', 'max:2048', 'regex:/^(\/(?!\/)|https?:\/\/)/i'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:65535'],
            'status' => ['required', 'boolean'],
            'open_new_tab' => ['required', 'boolean'],
        ]);
    }
}
