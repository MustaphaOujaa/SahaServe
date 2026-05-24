<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Table;
use Illuminate\Http\Request;

class TableController extends Controller
{
    /**
     * Display a listing of the tables.
     */
    public function index(Request $request)
    {
        $tables = Table::when($request->boolean('available'), function ($query) {
            $query->where('is_available', true);
        })->get();

        return response()->json([
            'success' => true,
            'data' => $tables
        ]);
    }

    /**
     * Store a newly created table in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'number' => 'required|integer|unique:tables,number',
            'capacity' => 'required|integer|min:1',
            'is_available' => 'boolean',
        ]);

        $table = Table::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Table created successfully',
            'data' => $table
        ], 201);
    }

    /**
     * Display the specified table.
     */
    // public function show($id)
    // {
    //     $table = Table::findOrFail($id);
    //     return response()->json([
    //         'success' => true,
    //         'data' => $table
    //     ]);
    // }

    /**
     * Update the specified table in storage.
     */
    public function update(Request $request, $id)
    {
        $table = Table::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'number' => 'sometimes|required|integer|unique:tables,number,' . $id,
            'capacity' => 'sometimes|required|integer|min:1',
            'is_available' => 'sometimes|boolean',
        ]);

        $table->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Table updated successfully',
            'data' => $table
        ]);
    }

    /**
     * Remove the specified table from storage.
     */
    public function destroy($id)
    {
        $table = Table::findOrFail($id);
        $table->delete();

        return response()->json([
            'success' => true,
            'message' => 'Table deleted successfully'
        ]);
    }

    /**
     * Toggle the availability of the specified table.
     */
    //     public function changeAvailablity($id)
//     {
//         $table = Table::findOrFail($id);
//         $table->is_available = !$table->is_available;
//         $table->save();

    //         return response()->json([
//             'success' => true,
//             'message' => 'Table availability updated',
//             'data' => $table
//         ]);
//     }
}
