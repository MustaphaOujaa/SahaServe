<?php

namespace Database\Seeders;

use App\Models\Table;
use Illuminate\Database\Seeder;

class TableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tables = [
            [
                'name' => 'Table 1',
                'number' => 1,
                'capacity' => 2,
                'is_available' => true,
            ],
            [
                'name' => 'Table 2',
                'number' => 2,
                'capacity' => 2,
                'is_available' => true,
            ],
            [
                'name' => 'Table 3',
                'number' => 3,
                'capacity' => 4,
                'is_available' => true,
            ],
            [
                'name' => 'Table 4',
                'number' => 4,
                'capacity' => 4,
                'is_available' => true,
            ],
            [
                'name' => 'Table 5',
                'number' => 5,
                'capacity' => 4,
                'is_available' => true,
            ],
            [
                'name' => 'Table 6',
                'number' => 6,
                'capacity' => 6,
                'is_available' => true,
            ],
            [
                'name' => 'Table 7',
                'number' => 7,
                'capacity' => 6,
                'is_available' => false, // booked or temporarily unavailable
            ],
            [
                'name' => 'Terrace View 1',
                'number' => 8,
                'capacity' => 4,
                'is_available' => true,
            ],
            [
                'name' => 'VIP Lounge 1',
                'number' => 9,
                'capacity' => 8,
                'is_available' => true,
            ],
            [
                'name' => 'VIP Lounge 2',
                'number' => 10,
                'capacity' => 8,
                'is_available' => true,
            ],
        ];

        foreach ($tables as $table) {
            Table::create($table);
        }
    }
}
