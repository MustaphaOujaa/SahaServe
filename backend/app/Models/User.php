<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasRoles, HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    protected $guard_name = 'sanctum';

    protected $fillable = [
        "name",
        "email",
        "password",
        "adress",
        "phone_number",
        "image",
        "avatar",
        "delivery_status",
        "google_id",
        "email_verified_at",
    ];

    protected $hidden = [
        "password",
        "remember_token",
    ];

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function cart()
    {
        return $this->hasOne(Cart::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function favoriteDishes()
    {
        return $this->belongsToMany(Dish::class, 'favorites');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function otp()
    {
        return $this->hasMany(EmailOtp::class);
    }
}
