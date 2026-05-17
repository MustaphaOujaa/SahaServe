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
        Schema::create('feedbacks', function (Blueprint $table) {
            $table->id();
            $table->string('sentiment');
            $table->float('confidence');

            $table->json('aspects');
            $table->json('key_points');

            $table->string('main_issue')->nullable();
            $table->string('category');
            $table->json('business_insight');

            $table->float('severity_score');
            $table->integer('reviews_count');
            $table->date('analyzed_at');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feedbacks');
    }
};
