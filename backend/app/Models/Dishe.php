<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dishe extends Model
{
    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function images()
    {
        return $this->hasMany(DisheImage::class);
    }

    public function favoriteItems()
    {
        return $this->hasMany(FavoriteItem::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
