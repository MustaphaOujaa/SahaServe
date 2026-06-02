<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Reservation;
use App\Models\Review;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminReportController extends Controller
{
    public function download(Request $request)
    {
        $validated = $request->validate([
            'type' => ['required', Rule::in(['orders', 'reservations', 'review-analysis'])],
            'date' => ['required', 'date'],
        ]);

        $type = $validated['type'];
        $date = $validated['date'];
        $logo = public_path('images/logo.png');

        $data = match ($type) {
            'orders' => $this->ordersData($date),
            'reservations' => $this->reservationsData($date),
            'review-analysis' => $this->reviewsData($date),
        };

        $pdf = Pdf::loadView('reports.admin', [
            'type' => $type,
            'date' => $date,
            'data' => $data,
            'logoPath' => file_exists($logo) ? $logo : null,
            'issuedAt' => now(),
        ])->setPaper('a4', 'landscape');

        return $pdf->download("{$type}-{$date}.pdf");
    }

    private function ordersData(string $date): array
    {
        $orders = Order::with(['user:id,name,email', 'items.dish:id,name', 'table:id,name,number'])
            ->whereDate('created_at', $date)
            ->latest()
            ->get();

        return [
            'orders' => $orders,
            'count' => $orders->count(),
            'revenue' => $orders->sum(fn ($order) => (float) $order->total_price),
        ];
    }

    private function reservationsData(string $date): array
    {
        $reservations = Reservation::with(['user:id,name,email,phone_number', 'table:id,name,number,capacity'])
            ->whereDate('reservation_date', $date)
            ->orderBy('start_time')
            ->get();

        return [
            'reservations' => $reservations,
            'count' => $reservations->count(),
            'guests' => $reservations->sum(fn ($reservation) => (int) ($reservation->guests_number ?? 0)),
        ];
    }

    private function reviewsData(string $date): array
    {
        $reviews = Review::with(['user:id,name,email', 'dish:id,name'])
            ->whereDate('created_at', $date)
            ->latest()
            ->get();

        $averageRating = $reviews->count() ? round($reviews->avg('rating'), 1) : 0;
        $positive = $reviews->where('rating', '>=', 4)->count();
        $neutral = $reviews->where('rating', 3)->count();
        $negative = $reviews->where('rating', '<=', 2)->count();

        return [
            'reviews' => $reviews,
            'count' => $reviews->count(),
            'averageRating' => $averageRating,
            'positive' => $positive,
            'neutral' => $neutral,
            'negative' => $negative,
        ];
    }
}
