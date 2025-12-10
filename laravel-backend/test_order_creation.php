<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Create a test order
$orderData = [
    'customer_name' => 'Test Customer',
    'order_items' => [
        [
            'product_id' => 1,
            'quantity' => 3,
            'unit_price' => 20.00,
            'notes' => null
        ]
    ],
    'notes' => 'Test order from script'
];

// Simulate the controller logic
$firstProduct = \App\Models\Product::with('category')->find($orderData['order_items'][0]['product_id']);
$serviceType = $firstProduct->category->category_name ?? 'Other';

$lastOrder = \App\Models\Order::orderBy('order_id', 'desc')->first();
$nextNumber = $lastOrder ? ($lastOrder->order_id + 1) : 1;
$orderNumber = 'ORD-' . date('Y') . '-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

// Create order
$order = \App\Models\Order::create([
    'order_number' => $orderNumber,
    'customer_name' => $orderData['customer_name'] ?? null,
    'service_type' => $serviceType,
    'status' => 'Pending',
    'notes' => $orderData['notes'] ?? null,
    'preferred_pickup_date' => null,
    'total_amount' => 0,
]);

echo "Created Order: " . $order->order_number . " (ID: " . $order->order_id . ")\n";

// Create order items and decrease stock
$totalAmount = 0;
foreach ($orderData['order_items'] as $item) {
    $product = \App\Models\Product::find($item['product_id']);
    
    $orderItem = \App\Models\OrderItem::create([
        'order_id' => $order->order_id,
        'product_id' => $item['product_id'],
        'product_name' => $product->product_name,
        'quantity' => $item['quantity'],
        'unit_price' => $item['unit_price'],
        'notes' => $item['notes'] ?? null,
    ]);

    $totalAmount += $orderItem->quantity * $orderItem->unit_price;

    // Decrease stock
    \App\Models\Inventory::where('product_id', $item['product_id'])
        ->decrement('quantity', $item['quantity']);

    echo "Created Order Item: Product ID " . $item['product_id'] . ", Quantity: " . $item['quantity'] . "\n";

    // Create product transaction for OUT movement immediately
    $transaction = \App\Models\ProductTransaction::create([
        'product_id' => $item['product_id'],
        'type' => 'OUT',
        'quantity' => $item['quantity'],
        'unit_price' => $item['unit_price'],
        'total_amount' => $item['quantity'] * $item['unit_price'],
        'reference_type' => 'order',
        'reference_id' => $order->order_id,
        'user_id' => null,
        'notes' => 'Order ' . $orderNumber . ' - Pending Payment',
    ]);

    echo "Created ProductTransaction: ID " . $transaction->id . ", Type: " . $transaction->type . ", Qty: " . $transaction->quantity . "\n";
}

// Update order total
$order->total_amount = $totalAmount;
$order->save();

echo "\nOrder Total: ₱" . number_format($totalAmount, 2) . "\n";

// Verify transaction was created
$transCount = \App\Models\ProductTransaction::where('reference_type', 'order')
    ->where('reference_id', $order->order_id)
    ->count();

echo "Product Transactions for this order: " . $transCount . "\n";
