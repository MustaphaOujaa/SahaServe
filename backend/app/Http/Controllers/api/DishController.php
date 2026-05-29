<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dish;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DishController extends Controller
{
    public function index()
    {
        return response()->json(['success' => true, 'data' => Dish::with(['category', 'images', 'tags'])->get()]);
    }

    public function show($id)
    {
        $dish = Dish::with(['category', 'images', 'reviews.user', 'tags'])->find($id);
        if (!$dish)
            return response()->json(['success' => false, 'message' => 'Not found'], 404);
        return response()->json(['success' => true, 'data' => $dish]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'is_available' => 'boolean',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'exists:tags,id',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if (!isset($validated['is_available'])) {
            $validated['is_available'] = true;
        }

        $images = $request->file('images', []);
        $tagIds = $validated['tag_ids'] ?? $validated['tags'] ?? [];
        unset($validated['tag_ids'], $validated['tags']);
        unset($validated['images']);

        $dish = Dish::create($validated);
        $dish->tags()->sync($tagIds);

        foreach ($images as $image) {
            $dish->images()->create([
                'url' => $image->store('dishes', 'public'),
            ]);
        }

        return response()->json(['success' => true, 'data' => $dish->load(['category', 'images', 'tags'])], 201);
    }

    public function update(Request $request, $id)
    {
        $dish = Dish::find($id);
        if (!$dish)
            return response()->json(['success' => false, 'message' => 'Not found'], 404);

        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'is_available' => 'boolean',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'exists:tags,id',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $images = $request->file('images', []);
        $shouldSyncTags = $request->has('tag_ids') || $request->has('tags');
        $tagIds = $validated['tag_ids'] ?? $validated['tags'] ?? [];
        unset($validated['tag_ids'], $validated['tags']);
        unset($validated['images']);

        $dish->update($validated);

        if ($shouldSyncTags) {
            $dish->tags()->sync($tagIds);
        }

        if (count($images) > 0) {
            foreach ($dish->images as $dishImage) {
                if ($dishImage->url) {
                    Storage::disk('public')->delete($dishImage->url);
                }
                $dishImage->delete();
            }

            foreach ($images as $image) {
                $dish->images()->create([
                    'url' => $image->store('dishes', 'public'),
                ]);
            }
        }

        return response()->json(['success' => true, 'data' => $dish->load(['category', 'images', 'tags'])]);
    }

    public function destroy($id)
    {
        $dish = Dish::find($id);
        if (!$dish)
            return response()->json(['success' => false, 'message' => 'Not found'], 404);
        foreach ($dish->images as $dishImage) {
            if ($dishImage->url) {
                Storage::disk('public')->delete($dishImage->url);
            }
        }
        $dish->delete();
        return response()->json(['success' => true, 'message' => 'Deleted successfully']);
    }
}
