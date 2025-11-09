<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Models\SalesSummary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SalesAnalyticsController extends Controller
{
    /**
     * Get sales analytics with growth rate
     */
    public function index(Request $request)
    {
        $period = $request->input('period', 'daily'); // daily, monthly, yearly
        $date = $request->input('date', now()->format('Y-m-d'));

        $currentDate = Carbon::parse($date);
        
        switch ($period) {
            case 'daily':
                $current = $this->getDailySales($currentDate);
                $previous = $this->getDailySales($currentDate->copy()->subDay());
                break;
            case 'monthly':
                $current = $this->getMonthlySales($currentDate);
                $previous = $this->getMonthlySales($currentDate->copy()->subMonth());
                break;
            case 'yearly':
                $current = $this->getYearlySales($currentDate);
                $previous = $this->getYearlySales($currentDate->copy()->subYear());
                break;
        }

        $growthRate = $this->calculateGrowthRate($current['total_sales'], $previous['total_sales']);

        return response()->json([
            'period' => $period,
            'date' => $date,
            'current' => $current,
            'previous' => $previous,
            'growth_rate' => $growthRate,
            'trend' => $growthRate > 0 ? 'up' : ($growthRate < 0 ? 'down' : 'stable'),
        ]);
    }

    /**
     * Get comprehensive sales overview
     */
    public function overview()
    {
        $today = $this->getDailySales(now());
        $yesterday = $this->getDailySales(now()->subDay());
        $dailyGrowth = $this->calculateGrowthRate($today['total_sales'], $yesterday['total_sales']);

        $thisMonth = $this->getMonthlySales(now());
        $lastMonth = $this->getMonthlySales(now()->subMonth());
        $monthlyGrowth = $this->calculateGrowthRate($thisMonth['total_sales'], $lastMonth['total_sales']);

        $thisYear = $this->getYearlySales(now());
        $lastYear = $this->getYearlySales(now()->subYear());
        $yearlyGrowth = $this->calculateGrowthRate($thisYear['total_sales'], $lastYear['total_sales']);

        return response()->json([
            'daily' => [
                'today' => $today,
                'yesterday' => $yesterday,
                'growth_rate' => $dailyGrowth,
                'trend' => $dailyGrowth > 0 ? 'up' : ($dailyGrowth < 0 ? 'down' : 'stable'),
            ],
            'monthly' => [
                'current' => $thisMonth,
                'previous' => $lastMonth,
                'growth_rate' => $monthlyGrowth,
                'trend' => $monthlyGrowth > 0 ? 'up' : ($monthlyGrowth < 0 ? 'down' : 'stable'),
            ],
            'yearly' => [
                'current' => $thisYear,
                'previous' => $lastYear,
                'growth_rate' => $yearlyGrowth,
                'trend' => $yearlyGrowth > 0 ? 'up' : ($yearlyGrowth < 0 ? 'down' : 'stable'),
            ],
        ]);
    }

    private function getDailySales($date)
    {
        $startOfDay = $date->copy()->startOfDay();
        $endOfDay = $date->copy()->endOfDay();

        $sales = Payment::whereBetween('payment_date', [$startOfDay, $endOfDay])
            ->sum('amount');

        $orders = Order::whereBetween('completed_date', [$startOfDay, $endOfDay])
            ->where('status', 'Completed')
            ->count();

        return [
            'date' => $date->format('Y-m-d'),
            'total_sales' => (float) $sales,
            'total_orders' => $orders,
        ];
    }

    private function getMonthlySales($date)
    {
        $startOfMonth = $date->copy()->startOfMonth();
        $endOfMonth = $date->copy()->endOfMonth();

        $sales = Payment::whereBetween('payment_date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        $orders = Order::whereBetween('completed_date', [$startOfMonth, $endOfMonth])
            ->where('status', 'Completed')
            ->count();

        return [
            'date' => $date->format('Y-m'),
            'total_sales' => (float) $sales,
            'total_orders' => $orders,
        ];
    }

    private function getYearlySales($date)
    {
        $startOfYear = $date->copy()->startOfYear();
        $endOfYear = $date->copy()->endOfYear();

        $sales = Payment::whereBetween('payment_date', [$startOfYear, $endOfYear])
            ->sum('amount');

        $orders = Order::whereBetween('completed_date', [$startOfYear, $endOfYear])
            ->where('status', 'Completed')
            ->count();

        return [
            'date' => $date->format('Y'),
            'total_sales' => (float) $sales,
            'total_orders' => $orders,
        ];
    }

    private function calculateGrowthRate($current, $previous)
    {
        if ($previous == 0) {
            return $current > 0 ? 100.00 : 0.00;
        }

        return round((($current - $previous) / $previous) * 100, 2);
    }

    /**
     * Update or create sales summary
     */
    public function updateSalesSummary()
    {
        $today = now();

        // Update daily summary
        $this->updatePeriodSummary('daily', $today);

        // Update monthly summary
        $this->updatePeriodSummary('monthly', $today);

        // Update yearly summary
        $this->updatePeriodSummary('yearly', $today);

        return response()->json(['message' => 'Sales summary updated successfully']);
    }

    private function updatePeriodSummary($periodType, $date)
    {
        $carbon = Carbon::parse($date);
        
        switch ($periodType) {
            case 'daily':
                $periodDate = $carbon->format('Y-m-d');
                $data = $this->getDailySales($carbon);
                $previousData = $this->getDailySales($carbon->copy()->subDay());
                break;
            case 'monthly':
                $periodDate = $carbon->format('Y-m-01');
                $data = $this->getMonthlySales($carbon);
                $previousData = $this->getMonthlySales($carbon->copy()->subMonth());
                break;
            case 'yearly':
                $periodDate = $carbon->format('Y-01-01');
                $data = $this->getYearlySales($carbon);
                $previousData = $this->getYearlySales($carbon->copy()->subYear());
                break;
        }

        $growthRate = $this->calculateGrowthRate($data['total_sales'], $previousData['total_sales']);

        SalesSummary::updateOrCreate(
            [
                'date' => $periodDate,
                'period_type' => $periodType,
            ],
            [
                'total_sales' => $data['total_sales'],
                'total_orders' => $data['total_orders'],
                'previous_period_sales' => $previousData['total_sales'],
                'growth_rate' => $growthRate,
            ]
        );
    }
}
