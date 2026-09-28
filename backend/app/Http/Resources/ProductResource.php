<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'price' => (float) $this->price,
            'sale_price' => $this->promo_price ? (float) $this->promo_price : null,
            'final_price' => $this->final_price,
            'stock' => $this->stock,
            'thumbnail' => $this->thumbnail ? (str_starts_with($this->thumbnail, 'http') ? $this->thumbnail : asset($this->thumbnail)) : null,
            'description' => $this->description,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'brand' => new BrandResource($this->whenLoaded('brand')),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}