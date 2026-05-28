<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Get the server role
        $serverRole = Role::where('name', 'server')->where('guard_name', 'sanctum')->first();
        if ($serverRole) {
            $serverRole->givePermissionTo([
                'manage-tables',
                'mark-delivered'
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Optionally revoke permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        $serverRole = Role::where('name', 'server')->where('guard_name', 'sanctum')->first();
        if ($serverRole) {
            $serverRole->revokePermissionTo([
                'manage-tables',
                'mark-delivered'
            ]);
        }
    }
};
