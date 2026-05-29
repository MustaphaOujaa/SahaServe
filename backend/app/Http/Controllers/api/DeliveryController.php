<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
}
?>
