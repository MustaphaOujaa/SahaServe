<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use App\Models\Tag;

class TagController extends Controller
{
    public function index()
    {
        $perPage = min((int) request()->query('per_page', 10), 100);
        $tags = Tag::simplePaginate($perPage);

        return response()->json([
            "status" => "success",
            "data" => $tags
        ], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            "name" => "string|required"
        ]);

        $newTag = Tag::create($request->only([
            "name"
        ]));

        return response()->json([
            "status" => "success",
            "data" => $newTag
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $tag = Tag::find($id);

        $request->validate([
            "name" => "string|required"
        ]);

        if (!$tag) {
            return response()->json([
                "status" => "failed",
                "message" => "tag not found !"
            ], 404);
        }

        $tag->update($request->only([
            "name"
        ]));

        return response()->json([
            "status" => "success",
            "message" => "tag has been updated seccussfuly!"
        ]);
    }

    public function destroy($id)
    {
        $tag = Tag::find($id);

        if (!$tag) {
            return response()->json([
                "status" => "failed",
                "message" => "tag not found !"
            ], 404);
        }

        $tag->delete();

        return response()->json([
            "status" => "success",
            "message" => "tag has been deleted successfuly"
        ]);
    }

}
