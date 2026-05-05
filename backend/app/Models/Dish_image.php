<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dish_image extends Model
{
    public function dish()
    {
        return $this->belongsTo(Dishes::class);
    }
}
