<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('order_type', ['home_delivery', 'on_site'])->default('home_delivery')->after('status');
            $table->string('delivery_address')->nullable()->after('order_type');
            $table->foreignId('table_id')->nullable()->constrained('tables')->nullOnDelete()->after('delivery_address');
            $table->string('payment_method')->nullable()->after('table_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['table_id']);
            $table->dropColumn(['order_type', 'delivery_address', 'table_id', 'payment_method']);
        });
    }
};
