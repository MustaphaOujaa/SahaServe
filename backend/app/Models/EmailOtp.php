<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailOtp extends Model
{
    protected $fillable = ["email", "otp", "user_id", "expires_at"];
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
