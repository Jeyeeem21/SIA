<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class CacheService
{
    /**
     * Clear all relevant caches after data modification
     */
    public static function clearAllCaches()
    {
        Cache::forget('dashboard_realtime');
        Cache::forget('dashboard_data');
        Cache::forget('products_all');
        Cache::forget('categories_all');
        Cache::forget('inventories_all');
        Cache::forget('orders_active');
        Cache::forget('sales_overview');
        
        // Clear pattern-based caches
        self::clearPatternCaches('reports_*');
        self::clearPatternCaches('sales_analytics_*');
        self::clearPatternCaches('orders_search_*');
        self::clearPatternCaches('products_*');
        self::clearPatternCaches('toga_*');
    }

    /**
     * Clear dashboard related caches
     */
    public static function clearDashboardCache()
    {
        Cache::forget('dashboard_realtime');
        Cache::forget('dashboard_data');
    }

    /**
     * Clear product related caches
     */
    public static function clearProductCache()
    {
        Cache::forget('products_all');
        Cache::forget('inventories_all');
        self::clearPatternCaches('products_*');
        self::clearDashboardCache();
    }

    /**
     * Clear order related caches
     */
    public static function clearOrderCache()
    {
        Cache::forget('orders_active');
        self::clearPatternCaches('orders_*');
        self::clearPatternCaches('reports_*');
        self::clearPatternCaches('sales_analytics_*');
        Cache::forget('sales_overview');
        self::clearDashboardCache();
    }

    /**
     * Clear category related caches
     */
    public static function clearCategoryCache()
    {
        Cache::forget('categories_all');
        self::clearDashboardCache();
    }

    /**
     * Clear inventory related caches
     */
    public static function clearInventoryCache()
    {
        Cache::forget('inventories_all');
        self::clearDashboardCache();
    }

    /**
     * Clear toga rental related caches
     */
    public static function clearTogaCache()
    {
        Cache::forget('toga_stats');
        Cache::forget('toga_departments');
        self::clearPatternCaches('toga_*');
    }

    /**
     * Clear rental related caches
     */
    public static function clearRentalCache()
    {
        self::clearPatternCaches('rental_*');
    }

    /**
     * Clear pattern-based caches (Redis support)
     */
    private static function clearPatternCaches($pattern)
    {
        // For Redis driver, we can use pattern matching
        if (config('cache.default') === 'redis') {
            try {
                $redis = Cache::getRedis();
                $keys = $redis->keys(config('cache.prefix', 'laravel_cache') . ':' . $pattern);
                if (!empty($keys)) {
                    foreach ($keys as $key) {
                        // Remove the prefix to get the actual cache key
                        $cacheKey = str_replace(config('cache.prefix', 'laravel_cache') . ':', '', $key);
                        Cache::forget($cacheKey);
                    }
                }
            } catch (\Exception $e) {
                // Fallback: Just continue if Redis pattern matching fails
            }
        }
    }

    /**
     * Get cache statistics (for monitoring)
     */
    public static function getCacheStats()
    {
        if (config('cache.default') === 'redis') {
            try {
                $redis = Cache::getRedis();
                $info = $redis->info();
                return [
                    'driver' => 'redis',
                    'connected' => true,
                    'keys' => $redis->dbSize(),
                    'memory' => $info['used_memory_human'] ?? 'N/A',
                ];
            } catch (\Exception $e) {
                return [
                    'driver' => 'redis',
                    'connected' => false,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return [
            'driver' => config('cache.default'),
            'connected' => true,
        ];
    }
}
