<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Table;
use Illuminate\Http\Request;
use App\Events\OrderStatusUpdated;

class ServerController extends Controller
{
    /**
     * Get active on_site orders for the server dashboard.
     */
    public function activeOrders(Request $request)
    {
        $user = $request->user();
        if (!method_exists($user, 'hasRole') || (!$user->hasRole('server', 'sanctum') && !$user->hasRole('admin', 'sanctum') && !$user->hasRole('server') && !$user->hasRole('admin'))) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $orders = Order::where('order_type', 'on_site')
            ->whereNotIn('status', ['delivered', 'cancelled'])
            ->with(['items.dish', 'user', 'table'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $orders]);
    }

    /**
     * Get history on_site orders for the server dashboard.
     */
    public function historyOrders(Request $request)
    {
        $user = $request->user();
        if (!method_exists($user, 'hasRole') || (!$user->hasRole('server', 'sanctum') && !$user->hasRole('admin', 'sanctum') && !$user->hasRole('server') && !$user->hasRole('admin'))) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $orders = Order::where('order_type', 'on_site')
            ->whereIn('status', ['delivered', 'cancelled'])
            ->with(['items.dish', 'user', 'table'])
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $orders]);
    }

    /**
     * Mark an order as delivered to table.
     */
    public function markDelivered(Request $request, $id)
    {
        $user = $request->user();
        if (!method_exists($user, 'hasRole') || (!$user->hasRole('server', 'sanctum') && !$user->hasRole('admin', 'sanctum') && !$user->hasRole('server') && !$user->hasRole('admin'))) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $order = Order::find($id);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        $order->update(['status' => 'delivered']);
        
        $order->loadMissing(['user', 'items.dish', 'table']);
        broadcast(new OrderStatusUpdated($order));

        return response()->json(['success' => true, 'data' => $order]);
    }

    /**
     * Update table availability.
     */
    public function toggleTableAvailability(Request $request, $id)
    {
        $user = $request->user();
        if (!method_exists($user, 'hasRole') || (!$user->hasRole('server', 'sanctum') && !$user->hasRole('admin', 'sanctum') && !$user->hasRole('server') && !$user->hasRole('admin'))) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $table = Table::find($id);
        if (!$table) {
            return response()->json(['success' => false, 'message' => 'Table not found'], 404);
        }

        $request->validate([
            'is_available' => 'required|boolean'
        ]);

        $table->update(['is_available' => $request->is_available]);
        return response()->json(['success' => true, 'data' => $table]);
    }
}
