<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(['success' => true, 'data' => Category::all()]);
    }

    public function show($id)
    {
        $category = Category::with('dishes')->find($id);
        if (!$category) return response()->json(['success' => false, 'message' => 'Not found'], 404);
        return response()->json(['success' => true, 'data' => $category]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
        ]);
        $category = Category::create($validated);
        return response()->json(['success' => true, 'data' => $category], 201);
    }

    public function update(Request $request, $id)
    {
        $category = Category::find($id);
        if (!$category) return response()->json(['success' => false, 'message' => 'Not found'], 404);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
        ]);
        $category->update($validated);
        return response()->json(['success' => true, 'data' => $category]);
    }

    public function destroy($id)
    {
        $category = Category::find($id);
        if (!$category) return response()->json(['success' => false, 'message' => 'Not found'], 404);
        $category->delete();
        return response()->json(['success' => true, 'message' => 'Deleted successfully']);
    }
}
