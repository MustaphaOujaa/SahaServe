<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dishes extends Model
{
    public function cartItems()
    {
        return $this->hasMany(Cart_items::class);
    }

    public function orderItems()
    {
        return $this->hasMany(Order_items::class);
    }

    public function category()
    {
        return $this->belongsTo(Categories::class);
    }

    public function images()
    {
        return $this->hasMany(Dish_image::class);
    }

    public function favoriteItems()
    {
        return $this->hasMany(Favorite_items::class);
    }

    public function reviews()
    {
        return $this->hasMany(Reviews::class);
    }
}
