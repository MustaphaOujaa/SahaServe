<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $query = Review::with(['user:id,name,email', 'dish:id,name'])->latest();

        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->date);
        }

        $perPage = min((int) $request->input('per_page', 10), 200);

        return response()->json([
            'success' => true,
            'data' => $query->paginate($perPage)
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'dish_id' => 'required|exists:dishes,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        $validated['user_id'] = $request->user()->id;

        // Ensure user hasn't reviewed this dish already
        $existing = Review::where('user_id', $validated['user_id'])->where('dish_id', $validated['dish_id'])->first();
        if ($existing) {
            return response()->json(['success' => false, 'message' => 'You already reviewed this dish.'], 400);
        }

        $review = Review::create($validated);
        return response()->json(['success' => true, 'data' => $review], 201);
    }

    public function destroy(Request $request, $id)
    {
        $review = Review::find($id);
        if (!$review)
            return response()->json(['success' => false, 'message' => 'Not found'], 404);

        if ($review->user_id !== $request->user()->id && !$request->user()->can('manage-reviews')) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $review->delete();
        return response()->json(['success' => true, 'message' => 'Deleted successfully']);
    }
}
