@php
    $logoSource = $logoPath ? 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath)) : null;
    $title = match ($type) {
        'orders' => 'Orders Report',
        'reservations' => 'Reservations Report',
        default => 'Review Report',
    };
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{{ $title }} - {{ $date }}</title>
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; color: #2d221a; font-family: DejaVu Sans, sans-serif; font-size: 11px; line-height: 1.45; }
        .page { padding: 28px; }
        .header { border-bottom: 2px solid #c8922a; margin-bottom: 18px; padding-bottom: 16px; }
        .brand { float: left; width: 45%; }
        .brand img { width: 70px; margin-bottom: 8px; }
        .brand-name { color: #3a2416; font-size: 22px; font-weight: 700; }
        .meta { float: right; width: 50%; text-align: right; }
        .title { color: #c8922a; font-size: 27px; font-weight: 700; margin-bottom: 6px; }
        .clear { clear: both; }
        .muted { color: #7a6b5c; }
        .stats { margin-bottom: 18px; width: 100%; border-collapse: separate; border-spacing: 8px 0; }
        .stat { border: 1px solid #eadcc6; padding: 12px; background: #fffdf9; }
        .stat-label { color: #7a6b5c; font-size: 10px; font-weight: 700; text-transform: uppercase; }
        .stat-value { color: #3a2416; font-size: 18px; font-weight: 700; margin-top: 3px; }
        table.report { width: 100%; border-collapse: collapse; }
        .report th { background: #faf5ec; color: #5a4635; font-size: 10px; letter-spacing: .04em; padding: 8px; text-align: left; text-transform: uppercase; }
        .report td { border-bottom: 1px solid #eadcc6; padding: 8px; vertical-align: top; }
        .right { text-align: right; }
        .badge { border: 1px solid #c8922a; color: #8b641e; display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 7px; text-transform: uppercase; }
        .empty { border: 1px solid #eadcc6; color: #7a6b5c; padding: 18px; text-align: center; }
        .footer { border-top: 1px solid #eadcc6; color: #7a6b5c; font-size: 10px; margin-top: 22px; padding-top: 10px; text-align: center; }
    </style>
</head>
<body>
    <div class="page">
        <div class="header">
            <div class="brand">
                @if ($logoSource)
                    <img src="{{ $logoSource }}" alt="SahaServe logo">
                @endif
                <div class="brand-name">SahaServe</div>
                <div class="muted">Administrative report</div>
            </div>
            <div class="meta">
                <div class="title">{{ $title }}</div>
                <div><strong>Date:</strong> {{ $date }}</div>
                <div><strong>Generated:</strong> {{ $issuedAt->format('Y-m-d H:i') }}</div>
            </div>
            <div class="clear"></div>
        </div>

        @if ($type === 'orders')
            <table class="stats">
                <tr>
                    <td class="stat"><div class="stat-label">Orders</div><div class="stat-value">{{ $data['count'] }}</div></td>
                    <td class="stat"><div class="stat-label">Revenue</div><div class="stat-value">{{ number_format($data['revenue'], 2) }} DH</div></td>
                    <td class="stat"><div class="stat-label">Report date</div><div class="stat-value">{{ $date }}</div></td>
                </tr>
            </table>
            @if ($data['orders']->isEmpty())
                <div class="empty">No orders found for this day.</div>
            @else
                <table class="report">
                    <thead>
                        <tr>
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th class="right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($data['orders'] as $order)
                            <tr>
                                <td>#{{ $order->id }}</td>
                                <td><strong>{{ $order->user->name ?? 'Unknown' }}</strong><br>{{ $order->user->email ?? '' }}</td>
                                <td>
                                    @foreach ($order->items as $item)
                                        {{ $item->dish->name ?? 'Dish #' . $item->dish_id }} x{{ $item->quantity }}@if (!$loop->last), @endif
                                    @endforeach
                                </td>
                                <td>{{ ucfirst(str_replace('_', ' ', $order->order_type ?? 'order')) }}</td>
                                <td><span class="badge">{{ $order->status }}</span></td>
                                <td class="right">{{ number_format((float) $order->total_price, 2) }} DH</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endif
        @elseif ($type === 'reservations')
            <table class="stats">
                <tr>
                    <td class="stat"><div class="stat-label">Reservations</div><div class="stat-value">{{ $data['count'] }}</div></td>
                    <td class="stat"><div class="stat-label">Guests</div><div class="stat-value">{{ $data['guests'] }}</div></td>
                    <td class="stat"><div class="stat-label">Report date</div><div class="stat-value">{{ $date }}</div></td>
                </tr>
            </table>
            @if ($data['reservations']->isEmpty())
                <div class="empty">No reservations found for this day.</div>
            @else
                <table class="report">
                    <thead>
                        <tr>
                            <th>Reservation</th>
                            <th>Guest</th>
                            <th>Table</th>
                            <th>Time</th>
                            <th>Guests</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($data['reservations'] as $reservation)
                            <tr>
                                <td>#{{ $reservation->id }}</td>
                                <td><strong>{{ $reservation->user->name ?? 'Guest' }}</strong><br>{{ $reservation->user->phone_number ?? $reservation->user->email ?? '' }}</td>
                                <td>{{ $reservation->table->name ?? $reservation->table->number ?? $reservation->table_id }}</td>
                                <td>{{ $reservation->start_time }} - {{ $reservation->end_time }}</td>
                                <td>{{ $reservation->guests_number ?? 1 }}</td>
                                <td><span class="badge">{{ $reservation->status }}</span></td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endif
        @else
            <table class="stats">
                <tr>
                    <td class="stat"><div class="stat-label">Reviews</div><div class="stat-value">{{ $data['count'] }}</div></td>
                    <td class="stat"><div class="stat-label">Average rating</div><div class="stat-value">{{ number_format($data['averageRating'], 1) }}/5</div></td>
                    <td class="stat"><div class="stat-label">Sentiment mix</div><div class="stat-value">{{ $data['positive'] }}+ / {{ $data['neutral'] }}= / {{ $data['negative'] }}-</div></td>
                </tr>
            </table>
            @if ($data['reviews']->isEmpty())
                <div class="empty">No reviews found for this day.</div>
            @else
                <table class="report">
                    <thead>
                        <tr>
                            <th>Review</th>
                            <th>Customer</th>
                            <th>Dish</th>
                            <th>Rating</th>
                            <th>Comment</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($data['reviews'] as $review)
                            <tr>
                                <td>#{{ $review->id }}</td>
                                <td>{{ $review->user->name ?? 'Customer' }}</td>
                                <td>{{ $review->dish->name ?? 'Dish #' . $review->dish_id }}</td>
                                <td>{{ $review->rating }}/5</td>
                                <td>{{ $review->comment ?: 'No comment' }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endif
        @endif

        <div class="footer">SahaServe admin report. Generated by the backend PDF service.</div>
    </div>
</body>
</html>
