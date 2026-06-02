<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Reservation;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function order(Request $request, int $id)
    {
        $order = Order::with(['user', 'items.dish', 'table'])->findOrFail($id);

        $this->authorizeOwner($request, $order->user_id);

        return $this->download('order', $order, "invoice-order-{$order->id}.pdf");
    }

    public function reservation(Request $request, int $id)
    {
        $reservation = Reservation::with(['user', 'table'])->findOrFail($id);

        $this->authorizeOwner($request, $reservation->user_id);

        return $this->download('reservation', $reservation, "invoice-reservation-{$reservation->id}.pdf");
    }

    private function authorizeOwner(Request $request, int $ownerId): void
    {
        abort_unless((int) $request->user()->id === $ownerId, 403, 'You can only download your own invoices.');
    }

    private function download(string $type, Order|Reservation $invoiceable, string $filename)
    {
        $logo = public_path('images/logo.png');

        $pdf = Pdf::loadView('invoices.download', [
            'type' => $type,
            'invoiceable' => $invoiceable,
            'logoPath' => file_exists($logo) ? $logo : null,
            'issuedAt' => now(),
        ])->setPaper('a4');

        return $pdf->download($filename);
    }
}
