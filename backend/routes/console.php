<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Models\Dish;
use App\Models\Table;
use App\Events\OrderPlaced;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('order:mock {type=on_site} {status=confirmed}', function () {
    $type = $this->argument('type');
    $status = $this->argument('status');
    
    // Find first client user
    $user = User::whereHas('roles', function($q) { $q->where('name', 'client'); })->first()
        ?? User::first();
        
    if (!$user) {
        $this->error('No users found in database. Please run seeders first.');
        return;
    }
    
    // Find first available table if type is on_site
    $table = null;
    if ($type === 'on_site') {
        $table = Table::where('is_available', true)->first();
        if (!$table) {
            $table = Table::first();
        }
    }
    
    // Find a dish
    $dish = Dish::first();
    if (!$dish) {
        $this->error('No dishes found in database. Please run seeders first.');
        return;
    }
    
    // Create order
    $order = Order::create([
        'user_id' => $user->id,
        'status' => $status,
        'total_price' => $dish->price * 2,
        'order_type' => $type,
        'table_id' => $table ? $table->id : null,
        'delivery_address' => $type === 'home_delivery' ? '123 Test Street' : null,
        'payment_method' => 'cash',
    ]);
    
    // Create order item
    OrderItem::create([
        'order_id' => $order->id,
        'dish_id' => $dish->id,
        'quantity' => 2,
        'price' => $dish->price,
    ]);
    
    $order->load('user', 'items.dish', 'table');
    
    // Broadcast event
    broadcast(new OrderPlaced($order));
    
    $this->info("Mock order #{$order->id} created successfully! (Type: {$type}, Status: {$status})");
})->purpose('Create a mock order for testing dashboards');

