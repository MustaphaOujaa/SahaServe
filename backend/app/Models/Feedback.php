<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    protected $fillable = [
        'sentiment',
        'confidence',
        'aspects',
        'key_points',
        'main_issue',
        'category',
        'business_insight',
        'severity_score',
        'reviews_count',
        'analyzed_at',
    ];


    protected $casts = [
        'aspects' => 'array',
        'key_points' => 'array',
        'business_insight' => 'array',
        'analyzed_at' => 'date',
    ];
}
