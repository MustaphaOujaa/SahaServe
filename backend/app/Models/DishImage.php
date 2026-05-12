<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DishImage extends Model
{
    public function dish()
    {
        return $this->belongsTo(Dish::class);
    }
}
