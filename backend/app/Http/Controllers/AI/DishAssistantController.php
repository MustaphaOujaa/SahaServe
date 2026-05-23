<?php

namespace App\Http\Controllers\AI;

use App\Http\Controllers\Controller;
use App\Models\Dish;
use Illuminate\Http\Request;

class DishAssistantController extends Controller
{
    /**
     * Filter dishes based on query parameters before sending to AI.
     *
     * Supported parameters:
     * - query / search (string): Search in dish name or description
     * - category (string/integer): Filter by Category name or Category ID
     * - tags (array/string): Filter by Tag names or Tag IDs (comma-separated or array)
     * - min_price (numeric): Minimum price
     * - max_price (numeric): Maximum price
     * - is_available (boolean/string): Filter availability (default: true. Send 'all' to ignore)
     * - limit (integer): Max number of records to return
     * - sort_by (string): Sort field ('price', 'name', 'created_at')
     * - sort_order (string): Sort direction ('asc', 'desc')
     */
    public function filter(Request $request)
    {
        $query = Dish::query()->with(['category', 'tags']);

        // 1. Keyword search (Name or Description)
        if ($request->has('query') && !empty($request->input('query'))) {
            $keyword = $request->input('query');
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', '%' . $keyword . '%')
                    ->orWhere('description', 'like', '%' . $keyword . '%');
            });
        }

        // 2. Category filter (by Name or ID)
        if ($request->has('category') && !empty($request->input('category'))) {
            $category = $request->input('category');
            $query->whereHas('category', function ($q) use ($category) {
                if (is_numeric($category)) {
                    $q->where('id', $category);
                } else {
                    $q->where('name', 'like', '%' . $category . '%');
                }
            });
        }

        // 3. Tags filter (support multiple tags)
        if ($request->has('tags') && !empty($request->input('tags'))) {
            $tags = $request->input('tags');

            // If it's a comma-separated string, parse into an array
            if (is_string($tags)) {
                $tags = explode(',', $tags);
            }

            $tags = array_map('trim', (array) $tags);

            foreach ($tags as $tag) {
                $query->whereHas('tags', function ($q) use ($tag) {
                    if (is_numeric($tag)) {
                        $q->where('tags.id', $tag);
                    } else {
                        $q->where('tags.name', 'like', '%' . $tag . '%');
                    }
                });
            }
        }

        // 4. Price constraints
        if ($request->has('min_price') && is_numeric($request->input('min_price'))) {
            $query->where('price', '>=', $request->input('min_price'));
        }

        if ($request->has('max_price') && is_numeric($request->input('max_price'))) {
            $query->where('price', '<=', $request->input('max_price'));
        }

        // 5. Availability (defaults to only available dishes unless specified otherwise)
        $isAvailable = $request->input('is_available', true);
        if ($isAvailable !== 'all') {
            $query->where('is_available', filter_var($isAvailable, FILTER_VALIDATE_BOOLEAN));
        }

        // 6. Sorting
        $sortBy = $request->input('sort_by', 'name');
        $sortOrder = $request->input('sort_order', 'asc');

        $allowedSortFields = ['price', 'name', 'created_at'];
        $allowedSortOrders = ['asc', 'desc'];

        if (in_array($sortBy, $allowedSortFields) && in_array(strtolower($sortOrder), $allowedSortOrders)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        // 7. Limit results
        $limit = $request->input('limit');
        if (is_numeric($limit) && $limit > 0) {
            $query->limit((int) $limit);
        }

        $dishes = $query->get();

        return response()->json([
            'status' => 'success',
            'count' => $dishes->count(),
            'data' => $dishes
        ]);
    }

    /**
     * Send user message to the Python AI Smart Order Assistant service.
     */
    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        $message = $request->input('message');
        $assistantUrl = env('DISH_ASSISTANT_URL', 'http://127.0.0.1:5005/assistant/chat');

        try {
            $response = \Illuminate\Support\Facades\Http::post($assistantUrl, [
                'message' => $message
            ]);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to communicate with AI Assistant service',
                'details' => $response->body()
            ], $response->status());

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'AI Assistant service is offline or unreachable',
                'details' => $e->getMessage()
            ], 503);
        }
    }
}
