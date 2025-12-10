<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\Inventory;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class ReportsController extends Controller
{
    public function index(Request $request)
    {
        // Get date range from request or default to current month
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));

        // Cache for 1 second - ULTRA FAST! Same as Dashboard
        $cacheKey = "reports_{$startDate}_{$endDate}";
        
        return Cache::remember($cacheKey, 1, function () use ($startDate, $endDate) {
            return $this->getReportsData($startDate, $endDate);
        });
    }

    private function getReportsData($startDate, $endDate)
    {
        // Inventory Report Cards (match Dashboard calculation)
        $inventoryStats = [
            'total_items' => Product::where('status', 'active')->count(),
            'available' => Inventory::join('products', 'inventories.product_id', '=', 'products.product_id')
                ->where('products.status', 'active')
                ->whereRaw('inventories.quantity > inventories.reorder_level')
                ->count(),
            'low_stock' => Inventory::join('products', 'inventories.product_id', '=', 'products.product_id')
                ->where('products.status', 'active')
                ->whereRaw('inventories.quantity <= inventories.reorder_level')
                ->whereRaw('inventories.quantity > 0')
                ->count(),
            'out_of_stock' => Inventory::join('products', 'inventories.product_id', '=', 'products.product_id')
                ->where('products.status', 'active')
                ->where('inventories.quantity', 0)
                ->count(),
        ];

        // Daily Sales (current month - all days)
        $currentMonth = Carbon::now();
        $daysInMonth = $currentMonth->daysInMonth;
        
        $dailySales = DB::table('orders')
            ->where('status', 'Completed')
            ->whereYear('completed_date', $currentMonth->year)
            ->whereMonth('completed_date', $currentMonth->month)
            ->select(
                DB::raw('DAY(completed_date) as day'),
                DB::raw('SUM(total_amount) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('day')
            ->get();
        
        // Fill in all days of current month
        $dailySalesFormatted = [];
        for ($day = 1; $day <= $daysInMonth; $day++) {
            $dayData = $dailySales->firstWhere('day', $day);
            
            $dailySalesFormatted[] = [
                'day' => $day,
                'label' => (string) $day,
                'revenue' => $dayData ? (float) $dayData->revenue : 0,
                'orders' => $dayData ? $dayData->orders : 0,
            ];
        }

        // Top Products Bar Chart (by quantity sold from completed orders)
        $topProducts = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.order_id')
            ->leftJoin('products', 'order_items.product_id', '=', 'products.product_id')
            ->where('orders.status', 'Completed')
            ->whereBetween('orders.completed_date', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay()
            ])
            ->select(
                DB::raw('COALESCE(products.product_name, order_items.product_name, "Unknown Product") as product_name'),
                DB::raw('SUM(order_items.quantity * order_items.unit_price) as revenue'),
                DB::raw('SUM(order_items.quantity) as total_sold')
            )
            ->groupBy('order_items.product_id', 'products.product_name', 'order_items.product_name')
            ->orderByDesc('total_sold')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->product_name ?: 'Unknown Product',
                    'revenue' => (float) $item->revenue,
                    'sold' => (int) $item->total_sold,
                ];
            });

        // Service Distribution Pie Chart (top 5 services only)
        $serviceDistribution = Order::where('status', 'Completed')
            ->whereBetween('completed_date', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay()
            ])
            ->whereNotNull('service_type')
            ->where('service_type', '!=', '')
            ->select(
                'service_type',
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(total_amount) as revenue')
            )
            ->groupBy('service_type')
            ->orderByDesc('count')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->service_type ?: 'Other',
                    'value' => (int) $item->count,
                    'revenue' => (float) $item->revenue,
                ];
            });

        // Summary Stats (for Completed orders only in date range)
        $completedOrders = Order::where('status', 'Completed')
            ->whereBetween('completed_date', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay()
            ]);
        
        $totalOrders = $completedOrders->count();
        $totalRevenue = $completedOrders->sum('total_amount');
        $averageOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        // Detailed Transaction Table Data (All orders in date range)
        $transactions = Order::with(['orderItems.product', 'payment'])
            ->whereBetween('created_at', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay()
            ])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                return [
                    'order_id' => $order->order_id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer_name ?? 'Walk-in',
                    'service_type' => $order->service_type,
                    'items' => $order->orderItems->map(function ($item) {
                        return [
                            'product_name' => $item->product->product_name ?? 'N/A',
                            'quantity' => $item->quantity,
                            'unit_price' => (float) $item->unit_price,
                        ];
                    }),
                    'total_amount' => (float) $order->total_amount,
                    'status' => $order->is_voided ? 'Cancelled' : $order->status,
                    'payment_status' => $order->payment->payment_status ?? 'unpaid',
                    'payment_method' => $order->payment->payment_method ?? 'N/A',
                    'date' => $order->completed_date ? Carbon::parse($order->completed_date)->format('Y-m-d') : $order->created_at->format('Y-m-d'),
                    'time' => $order->completed_date ? Carbon::parse($order->completed_date)->format('h:i A') : $order->created_at->format('h:i A'),
                ];
            });

        // Weekly Sales (weeks in current month including week that crosses from previous month)
        $currentMonth = Carbon::now();
        $monthStart = $currentMonth->copy()->startOfMonth();
        $monthEnd = $currentMonth->copy()->endOfMonth();
        $weeklySales = [];
        
        // Find the first week that includes any day in current month
        $firstWeekStart = $monthStart->copy()->startOfWeek(Carbon::SUNDAY);
        
        // Generate all weeks that overlap with current month
        $currentWeekStart = $firstWeekStart->copy();
        $weekNumber = 1;
        
        while ($currentWeekStart <= $monthEnd) {
            $currentWeekEnd = $currentWeekStart->copy()->endOfWeek(Carbon::SATURDAY);
            
            $weekData = DB::table('orders')
                ->where('status', 'Completed')
                ->whereBetween('completed_date', [$currentWeekStart, $currentWeekEnd])
                ->select(
                    DB::raw('SUM(total_amount) as revenue'),
                    DB::raw('COUNT(*) as orders')
                )
                ->first();
            
            $weeklySales[] = [
                'week' => 'Week ' . $weekNumber,
                'label' => $currentWeekStart->format('M j') . '-' . $currentWeekEnd->format('M j'),
                'period' => $currentWeekStart->format('M j') . ' - ' . $currentWeekEnd->format('M j'),
                'revenue' => $weekData ? (float) $weekData->revenue : 0,
                'orders' => $weekData ? $weekData->orders : 0,
            ];
            
            $currentWeekStart->addWeek();
            $weekNumber++;
        }
        
        // Monthly Sales (all 12 months of current year)
        $currentYear = Carbon::now()->year;
        $monthlySales = [];
        
        for ($month = 1; $month <= 12; $month++) {
            $monthData = DB::table('orders')
                ->where('status', 'Completed')
                ->whereYear('completed_date', $currentYear)
                ->whereMonth('completed_date', $month)
                ->select(
                    DB::raw('SUM(total_amount) as revenue'),
                    DB::raw('COUNT(*) as orders')
                )
                ->first();
            
            $monthDate = Carbon::create($currentYear, $month, 1);
            $monthlySales[] = [
                'month' => $month,
                'label' => $monthDate->format('M'),
                'fullMonth' => $monthDate->format('F Y'),
                'revenue' => $monthData ? (float) $monthData->revenue : 0,
                'orders' => $monthData ? $monthData->orders : 0,
            ];
        }

        return response()->json([
            'inventory_stats' => $inventoryStats,
            'summary_stats' => [
                'total_orders' => $totalOrders,
                'total_revenue' => (float) $totalRevenue,
                'average_order_value' => (float) $averageOrderValue,
            ],
            'daily_sales' => $dailySalesFormatted,
            'weekly_sales' => $weeklySales,
            'monthly_sales' => $monthlySales,
            'top_products' => $topProducts,
            'service_distribution' => $serviceDistribution,
            'transactions' => $transactions,
            'date_range' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function export(Request $request)
    {
        // This will be implemented for PDF/Excel export
        $type = $request->input('type', 'pdf'); // pdf, excel, print
        
        // For now, return success message
        return response()->json([
            'message' => "Report export as {$type} will be implemented",
            'type' => $type,
        ]);
    }
}
