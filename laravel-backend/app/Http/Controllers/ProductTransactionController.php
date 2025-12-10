<?php

namespace App\Http\Controllers;

use App\Models\ProductTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
     * Get product transaction growth rates by period - OPTIMIZED
     */
    public function getProductGrowthRates(Request $request)
    {
        try {
            $period = $request->input('period', 'daily');
            $now = now();

            // Define date ranges based on period
            switch ($period) {
                case 'monthly':
                    $currentStart = \Carbon\Carbon::parse('first day of this month')->startOfDay();
                    $currentEnd = \Carbon\Carbon::parse('last day of this month')->endOfDay();
                    $previousStart = \Carbon\Carbon::parse('first day of last month')->startOfDay();
                    $previousEnd = \Carbon\Carbon::parse('last day of last month')->endOfDay();
                    break;
                case 'yearly':
                    $currentStart = \Carbon\Carbon::parse('first day of January ' . date('Y'))->startOfDay();
                    $currentEnd = \Carbon\Carbon::parse('last day of December ' . date('Y'))->endOfDay();
                    $previousStart = \Carbon\Carbon::parse('first day of January ' . (date('Y')-1))->startOfDay();
                    $previousEnd = \Carbon\Carbon::parse('last day of December ' . (date('Y')-1))->endOfDay();
                    break;
                default: // daily
                    $currentStart = \Carbon\Carbon::today()->startOfDay();
                    $currentEnd = \Carbon\Carbon::today()->endOfDay();
                    $previousStart = \Carbon\Carbon::yesterday()->startOfDay();
                    $previousEnd = \Carbon\Carbon::yesterday()->endOfDay();
                    break;
            }

            // OPTIMIZED: Get all transactions in TWO queries with aggregation
            $currentTransactions = ProductTransaction::selectRaw('
                    product_id,
                    SUM(CASE WHEN type = "IN" THEN quantity ELSE 0 END) as in_qty,
                    SUM(CASE WHEN type = "OUT" THEN quantity ELSE 0 END) as out_qty
                ')
                ->whereBetween('created_at', [$currentStart, $currentEnd])
                ->groupBy('product_id')
                ->get()
                ->keyBy('product_id')
                ->map(function ($item) {
                    return ['in' => (int)$item->in_qty, 'out' => (int)$item->out_qty];
                });

            $previousTransactions = ProductTransaction::selectRaw('
                    product_id,
                    SUM(CASE WHEN type = "IN" THEN quantity ELSE 0 END) as in_qty,
                    SUM(CASE WHEN type = "OUT" THEN quantity ELSE 0 END) as out_qty
                ')
                ->whereBetween('created_at', [$previousStart, $previousEnd])
                ->groupBy('product_id')
                ->get()
                ->keyBy('product_id')
                ->map(function ($item) {
                    return ['in' => (int)$item->in_qty, 'out' => (int)$item->out_qty];
                });

            // Get products with inventory in one query
            $products = \App\Models\Product::select('product_id', 'product_name')
                ->with(['inventory:inventory_id,product_id,quantity'])
                ->whereHas('inventory')
                ->get()
                ->map(function ($product) use ($currentTransactions, $previousTransactions) {
                    $current = $currentTransactions[$product->product_id] ?? ['in' => 0, 'out' => 0];
                    $previous = $previousTransactions[$product->product_id] ?? ['in' => 0, 'out' => 0];

                    $currentNet = $current['in'] - $current['out'];
                    $previousNet = $previous['in'] - $previous['out'];

                    // Calculate growth rate
                    $growthRate = 0;
                    if ($previous['out'] != 0) {
                        $growthRate = (($current['out'] - $previous['out']) / $previous['out']) * 100;
                    } elseif ($current['out'] > 0) {
                        $growthRate = 100;
                    }

                    return [
                        'product_id' => $product->product_id,
                        'product_name' => $product->product_name,
                        'current_stock' => $product->inventory->quantity ?? 0,
                        'current_in' => (int)$current['in'],
                        'current_out' => (int)$current['out'],
                        'current_net' => (int)$currentNet,
                        'previous_in' => (int)$previous['in'],
                        'previous_out' => (int)$previous['out'],
                        'previous_net' => (int)$previousNet,
                        'growth_rate' => round($growthRate, 2),
                        'trend' => $growthRate > 0 ? 'up' : ($growthRate < 0 ? 'down' : 'stable'),
                    ];
                });

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
            Log::error('Growth rates error: ' . $e->getMessage());
            return response()->json([
                'period' => $request->input('period', 'daily'),
                'current_period' => ['start' => now()->toDateString(), 'end' => now()->toDateString()],
                'previous_period' => ['start' => now()->subDay()->toDateString(), 'end' => now()->subDay()->toDateString()],
                'products' => [],
            ], 200);
        }
    }
}
