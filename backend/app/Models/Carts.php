<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Carts extends Model
{
    public function users()
    {
        return $this->belongsTo(User::class);
    }
    public function items()
    {
        return $this->hasMany(Cart_items::class);
    }
}
