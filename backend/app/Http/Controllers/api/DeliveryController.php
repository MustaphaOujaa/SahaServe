<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Events\DeliveryWorkerStatusUpdated;
use App\Models\Order;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    /**
     * Get current orders assigned to the authenticated delivery worker.
     */
    public function current(Request $request)
    {
        $user = $request->user();
        // Ensure the user is a delivery worker
        if (!method_exists($user, 'hasRole') || (!$user->hasRole('delivery', 'sanctum') && !$user->hasRole('admin', 'sanctum') && !$user->hasRole('delivery') && !$user->hasRole('admin'))) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }
        $orders = Order::where('delivery_worker_id', $user->id)
            ->whereIn('delivery_status', ['assigned', 'accepted'])
            ->whereNotIn('status', ['delivered', 'cancelled'])
            ->with(['items.dish', 'user'])
            ->get();
        return response()->json(['success' => true, 'data' => $orders]);
    }

    /**
     * Get delivery history for the authenticated delivery worker.
     */
    public function history(Request $request)
    {
        $user = $request->user();
        if (!method_exists($user, 'hasRole') || (!$user->hasRole('delivery', 'sanctum') && !$user->hasRole('admin', 'sanctum') && !$user->hasRole('delivery') && !$user->hasRole('admin'))) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }
        $orders = Order::where('delivery_worker_id', $user->id)
            ->where('status', 'delivered')
            ->with(['items.dish', 'user'])
            ->orderBy('updated_at', 'desc')
            ->get();
        return response()->json(['success' => true, 'data' => $orders]);
    }

    /**
     * Check in delivery worker.
     */
    public function checkIn(Request $request)
    {
        $user = $request->user();
        if (!method_exists($user, 'hasRole') || (!$user->hasRole('delivery', 'sanctum') && !$user->hasRole('admin', 'sanctum') && !$user->hasRole('delivery') && !$user->hasRole('admin'))) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $user->update(['delivery_status' => 'available']);
        broadcast(new DeliveryWorkerStatusUpdated($user));
        return response()->json([
            'success' => true,
            'message' => 'Checked in successfully',
            'user' => $user->load('roles:id,name')
        ]);
    }

    /**
     * Check out delivery worker.
     */
    public function checkOut(Request $request)
    {
        $user = $request->user();
        if (!method_exists($user, 'hasRole') || (!$user->hasRole('delivery', 'sanctum') && !$user->hasRole('admin', 'sanctum') && !$user->hasRole('delivery') && !$user->hasRole('admin'))) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        // Prevent check-out if busy (on mission)
        if ($user->delivery_status === 'busy') {
            return response()->json(['success' => false, 'message' => 'Cannot check out while on a mission'], 400);
        }

        $user->update(['delivery_status' => 'inactive']);
        broadcast(new DeliveryWorkerStatusUpdated($user));
        return response()->json([
            'success' => true,
            'message' => 'Checked out successfully',
            'user' => $user->load('roles:id,name')
        ]);
    }

    /**
     * Accept an assigned order.
     */
    public function acceptOrder(Request $request, $id)
    {
        $user = $request->user();
        if (!method_exists($user, 'hasRole') || (!$user->hasRole('delivery', 'sanctum') && !$user->hasRole('admin', 'sanctum') && !$user->hasRole('delivery') && !$user->hasRole('admin'))) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $order = Order::find($id);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        if ($order->delivery_worker_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'This order is not assigned to you'], 403);
        }

        if ($order->delivery_status !== 'assigned') {
            return response()->json(['success' => false, 'message' => 'Order is not in an assigned state'], 400);
        }

        // Update order status
        $order->update(['delivery_status' => 'accepted']);
        
        // Update user status to busy (remove from available list)
        $user->update(['delivery_status' => 'busy']);

        $order->loadMissing(['user', 'items.dish', 'table', 'deliveryWorker']);
        broadcast(new \App\Events\OrderStatusUpdated($order));
        broadcast(new DeliveryWorkerStatusUpdated($user));

        return response()->json([
            'success' => true, 
            'message' => 'Order accepted', 
            'data' => $order,
            'user' => $user->load('roles:id,name')
        ]);
    }

    /**
     * Refuse an assigned order.
     */
    public function refuseOrder(Request $request, $id)
    {
        $user = $request->user();
        if (!method_exists($user, 'hasRole') || (!$user->hasRole('delivery', 'sanctum') && !$user->hasRole('admin', 'sanctum') && !$user->hasRole('delivery') && !$user->hasRole('admin'))) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $order = Order::find($id);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        if ($order->delivery_worker_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'This order is not assigned to you'], 403);
        }

        if ($order->delivery_status !== 'assigned') {
            return response()->json(['success' => false, 'message' => 'Order cannot be refused now'], 400);
        }

        // Reset order assignment fields so server can assign to someone else
        $order->update([
            'delivery_worker_id' => null,
            'delivery_status' => 'pending'
        ]);

        // Keep user status as available (since they refused, they are not on a mission)
        $user->update(['delivery_status' => 'available']);

        // Since we changed delivery_worker_id to null, we must load relations before broadcast
        $order->loadMissing(['user', 'items.dish', 'table', 'deliveryWorker']);
        broadcast(new \App\Events\OrderStatusUpdated($order));
        broadcast(new DeliveryWorkerStatusUpdated($user));

        return response()->json([
            'success' => true,
            'message' => 'Order refused successfully',
            'data' => $order,
            'user' => $user->load('roles:id,name')
        ]);
    }

    /**
     * Mark an accepted order as delivered.
     */
    public function markDelivered(Request $request, $id)
    {
        $user = $request->user();
        if (!method_exists($user, 'hasRole') || (!$user->hasRole('delivery', 'sanctum') && !$user->hasRole('admin', 'sanctum') && !$user->hasRole('delivery') && !$user->hasRole('admin'))) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $order = Order::find($id);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        if ($order->delivery_worker_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'This order is not assigned to you'], 403);
        }

        if ($order->delivery_status !== 'accepted') {
            return response()->json(['success' => false, 'message' => 'Order has not been accepted yet'], 400);
        }

        // Update order status to delivered
        $order->update([
            'status' => 'delivered',
            'delivery_status' => 'accepted' // keep as accepted or delivered
        ]);

        // Update user status back to available (reappears in dropdowns)
        $user->update(['delivery_status' => 'available']);

        $order->loadMissing(['user', 'items.dish', 'table', 'deliveryWorker']);
        broadcast(new \App\Events\OrderStatusUpdated($order));
        broadcast(new DeliveryWorkerStatusUpdated($user));

        return response()->json([
            'success' => true,
            'message' => 'Order marked as delivered',
            'data' => $order,
            'user' => $user->load('roles:id,name')
        ]);
    }
}
?>
