<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Dish;
use App\Models\Tag;
use Illuminate\Database\Seeder;

class DishSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get categories
        $tagines = Category::where('name', 'Tagines')->first();
        $couscous = Category::where('name', 'Couscous')->first();
        $appetizers = Category::where('name', 'Appetizers')->first();
        $desserts = Category::where('name', 'Desserts')->first();
        $drinks = Category::where('name', 'Drinks')->first();

        // Get tags
        $vegetarian = Tag::where('name', 'Vegetarian')->first();
        $spicy = Tag::where('name', 'Spicy')->first();
        $glutenFree = Tag::where('name', 'Gluten-Free')->first();
        $traditional = Tag::where('name', 'Traditional')->first();
        $chefsSpecial = Tag::where('name', 'Chef\'s Special')->first();

        $dishes = [
            [
                'dish' => [
                    'category_id' => $tagines->id,
                    'name' => 'Chicken Tagine with Preserved Lemons & Olives',
                    'description' => 'A classic Moroccan dish slow-cooked to perfection with tender chicken, cured lemons, green olives, and saffron.',
                    'price' => 120.00,
                    'is_available' => true,
                ],
                'tags' => [$traditional, $chefsSpecial]
            ],
            [
                'dish' => [
                    'category_id' => $tagines->id,
                    'name' => 'Lamb Tagine with Prunes & Almonds',
                    'description' => 'Slow-cooked tender lamb infused with sweet prunes, crunchy toasted almonds, sesame seeds, and cinnamon.',
                    'price' => 140.00,
                    'is_available' => true,
                ],
                'tags' => [$traditional]
            ],
            [
                'dish' => [
                    'category_id' => $couscous->id,
                    'name' => 'Royal Couscous',
                    'description' => 'Fine steamed semolina topped with a variety of fresh vegetables, tender lamb, chicken, and spicy merguez sausages.',
                    'price' => 150.00,
                    'is_available' => true,
                ],
                'tags' => [$traditional, $chefsSpecial, $spicy]
            ],
            [
                'dish' => [
                    'category_id' => $couscous->id,
                    'name' => 'Vegetarian Couscous',
                    'description' => 'Light steamed semolina served with a rich, aromatic broth loaded with seasonal garden vegetables and sweet caramelized onions (Tfaya).',
                    'price' => 110.00,
                    'is_available' => true,
                ],
                'tags' => [$vegetarian, $traditional]
            ],
            [
                'dish' => [
                    'category_id' => $appetizers->id,
                    'name' => 'Moroccan Beef Briouates',
                    'description' => 'Golden, crispy triangular pastries filled with savory minced beef, fragrant herbs, and spices.',
                    'price' => 65.00,
                    'is_available' => true,
                ],
                'tags' => [$traditional]
            ],
            [
                'dish' => [
                    'category_id' => $appetizers->id,
                    'name' => 'Zaalouk & Taktouka Salad Duo',
                    'description' => 'A popular Moroccan appetizer featuring smoky roasted eggplant (Zaalouk) and bell pepper-tomato dip (Taktouka), served with fresh crusty bread.',
                    'price' => 50.00,
                    'is_available' => true,
                ],
                'tags' => [$vegetarian, $traditional]
            ],
            [
                'dish' => [
                    'category_id' => $appetizers->id,
                    'name' => 'Harira Soup',
                    'description' => 'A hearty, comforting Moroccan soup made with tomatoes, lentils, chickpeas, fresh herbs, and lamb, spiced with ginger and cinnamon.',
                    'price' => 45.00,
                    'is_available' => true,
                ],
                'tags' => [$traditional]
            ],
            [
                'dish' => [
                    'category_id' => $desserts->id,
                    'name' => 'Sweet Jawhara Pastilla',
                    'description' => 'Crispy layers of warka pastry stacked with cool, sweet orange blossom pastry cream and crushed toasted almonds.',
                    'price' => 55.00,
                    'is_available' => true,
                ],
                'tags' => [$chefsSpecial, $traditional]
            ],
            [
                'dish' => [
                    'category_id' => $desserts->id,
                    'name' => 'Gazelle Horns (Cornes de Gazelle)',
                    'description' => 'Traditional Moroccan crescent-shaped pastries filled with sweet almond paste, scented with orange blossom water.',
                    'price' => 40.00,
                    'is_available' => true,
                ],
                'tags' => [$traditional]
            ],
            [
                'dish' => [
                    'category_id' => $drinks->id,
                    'name' => 'Moroccan Mint Tea',
                    'description' => 'The standard of Moroccan hospitality - freshly brewed gunpowder green tea, fresh spearmint leaves, and sugar.',
                    'price' => 25.00,
                    'is_available' => true,
                ],
                'tags' => [$traditional, $vegetarian]
            ]
        ];

        foreach ($dishes as $dishData) {
            $dish = Dish::create($dishData['dish']);
            if (isset($dishData['tags'])) {
                $tagIds = array_filter(array_map(fn($tag) => $tag?->id, $dishData['tags']));
                $dish->tags()->attach($tagIds);
            }
        }
    }
}
