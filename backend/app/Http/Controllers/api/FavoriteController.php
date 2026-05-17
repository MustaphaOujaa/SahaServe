<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;

use Illuminate\Http\Request;

use App\Models\Favorite;
use App\Models\Dish;

class FavoriteController extends Controller
{
    /**
     * Display a listing of the user's favorite dishes.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $favorites = $user->favoriteDishes()->with(['category', 'images'])->get();

        return response()->json([
            'success' => true,
            'data' => $favorites
        ]);
    }

    /**
     * Store a newly created favorite in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'dish_id' => 'required|exists:dishes,id',
        ]);

        $user = $request->user();

        // Use syncWithoutDetaching to avoid duplicates
        $user->favoriteDishes()->syncWithoutDetaching([$request->dish_id]);

        return response()->json([
            'success' => true,
            'message' => 'Dish added to favorites successfully.'
        ]);
    }

    /**
     * Remove the specified favorite from storage.
     */
    public function destroy(Request $request, $dishId)
    {
        $user = $request->user();

        $detached = $user->favoriteDishes()->detach($dishId);

        if ($detached) {
            return response()->json([
                'success' => true,
                'message' => 'Dish removed from favorites successfully.'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Dish not found in favorites.'
        ], 404);
    }
}
