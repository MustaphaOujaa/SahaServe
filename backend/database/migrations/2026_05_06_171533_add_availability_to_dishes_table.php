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
        if (!Schema::hasColumn('dishes', 'is_available')) {
            Schema::table('dishes', function (Blueprint $table) {
                $table->boolean("is_available")->default(true);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('dishes', 'is_available')) {
            Schema::table('dishes', function (Blueprint $table) {
                $table->dropColumn("is_available");
            });
        }
    }
};
