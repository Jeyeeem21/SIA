<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetCacheHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only apply caching to GET requests
        if ($request->isMethod('GET')) {
            // Get cache duration for this route
            $cacheDuration = $this->getCacheDuration($request);
            
            if ($cacheDuration > 0) {
                $response->headers->set('Cache-Control', "public, max-age={$cacheDuration}, s-maxage={$cacheDuration}");
                $response->headers->set('X-Cache-Status', 'CACHEABLE');
                $response->headers->set('X-Cache-Duration', $cacheDuration);
            } else {
                // For dynamic/real-time data
                $response->headers->set('Cache-Control', 'no-cache, must-revalidate');
                $response->headers->set('X-Cache-Status', 'NO-CACHE');
            }
        } else {
            // POST, PUT, DELETE - no caching
            $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate');
            $response->headers->set('X-Cache-Status', 'NO-STORE');
        }

        return $response;
    }
    
    /**
     * Get cache duration for the route
     */
    private function getCacheDuration(Request $request): int
    {
        $path = $request->path();
        
        $cacheableRoutes = [
            'api/categories' => 300, // 5 minutes - categories rarely change
            'api/products' => 30, // 30 seconds - products update moderately
            'api/inventory' => 20, // 20 seconds - inventory updates frequently
            'api/dashboard' => 30, // 30 seconds - dashboard aggregates
        ];

        foreach ($cacheableRoutes as $route => $duration) {
            if (str_starts_with($path, $route)) {
                return $duration;
            }
        }

        return 0; // No caching
    }


}
