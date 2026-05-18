<?php

namespace App\Http\Controllers\AI;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Illuminate\Http\Request;

class FeedbackController extends Controller
{
    /**
     * Display a listing of the daily AI feedbacks.
     */
    public function index(Request $request)
    {
        // Fetch feedbacks, ordered by most recent analysis date
        $feedbacks = Feedback::orderBy('analyzed_at', 'desc')->paginate(10);

        return response()->json([
            'status' => 'success',
            'data' => $feedbacks
        ]);
    }

    /**
     * Display the specified daily AI feedback.
     */
    public function show($id)
    {
        $feedback = Feedback::find($id);

        if (!$feedback) {
            return response()->json([
                'status' => 'error',
                'message' => 'Feedback analysis not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $feedback
        ]);
    }
}
