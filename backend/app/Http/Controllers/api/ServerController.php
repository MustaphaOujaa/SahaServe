<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Table;
use App\Models\User;
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

        $orders = Order::whereNotIn('status', ['delivered', 'cancelled'])
            ->with(['items.dish', 'user', 'table', 'deliveryWorker'])
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

        $orders = Order::whereIn('status', ['delivered', 'cancelled'])
            ->with(['items.dish', 'user', 'table', 'deliveryWorker'])
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

    /**
     * Get all delivery workers.
     */
    public function getDeliveryWorkers(Request $request)
    {
        $user = $request->user();
        if (!method_exists($user, 'hasRole') || (!$user->hasRole('server', 'sanctum') && !$user->hasRole('admin', 'sanctum') && !$user->hasRole('server') && !$user->hasRole('admin'))) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $workers = User::role('delivery')
            ->where('delivery_status', 'available')
            ->select('id', 'name', 'phone_number')
            ->get();
        return response()->json(['success' => true, 'data' => $workers]);
    }

    /**
     * Assign a delivery worker to a prepared home delivery order.
     */
    public function assignDeliveryWorker(Request $request, $id)
    {
        $user = $request->user();
        if (!method_exists($user, 'hasRole') || (!$user->hasRole('server', 'sanctum') && !$user->hasRole('admin', 'sanctum') && !$user->hasRole('server') && !$user->hasRole('admin'))) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'delivery_worker_id' => 'required|exists:users,id'
        ]);

        $order = Order::find($id);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        if ($order->order_type !== 'home_delivery') {
            return response()->json(['success' => false, 'message' => 'Order is not a home delivery order'], 400);
        }

        $worker = User::find($request->delivery_worker_id);
        if (!$worker->hasRole('delivery', 'sanctum') && !$worker->hasRole('delivery')) {
            return response()->json(['success' => false, 'message' => 'Selected user is not a delivery worker'], 400);
        }

        $order->update([
            'delivery_worker_id' => $request->delivery_worker_id,
            'delivery_status' => 'assigned',
        ]);

        $order->loadMissing(['user', 'items.dish', 'table', 'deliveryWorker']);
        broadcast(new OrderStatusUpdated($order));

        return response()->json(['success' => true, 'data' => $order]);
    }
}
