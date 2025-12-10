<?php

require 'vendor/autoload.php';

use App\Models\Product;
use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Updating product active status...\n";

$products = Product::with('inventory')->get();
$updated = 0;

foreach ($products as $product) {
    $isNotExpired = true;
    if ($product->expiration_date) {
        $isNotExpired = \Carbon\Carbon::parse($product->expiration_date)->isFuture();
    }
    $hasStock = $product->inventory && $product->inventory->quantity > 0;

    $newIsActive = $isNotExpired && $hasStock;

    if ($product->is_active != $newIsActive) {
        $product->is_active = $newIsActive;
        $product->save();
        $updated++;
        echo "Updated: {$product->product_name} - Active: " . ($newIsActive ? 'Yes' : 'No') . "\n";
    }
}

echo "Total products updated: {$updated}\n";
echo "Done!\n";
