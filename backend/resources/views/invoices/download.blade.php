@php
    $isOrder = $type === 'order';
    $customer = $invoiceable->user;
    $invoiceNumber = ($isOrder ? 'ORD' : 'RES') . '-' . str_pad((string) $invoiceable->id, 6, '0', STR_PAD_LEFT);
    $status = ucfirst(str_replace('_', ' ', $invoiceable->status ?? 'pending'));
    $logoSource = $logoPath ? 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath)) : null;
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{{ $isOrder ? 'Invoice' : 'Reservation' }} {{ $invoiceNumber }}</title>
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; color: #2d221a; font-family: DejaVu Sans, sans-serif; font-size: 13px; line-height: 1.5; }
        .page { padding: 36px; }
        .header { border-bottom: 2px solid #c8922a; padding-bottom: 22px; margin-bottom: 26px; }
        .brand { float: left; width: 50%; }
        .brand img { width: 82px; height: auto; margin-bottom: 10px; }
        .brand-name { font-size: 24px; font-weight: 700; color: #3a2416; }
        .invoice-meta { float: right; width: 42%; text-align: right; }
        .invoice-title { font-size: 28px; font-weight: 700; color: #c8922a; margin-bottom: 8px; }
        .clear { clear: both; }
        .muted { color: #7a6b5c; }
        .grid { width: 100%; margin-bottom: 24px; }
        .box { width: 48%; border: 1px solid #eadcc6; padding: 14px; vertical-align: top; }
        .box-title { color: #c8922a; font-size: 11px; font-weight: 700; letter-spacing: .05em; margin-bottom: 8px; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #faf5ec; color: #5a4635; font-size: 11px; letter-spacing: .04em; padding: 10px; text-align: left; text-transform: uppercase; }
        td { border-bottom: 1px solid #eadcc6; padding: 10px; vertical-align: top; }
        .right { text-align: right; }
        .summary { margin-top: 18px; width: 42%; margin-left: auto; }
        .summary td { border: 0; padding: 6px 0; }
        .summary .total td { border-top: 2px solid #c8922a; color: #3a2416; font-size: 16px; font-weight: 700; padding-top: 10px; }
        .badge { display: inline-block; border: 1px solid #c8922a; color: #8b641e; padding: 3px 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .footer { border-top: 1px solid #eadcc6; color: #7a6b5c; font-size: 11px; margin-top: 34px; padding-top: 14px; text-align: center; }
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
                <div class="muted">{{ $isOrder ? 'Restaurant service invoice' : 'Restaurant reservation confirmation' }}</div>
            </div>
            <div class="invoice-meta">
                <div class="invoice-title">{{ $isOrder ? 'Invoice' : 'Reservation' }}</div>
                <div><strong>No:</strong> {{ $invoiceNumber }}</div>
                <div><strong>Issued:</strong> {{ $issuedAt->format('Y-m-d H:i') }}</div>
                <div><strong>Status:</strong> <span class="badge">{{ $status }}</span></div>
            </div>
            <div class="clear"></div>
        </div>

        <table class="grid">
            <tr>
                <td class="box">
                    <div class="box-title">Billed to</div>
                    <strong>{{ $customer->name ?? 'Customer' }}</strong><br>
                    {{ $customer->email ?? 'No email' }}<br>
                    {{ $customer->phone_number ?? 'No phone number' }}<br>
                    {{ $customer->adress ?? '' }}
                </td>
                <td style="width: 4%; border: 0;"></td>
                <td class="box">
                    <div class="box-title">{{ $isOrder ? 'Order details' : 'Reservation details' }}</div>
                    @if ($isOrder)
                        <strong>Type:</strong> {{ ucfirst(str_replace('_', ' ', $invoiceable->order_type ?? 'order')) }}<br>
                        <strong>Created:</strong> {{ optional($invoiceable->created_at)->format('Y-m-d H:i') }}<br>
                        <strong>Payment:</strong> {{ $invoiceable->payment_method ?? 'Not specified' }}<br>
                        @if ($invoiceable->delivery_address)
                            <strong>Delivery:</strong> {{ $invoiceable->delivery_address }}<br>
                        @endif
                        @if ($invoiceable->table)
                            <strong>Table:</strong> {{ $invoiceable->table->name ?? $invoiceable->table->number ?? $invoiceable->table_id }}
                        @endif
                    @else
                        <strong>Date:</strong> {{ $invoiceable->reservation_date }}<br>
                        <strong>Time:</strong> {{ $invoiceable->start_time }} - {{ $invoiceable->end_time }}<br>
                        <strong>Guests:</strong> {{ $invoiceable->guests_number ?? 1 }}<br>
                        <strong>Table:</strong> {{ $invoiceable->table->name ?? $invoiceable->table->number ?? $invoiceable->table_id }}
                    @endif
                </td>
            </tr>
        </table>

        @if ($isOrder)
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th class="right">Qty</th>
                        <th class="right">Unit price</th>
                        <th class="right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($invoiceable->items as $item)
                        <tr>
                            <td>{{ $item->dish->name ?? 'Dish #' . $item->dish_id }}</td>
                            <td class="right">{{ $item->quantity }}</td>
                            <td class="right">{{ number_format((float) $item->price, 2) }} DH</td>
                            <td class="right">{{ number_format((float) $item->price * (int) $item->quantity, 2) }} DH</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
            <table class="summary">
                <tr>
                    <td>Subtotal</td>
                    <td class="right">{{ number_format((float) $invoiceable->total_price, 2) }} DH</td>
                </tr>
                <tr class="total">
                    <td>Total</td>
                    <td class="right">{{ number_format((float) $invoiceable->total_price, 2) }} DH</td>
                </tr>
            </table>
        @else
            <table>
                <thead>
                    <tr>
                        <th>Reservation</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Guests</th>
                        <th>Table</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{{ $invoiceNumber }}</td>
                        <td>{{ $invoiceable->reservation_date }}</td>
                        <td>{{ $invoiceable->start_time }} - {{ $invoiceable->end_time }}</td>
                        <td>{{ $invoiceable->guests_number ?? 1 }}</td>
                        <td>{{ $invoiceable->table->name ?? $invoiceable->table->number ?? $invoiceable->table_id }}</td>
                    </tr>
                </tbody>
            </table>
        @endif

        <div class="footer">Thank you for choosing SahaServe.</div>
    </div>
</body>
</html>
