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
        Schema::table('users', function (Blueprint $table) {
            $table->string('delivery_status')->default('inactive')->after('avatar');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->string('delivery_status')->default('pending')->after('delivery_worker_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('delivery_status');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('delivery_status');
        });
    }
};
