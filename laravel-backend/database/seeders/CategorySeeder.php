<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'category_name' => 'Printing Supplies',
                'description' => 'Papers, inks, and printing materials',
                'icon' => 'Printer',
                'status' => 'active',
            ],
            [
                'category_name' => 'ID Materials',
                'description' => 'ID cards, lanyards, and accessories',
                'icon' => 'CreditCard',
                'status' => 'active',
            ],
            [
                'category_name' => 'Fabrics',
                'description' => 'Tela and fabric materials for uniforms',
                'icon' => 'ShoppingBag',
                'status' => 'active',
            ],
            [
                'category_name' => 'Lamination Materials',
                'description' => 'Laminating sheets and supplies',
                'icon' => 'FileText',
                'status' => 'active',
            ],
            [
                'category_name' => 'Binding Materials',
                'description' => 'Document binding supplies',
                'icon' => 'Book',
                'status' => 'active',
            ],
            [
                'category_name' => 'Uniform Accessories',
                'description' => 'Buttons, patches, and uniform items',
                'icon' => 'User',
                'status' => 'active',
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
