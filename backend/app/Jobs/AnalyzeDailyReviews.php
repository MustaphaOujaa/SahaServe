<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use App\Models\Review;
use App\Models\Feedback;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;

class AnalyzeDailyReviews implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // $reviews = Review::whereDate('created_at', Carbon::today())->get();
        $reviews = Review::take(10)->get();

        if ($reviews->isEmpty()) {
            return;
        }

        $reviewsData = $reviews->map(function ($review) {
            return [
                'id' => $review->id,
                'rating' => $review->rating,
                'comment' => $review->comment,
            ];
        })->toArray();

        $aiServiceUrl = env('AI_SERVICE_URL');

        $response = Http::post($aiServiceUrl, [
            'reviews' => $reviewsData
        ]);

        if ($response->successful()) {
            $aiData = $response->json();

            Feedback::create([
                'sentiment' => $aiData['sentiment'] ?? 'neutral',
                'confidence' => $aiData['confidence'] ?? 0.0,
                'aspects' => $aiData['aspects'] ?? [],
                'key_points' => $aiData['key_points'] ?? [],
                'main_issue' => $aiData['main_issue'] ?? null,
                'category' => $aiData['category'] ?? 'general',
                'business_insight' => $aiData['business_insight'] ?? [],
                'severity_score' => $aiData['severity_score'] ?? 0.0,
                'reviews_count' => $reviews->count(),
                'analyzed_at' => Carbon::today(),
            ]);
        } else {
            \Illuminate\Support\Facades\Log::error('AI Service failed to analyze daily reviews', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);
        }
    }
}
