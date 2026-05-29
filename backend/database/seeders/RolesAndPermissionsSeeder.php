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
            'manage-orders',
            'manage-reservation',
            'manage-tables',
            'take-delivery',
            'mark-delivered',
            'manage-dishs',
            'manage-dishes',
            'manage-users',
            'manage-tags',
            'manage-categories',
            'manage-reviews',
            'manage-roles',
            'make-reservation',
            'make-order',
            'mark-ready'
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'sanctum'
            ]);
        }

        // roles
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'sanctum']);
        $client = Role::firstOrCreate(['name' => 'client', 'guard_name' => 'sanctum']);
        $server = Role::firstOrCreate(['name' => 'server', 'guard_name' => 'sanctum']);
        $chef = Role::firstOrCreate(['name' => 'chef', 'guard_name' => 'sanctum']);
        $delivery = Role::firstOrCreate(['name' => 'delivery', 'guard_name' => 'sanctum']);

        // give permissions

        $admin->givePermissionTo(Permission::all());

        $client->givePermissionTo([
            'make-order',
            'make-reservation',
        ]);

        $server->givePermissionTo([
            'manage-orders',
            'manage-tags',
            'manage-tables',
            'mark-delivered'
        ]);

        $chef->givePermissionTo([
            'manage-orders',
            'mark-ready',
            'manage-dishs',
            'manage-dishes',
            'manage-tags',
        ]);

        $delivery->givePermissionTo([
            'take-delivery',
            'mark-delivered'
        ]);
    }
}
