<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ExtraManagementController extends Controller
{
    private const TABLES = ['pages' => 'static_pages', 'banners' => 'banners', 'contacts' => 'contacts', 'post-categories' => 'post_categories', 'settings' => 'website_settings'];

    public function index(Request $request, string $resource): JsonResponse
    {
        abort_unless(isset(self::TABLES[$resource]), 404);
        $query = DB::table(self::TABLES[$resource]);
        if ($request->filled('keyword')) {
            $term = '%' . $request->string('keyword') . '%';
            $query->where(function ($q) use ($term) { $q->where('title', 'like', $term)->orWhere('name', 'like', $term)->orWhere('email', 'like', $term)->orWhere('key', 'like', $term); });
        }
        if ($request->filled('status') && $resource === 'contacts') $query->where('status', $request->input('status'));
        return response()->json(['success' => true, 'data' => $query->latest('id')->paginate(min(100, max(1, $request->integer('per_page', 20))))]);
    }

    public function store(Request $request, string $resource): JsonResponse
    {
        abort_unless(isset(self::TABLES[$resource]) && !in_array($resource, ['contacts'], true), 404);
        $data = match ($resource) {
            'pages' => $request->validate(['title'=>'required|string|max:255','content'=>'required|string','is_published'=>'required|boolean']),
            'banners' => $request->validate(['title'=>'required|string|max:255','image_url'=>'required|string|max:2048','target_url'=>'nullable|string|max:2048','sort_order'=>'nullable|integer|min:0','is_active'=>'required|boolean']),
            'post-categories' => $request->validate(['name'=>'required|string|max:100','description'=>'nullable|string','is_active'=>'required|boolean']),
            'settings' => $request->validate(['key'=>'required|string|max:100','value'=>'nullable|string']),
        };
        if (in_array($resource, ['pages','post-categories'], true)) $data['slug'] = $this->uniqueSlug(self::TABLES[$resource], $data['title'] ?? $data['name']);
        $id = DB::table(self::TABLES[$resource])->insertGetId($data + ['created_at'=>now(),'updated_at'=>now()]);
        return response()->json(['success'=>true,'data'=>DB::table(self::TABLES[$resource])->find($id)],201);
    }

    public function update(Request $request, string $resource, int $id): JsonResponse
    {
        abort_unless(isset(self::TABLES[$resource]) && $resource !== 'contacts', 404);
        $table = self::TABLES[$resource]; $row = DB::table($table)->find($id); abort_unless($row,404);
        $fields = match ($resource) {
            'pages' => $request->validate(['title'=>'required|string|max:255','content'=>'required|string','is_published'=>'required|boolean']),
            'banners' => $request->validate(['title'=>'required|string|max:255','image_url'=>'required|string|max:2048','target_url'=>'nullable|string|max:2048','sort_order'=>'nullable|integer|min:0','is_active'=>'required|boolean']),
            'post-categories' => $request->validate(['name'=>'required|string|max:100','description'=>'nullable|string','is_active'=>'required|boolean']),
            'settings' => $request->validate(['key'=>'required|string|max:100','value'=>'nullable|string']),
        };
        if (in_array($resource,['pages','post-categories'],true)) $fields['slug']=$this->uniqueSlug($table,$fields['title']??$fields['name'],$id);
        DB::table($table)->where('id',$id)->update($fields+['updated_at'=>now()]);
        return response()->json(['success'=>true,'data'=>DB::table($table)->find($id)]);
    }

    public function destroy(string $resource, int $id): JsonResponse
    {
        abort_unless(isset(self::TABLES[$resource]) && !in_array($resource,['contacts','settings'],true),404);
        $deleted=DB::table(self::TABLES[$resource])->where('id',$id)->delete(); abort_unless($deleted,404);
        return response()->json(['success'=>true,'message'=>'Đã xóa mục.']);
    }

    public function publicPage(string $slug): JsonResponse
    {
        $page=DB::table('static_pages')->where('slug',$slug)->where('is_published',true)->first(); abort_unless($page,404);
        return response()->json(['success'=>true,'data'=>$page]);
    }

    public function submitContact(Request $request): JsonResponse
    {
        $data=$request->validate(['name'=>'required|string|max:255','email'=>'required|email|max:255','phone'=>'nullable|string|max:30','subject'=>'nullable|string|max:255','message'=>'required|string|max:5000']);
        $id=DB::table('contacts')->insertGetId($data+['status'=>'new','created_at'=>now(),'updated_at'=>now()]);
        return response()->json(['success'=>true,'message'=>'Đã nhận liên hệ.','data'=>['id'=>$id]],201);
    }

    public function replyContact(Request $request, int $id): JsonResponse
    {
        $data=$request->validate(['status'=>'required|in:new,processing,resolved','admin_reply'=>'nullable|string|max:5000']);
        $updated=DB::table('contacts')->where('id',$id)->update($data+['updated_at'=>now()]); abort_unless($updated,404);
        return response()->json(['success'=>true,'data'=>DB::table('contacts')->find($id)]);
    }

    public function stockMovements(Request $request): JsonResponse
    {
        $rows=DB::table('stock_movements')->join('products','products.id','=','stock_movements.product_id')->select('stock_movements.*','products.name as product_name')->when($request->filled('product_id'),fn($q)=>$q->where('product_id',$request->input('product_id')))->latest('stock_movements.id')->paginate(min(100,max(1,$request->integer('per_page',20))));
        return response()->json(['success'=>true,'data'=>$rows]);
    }

    public function moveStock(Request $request): JsonResponse
    {
        $data=$request->validate(['product_id'=>'required|integer|exists:products,id','movement_type'=>'required|in:in,out','quantity'=>'required|integer|min:1','reason'=>'required|string|max:255']);
        $row=DB::transaction(function()use($request,$data){$product=Product::query()->lockForUpdate()->findOrFail($data['product_id']); if($data['movement_type']==='out' && $product->stock<$data['quantity']) abort(422,'Tồn kho không đủ để xuất số lượng yêu cầu.'); $data['movement_type']==='in'?$product->increment('stock',$data['quantity']):$product->decrement('stock',$data['quantity']); return DB::table('stock_movements')->insertGetId($data+['admin_id'=>$request->user()->getAuthIdentifier(),'created_at'=>now(),'updated_at'=>now()]);});
        return response()->json(['success'=>true,'data'=>DB::table('stock_movements')->find($row)],201);
    }

    private function uniqueSlug(string $table,string $source,?int $except=null):string
    {
        $slug=Str::slug($source)?:'muc'; $base=$slug; $i=2;
        while(DB::table($table)->where('slug',$slug)->when($except,fn($q)=>$q->where('id','!=',$except))->exists())$slug=$base.'-'.$i++;
        return $slug;
    }
}
