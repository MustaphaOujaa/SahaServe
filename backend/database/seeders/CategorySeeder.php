<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Tagines',
                'image' => 'images/categories/tagine.png',
            ],
            [
                'name' => 'Couscous',
                'image' => 'images/categories/couscous.png',
            ],
            [
                'name' => 'Appetizers',
                'image' => 'images/categories/appetizer.png',
            ],
            [
                'name' => 'Desserts',
                'image' => 'images/categories/dessert.png',
            ],
            [
                'name' => 'Drinks',
                'image' => 'images/categories/drink.png',
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
