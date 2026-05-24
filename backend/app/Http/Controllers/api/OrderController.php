<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index()
    {
        return response()->json(['success' => true, 'data' => Order::with('user', 'items.dish', 'table')->get()]);
    }

    public function userOrders(Request $request)
    {
        return response()->json(['success' => true, 'data' => Order::where('user_id', $request->user()->id)->with('items.dish', 'table')->get()]);
    }

    public function show($id)
    {
        $order = Order::with(['user', 'items.dish', 'table'])->find($id);
        if (!$order)
            return response()->json(['success' => false, 'message' => 'Not found'], 404);
        return response()->json(['success' => true, 'data' => $order]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $cart = Cart::where('user_id', $user->id)->with('items.dish')->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'Cart is empty'], 400);
        }

        // Base validation
        $validated = $request->validate([
            'order_type'       => 'required|in:home_delivery,on_site',
            'payment_method'   => 'nullable|string',
        ]);

        // Conditional validation based on order type
        if ($validated['order_type'] === 'home_delivery') {
            $request->validate([
                'delivery_address' => 'required|string|max:500',
            ]);
            $validated['delivery_address'] = $request->delivery_address;
        } else {
            $request->validate([
                'table_id' => 'required|exists:tables,id',
            ]);

            // Make sure the table is available
            $table = Table::find($request->table_id);
            if (!$table || !$table->is_available) {
                return response()->json([
                    'success' => false,
                    'message' => 'Selected table is not available.'
                ], 422);
            }

            $validated['table_id'] = $request->table_id;
        }

        try {
            DB::beginTransaction();

            $totalPrice = 0;
            foreach ($cart->items as $item) {
                if ($item->dish) {
                    $totalPrice += $item->dish->price * $item->quantity;
                }
            }

            $order = Order::create([
                'user_id'          => $user->id,
                'status'           => 'pending',
                'total_price'      => $totalPrice,
                'order_type'       => $validated['order_type'],
                'delivery_address' => $validated['delivery_address'] ?? null,
                'table_id'         => $validated['table_id'] ?? null,
                'payment_method'   => $validated['payment_method'] ?? null,
            ]);

            foreach ($cart->items as $item) {
                if ($item->dish) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'dish_id'  => $item->dish_id,
                        'quantity' => $item->quantity,
                        'price'    => $item->dish->price
                    ]);
                }
            }

            $cart->items()->delete();
            DB::commit();

            return response()->json(['success' => true, 'data' => $order->load('items.dish', 'table')], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Could not create order: ' . $e->getMessage()], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $order = Order::find($id);
        if (!$order)
            return response()->json(['success' => false, 'message' => 'Not found'], 404);

        $validated = $request->validate([
            'status' => 'required|string|in:pending,confirmed,preparing,delivered,cancelled'
        ]);

        $order->update(['status' => $validated['status']]);
        return response()->json(['success' => true, 'data' => $order]);
    }

    public function markReady($id)
    {
        $order = Order::find($id);
        if (!$order)
            return response()->json(['success' => false, 'message' => 'Not found'], 404);

        $order->update(['status' => 'confirmed']);
        return response()->json(['success' => true, 'data' => $order]);
    }

    public function takeDelivery($id)
    {
        $order = Order::find($id);
        if (!$order)
            return response()->json(['success' => false, 'message' => 'Not found'], 404);

        $order->update(['status' => 'preparing']);
        return response()->json(['success' => true, 'data' => $order]);
    }

    public function markDelivered($id)
    {
        $order = Order::find($id);
        if (!$order)
            return response()->json(['success' => false, 'message' => 'Not found'], 404);

        $order->update(['status' => 'delivered']);
        return response()->json(['success' => true, 'data' => $order]);
    }
}
