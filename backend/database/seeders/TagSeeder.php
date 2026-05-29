<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tags = [
            ['name' => 'Vegetarian'],
            ['name' => 'Spicy'],
            ['name' => 'Gluten-Free'],
            ['name' => 'Traditional'],
            ['name' => 'Chef\'s Special'],
        ];

        foreach ($tags as $tag) {
            Tag::create($tag);
        }
    }
}
