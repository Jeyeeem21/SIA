<?php

namespace App\Http\Controllers;

use App\Models\ProductTransaction;
use Illuminate\Http\Request;

class ProductTransactionController extends Controller
{
    /**
     * Get all product transactions with filters
     */
    public function index(Request $request)
    {
        $query = ProductTransaction::with(['product', 'user']);

        // Filter by transaction type
        if ($request->has('type')) {
            $query->where('type', strtoupper($request->type));
        }

        // Filter by product
        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $transactions = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 50));

        return response()->json($transactions);
    }

    /**
     * Get transactions for a specific product
     */
    public function getByProduct($productId)
    {
        $transactions = ProductTransaction::with(['product', 'user'])
            ->where('product_id', $productId)
            ->orderBy('created_at', 'desc')
            ->get();

        // Calculate statistics
        $totalIn = $transactions->where('type', 'IN')->sum('quantity');
        $totalOut = $transactions->where('type', 'OUT')->sum('quantity');
        $totalAdjustments = 0; // Adjustment type doesn't exist in this schema

        return response()->json([
            'transactions' => $transactions,
            'statistics' => [
                'total_in' => $totalIn,
                'total_out' => $totalOut,
                'total_adjustments' => $totalAdjustments,
                'net_movement' => $totalIn - $totalOut + $totalAdjustments,
            ],
        ]);
    }

    /**
     * Get product transaction growth rates by period
     */
    public function getProductGrowthRates(Request $request)
    {
        try {
            $period = $request->input('period', 'daily'); // daily, monthly, yearly
            $now = now();

            // Define date ranges based on period
            switch ($period) {
                case 'monthly':
                    $currentStart = $now->copy()->startOfMonth();
                    $currentEnd = $now->copy()->endOfMonth();
                    $previousStart = $now->copy()->subMonth()->startOfMonth();
                    $previousEnd = $now->copy()->subMonth()->endOfMonth();
                    break;
                case 'yearly':
                    $currentStart = $now->copy()->startOfYear();
                    $currentEnd = $now->copy()->endOfYear();
                    $previousStart = $now->copy()->subYear()->startOfYear();
                    $previousEnd = $now->copy()->subYear()->endOfYear();
                    break;
                default: // daily
                    $currentStart = $now->copy()->startOfDay();
                    $currentEnd = $now->copy()->endOfDay();
                    $previousStart = $now->copy()->subDay()->startOfDay();
                    $previousEnd = $now->copy()->subDay()->endOfDay();
                    break;
            }

            // Get all products with their inventory
            $products = \App\Models\Product::with('inventory')->get()->filter(function ($product) {
                return $product->inventory !== null;
            })->map(function ($product) use ($currentStart, $currentEnd, $previousStart, $previousEnd) {
                // Get current period transactions
                $currentIn = ProductTransaction::where('product_id', $product->product_id)
                    ->where('type', 'IN')
                    ->whereBetween('created_at', [$currentStart, $currentEnd])
                    ->sum('quantity') ?? 0;

                $currentOut = ProductTransaction::where('product_id', $product->product_id)
                    ->where('type', 'OUT')
                    ->whereBetween('created_at', [$currentStart, $currentEnd])
                    ->sum('quantity') ?? 0;

                // Get previous period transactions
                $previousIn = ProductTransaction::where('product_id', $product->product_id)
                    ->where('type', 'IN')
                    ->whereBetween('created_at', [$previousStart, $previousEnd])
                    ->sum('quantity') ?? 0;

                $previousOut = ProductTransaction::where('product_id', $product->product_id)
                    ->where('type', 'OUT')
                    ->whereBetween('created_at', [$previousStart, $previousEnd])
                    ->sum('quantity') ?? 0;

                // Calculate net movements
                $currentNet = $currentIn - $currentOut;
                $previousNet = $previousIn - $previousOut;

                // Calculate growth rate based on OUT transactions (sales activity)
                $growthRate = 0;
                if ($previousOut != 0) {
                    // Compare current OUT vs previous OUT (sales growth)
                    $growthRate = (($currentOut - $previousOut) / $previousOut) * 100;
                } elseif ($currentOut > 0) {
                    // New sales activity
                    $growthRate = 100;
                } elseif ($previousOut == 0 && $currentOut == 0) {
                    // No activity in either period
                    $growthRate = 0;
                }

                return [
                    'product_id' => $product->product_id,
                    'product_name' => $product->product_name,
                    'current_stock' => $product->inventory->quantity ?? 0,
                    'current_in' => (int)$currentIn,
                    'current_out' => (int)$currentOut,
                    'current_net' => (int)$currentNet,
                    'previous_in' => (int)$previousIn,
                    'previous_out' => (int)$previousOut,
                    'previous_net' => (int)$previousNet,
                    'growth_rate' => round($growthRate, 2),
                    'trend' => $growthRate > 0 ? 'up' : ($growthRate < 0 ? 'down' : 'stable'),
                ];
            })->values(); // Reindex array

            return response()->json([
                'period' => $period,
                'current_period' => [
                    'start' => $currentStart->toDateString(),
                    'end' => $currentEnd->toDateString(),
                ],
                'previous_period' => [
                    'start' => $previousStart->toDateString(),
                    'end' => $previousEnd->toDateString(),
                ],
                'products' => $products,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'period' => $request->input('period', 'daily'),
                'current_period' => ['start' => now()->toDateString(), 'end' => now()->toDateString()],
                'previous_period' => ['start' => now()->subDay()->toDateString(), 'end' => now()->subDay()->toDateString()],
                'products' => [],
            ], 200); // Return 200 with empty data instead of 500 error
        }
    }
}
