<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order_items extends Model
{
    public function order()
    {
        return $this->belongsTo(Orders::class);
    }
    
    public function dish()
    {
        return $this->belongsTo(Dishes::class);
    }
}
