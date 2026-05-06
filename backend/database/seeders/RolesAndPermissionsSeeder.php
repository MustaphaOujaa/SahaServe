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
            'manage-menu',
            'manage-users'
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // roles
        $admin = Role::create(['name' => 'admin']);
        $client = Role::create(['name' => 'client']);
        $server = Role::create(['name' => 'server']);
        $chef = Role::create(['name' => 'chef']);
        $delivery = Role::create(['name' => 'delivery']);

        // give permissions

        $admin->givePermissionTo(Permission::all());

        $client->givePermissionTo([
            'create-order'
        ]);

        $server->givePermissionTo([
            'view-orders',
            'confirm-order'
        ]);

        $chef->givePermissionTo([
            'view-orders',
            'prepare-order',
            'mark-ready'
        ]);

        $delivery->givePermissionTo([
            'view-orders',
            'take-delivery',
            'mark-delivered'
        ]);
    }
}
