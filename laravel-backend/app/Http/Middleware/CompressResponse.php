<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CompressResponse
{
    /**
     * Handle an incoming request - Compress JSON responses for faster transfer
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only compress if client accepts gzip
        $acceptEncoding = $request->header('Accept-Encoding', '');
        
        if (str_contains($acceptEncoding, 'gzip')) {
            $content = $response->getContent();
            
            // Only compress if content is large enough (> 1KB)
            if ($content && strlen($content) > 1024) {
                $compressed = gzencode($content, 6); // Compression level 6 (balanced)
                
                if ($compressed !== false) {
                    $response->setContent($compressed);
                    $response->headers->set('Content-Encoding', 'gzip');
                    $response->headers->set('Content-Length', strlen($compressed));
                    $response->headers->set('X-Compression', 'enabled');
                }
            }
        }

        return $response;
    }
}
