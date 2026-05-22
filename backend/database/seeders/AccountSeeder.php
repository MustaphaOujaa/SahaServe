<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;

class AccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Clear permission cache first to prevent old guard issues
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Admin account
        $admin = User::firstOrCreate(
            ['email' => "admin@email.com"],
            [
                'name' => "admin",
                'adress' => "SahaServe",
                'phone_number' => "0676345678",
                'password' => bcrypt('admin123')
            ]
        );
        // Explicitly look for the 'admin' role belonging to 'sanctum'
        $admin->assignRole(Role::findByName('admin', 'sanctum'));

        // Chef account
        $chef = User::firstOrCreate(
            ['email' => "chef@email.com"],
            [
                'name' => "chef",
                'adress' => "SahaServe",
                'phone_number' => "0676376347",
                'password' => bcrypt('chef123')
            ]
        );
        $chef->assignRole(Role::findByName('chef', 'sanctum'));

        // Server account
        $server = User::firstOrCreate(
            ['email' => "server@email.com"],
            [
                'name' => "server",
                'adress' => "SahaServe",
                'phone_number' => "0634567876",
                'password' => bcrypt('server123')
            ]
        );
        $server->assignRole(Role::findByName('server', 'sanctum'));

        // Delivery account
        $delivery = User::firstOrCreate(
            ['email' => "delivery@email.com"],
            [
                'name' => "delivery",
                'adress' => "SahaServe",
                'phone_number' => "0663456780",
                'password' => bcrypt('delivery123')
            ]
        );
        $delivery->assignRole(Role::findByName('delivery', 'sanctum'));

        // client account
        $client = User::firstOrCreate(
            ['email' => "client@email.com"],
            [
                'name' => "client",
                'adress' => "SahaServe",
                'phone_number' => "0667936093",
                'password' => bcrypt('user123')
            ]
        );
        $client->assignRole(Role::findByName('client', 'sanctum'));
    }
}