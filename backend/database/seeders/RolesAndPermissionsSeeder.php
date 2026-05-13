<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    //whene update : php artisan migrate:fresh --seed
    public function run(): void
    {
        // reset cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // permissions
        $permissions = [
            'create-order',
            'view-orders',
            'confirm-order',
            'prepare-order',
            'mark-ready',
            'take-delivery',
            'mark-delivered',
            'create-dish',
            'update-dish',
            'delete-dish',
            'manage-users',
            'create-tag',
            'update-tag',
            'delete-tag',
            'view-tags'
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // roles
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $client = Role::firstOrCreate(['name' => 'client']);
        $server = Role::firstOrCreate(['name' => 'server']);
        $chef = Role::firstOrCreate(['name' => 'chef']);
        $delivery = Role::firstOrCreate(['name' => 'delivery']);

        // give permissions

        $admin->givePermissionTo(Permission::all());

        $client->givePermissionTo([
            'create-order'
        ]);

        $server->givePermissionTo([
            'view-orders',
            'confirm-order',
            'view-tags'
        ]);

        $chef->givePermissionTo([
            'view-orders',
            'prepare-order',
            'mark-ready',
            'create-tag',
            'update-tag',
            'delete-tag',
            'create-dish',
            'update-dish',
            'delete-dish',
            'view-tags'
        ]);

        $delivery->givePermissionTo([
            'view-orders',
            'take-delivery',
            'mark-delivered'
        ]);
    }
}
