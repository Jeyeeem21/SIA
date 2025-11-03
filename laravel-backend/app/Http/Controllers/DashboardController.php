<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // Total Products
        $totalProducts = DB::table('products')->where('status', 'active')->count();
        
        // Low Stock Items (quantity <= reorder_level)
        $lowStockItems = DB::table('inventories')
            ->join('products', 'inventories.product_id', '=', 'products.product_id')
            ->whereRaw('inventories.quantity <= inventories.reorder_level')
            ->select('products.product_name', 'inventories.quantity', 'inventories.reorder_level')
            ->get();
        
        // Active Orders (Pending + In Progress)
        $activeOrders = DB::table('orders')
            ->whereIn('status', ['Pending', 'In Progress'])
            ->count();
        
        // Today's Revenue (completed orders today)
        $todayRevenue = DB::table('orders')
            ->where('status', 'Completed')
            ->whereDate('completed_date', Carbon::today())
            ->sum('total_amount');
        
        // Total Revenue (all completed orders)
        $totalRevenue = DB::table('orders')
            ->where('status', 'Completed')
            ->sum('total_amount');
        
        // Orders by Status
        $ordersByStatus = DB::table('orders')
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');
        
        // Recent Orders (last 5)
        $recentOrders = DB::table('orders')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
        
        // Top Selling Products (by order_items quantity)
        $topProducts = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.product_id')
            ->select('products.product_name', DB::raw('SUM(order_items.quantity) as total_sold'))
            ->groupBy('products.product_id', 'products.product_name')
            ->orderBy('total_sold', 'desc')
            ->limit(5)
            ->get();
        
        // Revenue by Service Type
        $revenueByService = DB::table('orders')
            ->where('status', 'Completed')
            ->select('service_type', DB::raw('SUM(total_amount) as revenue'))
            ->groupBy('service_type')
            ->get();
        
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
            'stats' => [
                'total_products' => $totalProducts,
                'low_stock_count' => $lowStockItems->count(),
                'active_orders' => $activeOrders,
                'today_revenue' => (float) $todayRevenue,
                'total_revenue' => (float) $totalRevenue,
            ],
            'orders_by_status' => [
                'pending' => $ordersByStatus['Pending'] ?? 0,
                'in_progress' => $ordersByStatus['In Progress'] ?? 0,
                'completed' => $ordersByStatus['Completed'] ?? 0,
                'cancelled' => $ordersByStatus['Cancelled'] ?? 0,
            ],
            'low_stock_items' => $lowStockItems,
            'recent_orders' => $recentOrders,
            'top_products' => $topProducts,
            'revenue_by_service' => $revenueByService,
            'daily_sales' => $dailySalesFormatted,
            'weekly_sales' => $weeklySales,
            'monthly_sales' => $monthlySales,
        ]);
    }
}
