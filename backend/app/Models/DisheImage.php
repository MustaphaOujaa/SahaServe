<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DisheImage extends Model
{
    public function dish()
    {
        return $this->belongsTo(Dishe::class);
    }
}
