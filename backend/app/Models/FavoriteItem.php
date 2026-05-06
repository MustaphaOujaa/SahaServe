<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FavoriteItem extends Model
{
    public function favorite()
    {
        return $this->belongsTo(Favorite::class);
    }

    public function dish()
    {
        return $this->belongsTo(Dishe::class);
    }
}
