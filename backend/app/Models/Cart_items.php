<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cart_items extends Model
{
    public function cart()
    {
        return $this->belongsTo(Carts::class);
    }

    public function dish()
    {
        return $this->belongsTo(Dishes::class);
    }
}
