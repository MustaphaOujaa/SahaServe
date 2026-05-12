<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    public function dishes()
    {
        $this->belongsToMany(Dish::class);
    }
}
