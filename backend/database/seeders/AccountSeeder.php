<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;

class AccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //Admin account
        $admin = User::firstOrCreate(
            ['email' => "admin@email.com"],
            [
                'name' => "admin",
                'adress' => "SahaServe",
                'phone_number' => "0676345678",
                'password' => bcrypt('admin123')
            ]
        );
        $admin->assignRole('admin');

        //Chef account
        $chef = User::firstOrCreate(
            ['email' => "chef@email.com"],
            [
                'name' => "chef",
                'adress' => "SahaServe",
                'phone_number' => "0676376347",
                'password' => bcrypt('chef123')
            ]
        );
        $chef->assignRole('chef');

        //Server account
        $server = User::firstOrCreate(
            ['email' => "server@email.com"],
            [
                'name' => "server",
                'adress' => "SahaServe",
                'phone_number' => "0634567876",
                'password' => bcrypt('server123')
            ]
        );
        $server->assignRole('server');

        //Delivery account
        $delivery = User::firstOrCreate(
            ['email' => "delivery@email.com"],
            [
                'name' => "delivery",
                'adress' => "SahaServe",
                'phone_number' => "0663456780",
                'password' => bcrypt('delivery123')
            ]
        );
        $delivery->assignRole('delivery');

    }
}
