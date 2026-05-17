<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Http\Request;

class CartController extends Controller
{
    private function getCart($user)
    {
        return Cart::firstOrCreate(['user_id' => $user->id]);
    }

    public function index(Request $request)
    {
        $cart = $this->getCart($request->user())->load('items.dish');
        return response()->json(['success' => true, 'data' => $cart]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'dish_id' => 'required|exists:dishes,id',
            'quantity' => 'required|integer|min:1'
        ]);

        $cart = $this->getCart($request->user());

        $item = CartItem::where('cart_id', $cart->id)
            ->where('dish_id', $validated['dish_id'])
            ->first();

        if ($item) {
            $item->quantity += $validated['quantity'];
            $item->save();
        } else {
            $item = CartItem::create([
                'cart_id' => $cart->id,
                'dish_id' => $validated['dish_id'],
                'quantity' => $validated['quantity']
            ]);
        }

        return response()->json(['success' => true, 'data' => $item->load('dish')]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        $item = CartItem::find($id);
        if (!$item)
            return response()->json(['success' => false, 'message' => 'Not found'], 404);

        if ($item->cart->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $item->update(['quantity' => $validated['quantity']]);
        return response()->json(['success' => true, 'data' => $item->load('dish')]);
    }

    public function clear(Request $request)
    {
        $cart = $this->getCart($request->user());
        $cart->items()->delete();
        return response()->json(['success' => true, 'message' => 'Cart cleared']);
    }

    public function destroy(Request $request, $id)
    {
        $item = CartItem::find($id);
        if (!$item)
            return response()->json(['success' => false, 'message' => 'Not found'], 404);

        if ($item->cart->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $item->delete();
        return response()->json(['success' => true, 'message' => 'Item removed']);
    }
}
