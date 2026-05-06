<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    public function dish()
    {
        return $this->belongsTo(Dishe::class);
    }
}
