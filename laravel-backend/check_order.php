<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== ALL PRODUCT TRANSACTIONS ===\n";
$allTransactions = \App\Models\ProductTransaction::orderBy('created_at', 'desc')->get();
foreach ($allTransactions as $trans) {
    echo sprintf(
        "ID: %d | Type: %s | Product: %d | Qty: %d | Ref: %s #%d | Notes: %s\n",
        $trans->id,
        $trans->type,
        $trans->product_id,
        $trans->quantity,
        $trans->reference_type,
        $trans->reference_id ?? 0,
        $trans->notes
    );
}

echo "\n=== ALL ORDERS ===\n";
$orders = \App\Models\Order::orderBy('created_at', 'desc')->get();
foreach ($orders as $order) {
    echo sprintf(
        "Order: %s | Status: %s | Items: %d | Transactions: %d\n",
        $order->order_number,
        $order->status,
        $order->orderItems->count(),
        \App\Models\ProductTransaction::where('reference_type', 'order')
            ->where('reference_id', $order->order_id)
            ->count()
    );
}
