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
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { color: #2d221a; font-family: DejaVu Sans, sans-serif; font-size: 12px; line-height: 1.5; }
        .page { padding: 36px; }

        /* ── Header ── */
        .header-table { width: 100%; border-bottom: 2px solid #c8922a; padding-bottom: 18px; margin-bottom: 24px; }
        .brand-name { font-size: 22px; font-weight: 700; color: #3a2416; margin-top: 6px; }
        .brand-sub { color: #7a6b5c; font-size: 11px; }
        .invoice-title { font-size: 26px; font-weight: 700; color: #c8922a; }
        .invoice-meta-line { font-size: 11px; margin-top: 3px; }
        .badge { border: 1px solid #c8922a; color: #8b641e; padding: 2px 7px; font-size: 10px; font-weight: 700; text-transform: uppercase; }

        /* ── Info boxes ── */
        .info-table { width: 100%; margin-bottom: 22px; }
        .info-box { width: 48%; border: 1px solid #eadcc6; padding: 12px; vertical-align: top; }
        .info-spacer { width: 4%; }
        .box-title { color: #c8922a; font-size: 10px; font-weight: 700; letter-spacing: .05em; margin-bottom: 7px; text-transform: uppercase; }

        /* ── Items table ── */
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        .items-table th { background: #faf5ec; color: #5a4635; font-size: 10px; letter-spacing: .04em; padding: 9px 10px; text-align: left; text-transform: uppercase; }
        .items-table td { border-bottom: 1px solid #eadcc6; padding: 9px 10px; vertical-align: top; }
        .right { text-align: right; }

        /* ── Summary ── */
        .summary-wrap { width: 100%; }
        .summary-table { width: 42%; margin-left: auto; border-collapse: collapse; }
        .summary-table td { padding: 5px 0; border: 0; }
        .summary-total td { border-top: 2px solid #c8922a; color: #3a2416; font-size: 15px; font-weight: 700; padding-top: 9px; }

        /* ── Footer ── */
        .footer { border-top: 1px solid #eadcc6; color: #7a6b5c; font-size: 10px; margin-top: 32px; padding-top: 12px; text-align: center; }
    </style>
</head>
<body>
    <div class="page">

        {{-- ── HEADER ── --}}
        <table class="header-table" cellpadding="0" cellspacing="0">
            <tr>
                <td style="width:50%; vertical-align:top;">
                    @if ($logoSource)
                        <img src="{{ $logoSource }}" alt="SahaServe logo" style="width:72px; height:auto; margin-bottom:6px;">
                    @endif
                    <div class="brand-name">SahaServe</div>
                    <div class="brand-sub">{{ $isOrder ? 'Restaurant service invoice' : 'Restaurant reservation confirmation' }}</div>
                </td>
                <td style="width:50%; vertical-align:top; text-align:right;">
                    <div class="invoice-title">{{ $isOrder ? 'INVOICE' : 'RESERVATION' }}</div>
                    <div class="invoice-meta-line"><strong>No:</strong> {{ $invoiceNumber }}</div>
                    <div class="invoice-meta-line"><strong>Issued:</strong> {{ $issuedAt->format('Y-m-d H:i') }}</div>
                    <div class="invoice-meta-line"><strong>Status:</strong> <span class="badge">{{ $status }}</span></div>
                </td>
            </tr>
        </table>

        {{-- ── INFO BOXES ── --}}
        <table class="info-table" cellpadding="0" cellspacing="0">
            <tr>
                <td class="info-box">
                    <div class="box-title">Billed to</div>
                    <strong>{{ $customer->name ?? 'Customer' }}</strong><br>
                    {{ $customer->email ?? 'No email' }}<br>
                    {{ $customer->phone_number ?? 'No phone' }}<br>
                    {{ $customer->adress ?? '' }}
                </td>
                <td class="info-spacer"></td>
                <td class="info-box">
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

        {{-- ── ITEMS ── --}}
        @if ($isOrder)
            <table class="items-table">
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

            <table class="summary-table">
                <tr>
                    <td>Subtotal</td>
                    <td class="right">{{ number_format((float) $invoiceable->total_price, 2) }} DH</td>
                </tr>
                <tr class="summary-total">
                    <td><strong>Total</strong></td>
                    <td class="right"><strong>{{ number_format((float) $invoiceable->total_price, 2) }} DH</strong></td>
                </tr>
            </table>
        @else
            <table class="items-table">
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
