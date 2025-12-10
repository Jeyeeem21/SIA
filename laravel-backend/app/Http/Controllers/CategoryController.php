<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Services\CacheService;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource - NO CACHE for real-time updates
     */
    public function index()
    {
        // Direct query for real-time updates (Redis handles query optimization)
        $categories = Category::withCount('products')->orderBy('created_at', 'desc')->get();
        return response()->json($categories);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_name' => 'required|string|max:50|unique:categories',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:50',
            'status' => 'nullable|in:active,inactive',
        ]);

        $category = Category::create($validated);
        
        CacheService::clearCategoryCache();
        
        return response()->json($category, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        return response()->json($category->loadCount('products'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'category_name' => 'required|string|max:50|unique:categories,category_name,' . $category->category_id . ',category_id',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:50',
            'status' => 'nullable|in:active,inactive',
        ]);

        $category->update($validated);
        
        // Aggressively clear cache for immediate updates
        Cache::forget('categories_all');
        CacheService::clearCategoryCache();
        
        return response()->json($category->loadCount('products'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        // Check if category has products
        if ($category->products()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete category. This category has products assigned to it. Please reassign or delete the products first.'
            ], 422);
        }

        $category->delete();
        
        CacheService::clearCategoryCache();
        
        return response()->json(['message' => 'Category deleted successfully']);
    }
}
