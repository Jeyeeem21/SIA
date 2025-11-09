<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Inventory;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     * Only return active orders (Pending, In Progress, Cancelled)
     * Completed orders should be viewed in Reports page
     */
    public function index(Request $request)
    {
        $query = Order::with(['orderItems.product']);
        
        // If searching by order_number for void, only return Completed orders
        if ($request->has('order_number')) {
            $query->where('order_number', $request->order_number)
                  ->where('status', 'Completed')
                  ->where('is_voided', false);
        } else {
            // Default behavior: only show active orders
            $query->whereIn('status', ['Pending', 'In Progress', 'Cancelled']);
        }
        
        $orders = $query->orderBy('created_at', 'desc')->get();
        
        return response()->json($orders);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'preferred_pickup_date' => 'nullable|date',
            'order_items' => 'required|array|min:1',
            'order_items.*.product_id' => 'required|exists:products,product_id',
            'order_items.*.quantity' => 'required|integer|min:1',
            'order_items.*.unit_price' => 'required|numeric|min:0',
            'order_items.*.notes' => 'nullable|string',
        ]);

        // Get the first product's category for service_type
        $firstProduct = \App\Models\Product::with('category')->find($validated['order_items'][0]['product_id']);
        $serviceType = $firstProduct->category->category_name ?? 'Other';

        // Generate unique order number based on the last order number, not count
        $lastOrder = Order::orderBy('order_id', 'desc')->first();
        $nextNumber = $lastOrder ? ($lastOrder->order_id + 1) : 1;
        $orderNumber = 'ORD-' . date('Y') . '-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

        // Create order
        $order = Order::create([
            'order_number' => $orderNumber,
            'customer_name' => $validated['customer_name'] ?? null,
            'service_type' => $serviceType,
            'status' => 'Pending',
            'notes' => $validated['notes'] ?? null,
            'preferred_pickup_date' => $validated['preferred_pickup_date'] ?? null,
            'total_amount' => 0, // Will be calculated from order items
        ]);

        // Create order items and calculate total
        $totalAmount = 0;
        foreach ($validated['order_items'] as $item) {
            $orderItem = OrderItem::create([
                'order_id' => $order->order_id,
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'notes' => $item['notes'] ?? null,
            ]);

            $totalAmount += $orderItem->quantity * $orderItem->unit_price;

            // Decrease inventory
            $inventory = Inventory::where('product_id', $item['product_id'])->first();
            if ($inventory) {
                $inventory->quantity -= $item['quantity'];
                $inventory->save();
            }
        }

        // Update order total
        $order->total_amount = $totalAmount;
        $order->save();

        return response()->json($order->load(['orderItems.product']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        return response()->json($order->load(['orderItems.product']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'customer_name' => 'nullable|string|max:100',
            'service_type' => 'sometimes|in:Printing,ID Creation,Tela Purchase,Lamination,Document Binding,Uniform,Other',
            'status' => 'sometimes|in:Pending,In Progress,Completed,Cancelled',
            'notes' => 'nullable|string',
            'preferred_pickup_date' => 'nullable|date',
            'order_items' => 'sometimes|array',
            'order_items.*.order_item_id' => 'sometimes|exists:order_items,order_item_id',
            'order_items.*.product_id' => 'required_with:order_items|exists:products,product_id',
            'order_items.*.quantity' => 'required_with:order_items|integer|min:1',
            'order_items.*.unit_price' => 'required_with:order_items|numeric|min:0',
            'order_items.*.notes' => 'nullable|string',
        ]);

        // If status changed to Completed, set completed_date
        if (isset($validated['status']) && $validated['status'] === 'Completed' && $order->status !== 'Completed') {
            $validated['completed_date'] = Carbon::now();
        }

        // Handle order items if provided
        if (isset($validated['order_items'])) {
            // Return inventory for old items
            foreach ($order->orderItems as $oldItem) {
                $inventory = Inventory::where('product_id', $oldItem->product_id)->first();
                if ($inventory) {
                    $inventory->quantity += $oldItem->quantity;
                    $inventory->save();
                }
            }

            // Delete old order items
            $order->orderItems()->delete();

            // Create new order items and calculate total
            $totalAmount = 0;
            foreach ($validated['order_items'] as $item) {
                $orderItem = OrderItem::create([
                    'order_id' => $order->order_id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'notes' => $item['notes'] ?? null,
                ]);

                $totalAmount += $orderItem->quantity * $orderItem->unit_price;

                // Decrease inventory
                $inventory = Inventory::where('product_id', $item['product_id'])->first();
                if ($inventory) {
                    $inventory->quantity -= $item['quantity'];
                    $inventory->save();
                }
            }

            $validated['total_amount'] = $totalAmount;
        }

        $order->update($validated);

        return response()->json($order->load(['orderItems.product']));
    }

    /**
     * Complete an order with payment
     */
    public function complete(Request $request, Order $order)
    {
        // Check if order is already completed
        if ($order->status === 'Completed') {
            return response()->json(['message' => 'Order is already completed'], 400);
        }

        // Validate payment information
        $validated = $request->validate([
            'payment_method' => 'required|in:Cash,GCash',
            'amount' => 'required|numeric|min:0',
            'reference_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        // Load order items if not already loaded
        $order->load('orderItems');

        // Create payment record
        $payment = Payment::create([
            'order_id' => $order->order_id,
            'payment_method' => $validated['payment_method'],
            'amount' => $validated['amount'],
            'reference_number' => $validated['reference_number'] ?? null,
            'payment_date' => Carbon::now(),
            'processed_by' => Auth::id() ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        // Update order status to Completed
        $order->update([
            'status' => 'Completed',
            'completed_date' => Carbon::now(),
        ]);

        // Create product transactions for OUT movements
        foreach ($order->orderItems as $item) {
            \App\Models\ProductTransaction::create([
                'product_id' => $item->product_id,
                'type' => 'OUT',
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'total_amount' => $item->quantity * $item->unit_price,
                'reference_type' => 'order',
                'reference_id' => $order->order_id,
                'user_id' => Auth::id(),
                'notes' => 'Sale - Order ' . $order->order_number,
            ]);
        }

        return response()->json([
            'message' => 'Order completed successfully',
            'order' => $order->load(['orderItems.product', 'payment']),
            'payment' => $payment,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        // Return inventory before deleting
        foreach ($order->orderItems as $item) {
            $inventory = Inventory::where('product_id', $item->product_id)->first();
            if ($inventory) {
                $inventory->quantity += $item->quantity;
                $inventory->save();
            }
        }

        $order->delete();

        return response()->json(['message' => 'Order deleted successfully']);
    }

    /**
     * Get sales history (completed orders with order items)
     */
    public function getSalesHistory(Request $request)
    {
        $query = OrderItem::with(['product', 'order.payment'])
            ->whereHas('order', function ($q) {
                $q->where('status', 'Completed');
            });

        // Filter by date range if provided
        if ($request->has('start_date')) {
            $query->whereHas('order', function ($q) use ($request) {
                $q->whereDate('created_at', '>=', $request->start_date);
            });
        }
        if ($request->has('end_date')) {
            $query->whereHas('order', function ($q) use ($request) {
                $q->whereDate('created_at', '<=', $request->end_date);
            });
        }

        // Filter by period (daily/monthly/yearly)
        if ($request->has('period')) {
            $period = $request->period;
            $query->whereHas('order', function ($q) use ($period) {
                switch ($period) {
                    case 'daily':
                        $q->whereDate('created_at', now()->toDateString());
                        break;
                    case 'monthly':
                        $q->whereYear('created_at', now()->year)
                          ->whereMonth('created_at', now()->month);
                        break;
                    case 'yearly':
                        $q->whereYear('created_at', now()->year);
                        break;
                }
            });
        }

        $salesHistory = $query->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->order_item_id,
                    'order_id' => $item->order_id,
                    'order_number' => $item->order->order_number ?? 'N/A',
                    'product_id' => $item->product_id,
                    'product_name' => $item->product->product_name ?? 'N/A',
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'subtotal' => $item->subtotal,
                    'service_type' => $item->order->service_type ?? 'Other',
                    'payment_method' => $item->order->payment->payment_method ?? 'N/A',
                    'created_at' => $item->order->created_at,
                ];
            });

        return response()->json($salesHistory);
    }

    /**
     * Void an order
     */
    public function voidOrder(Request $request, $id)
    {
        $validated = $request->validate([
            'void_reason' => 'required|string|max:500',
        ]);

        $order = Order::findOrFail($id);

        // Check if order is already voided
        if ($order->is_voided) {
            return response()->json(['message' => 'Order is already voided'], 400);
        }

        // Allow voiding any order (including Completed) - admin authentication required on frontend

        // Restore inventory for all order items
        foreach ($order->orderItems as $orderItem) {
            $inventory = Inventory::where('product_id', $orderItem->product_id)->first();
            if ($inventory) {
                $inventory->quantity += $orderItem->quantity;
                $inventory->save();
            }

            // Create reverse transaction with logged-in user
            \App\Models\ProductTransaction::create([
                'product_id' => $orderItem->product_id,
                'type' => 'IN',
                'quantity' => $orderItem->quantity,
                'unit_price' => $orderItem->unit_price,
                'total_amount' => $orderItem->quantity * $orderItem->unit_price,
                'reference_type' => 'order_void',
                'reference_id' => $order->order_id,
                'notes' => 'Voided Order: ' . $order->order_number,
                'user_id' => Auth::id(), // Current logged-in user
            ]);
        }

        // Update order with logged-in user who voided it
        $order->update([
            'is_voided' => true,
            'void_reason' => $validated['void_reason'],
            'voided_by' => Auth::id(), // Current logged-in user
            'voided_at' => now(),
            'status' => 'Cancelled',
        ]);

        return response()->json([
            'message' => 'Order voided successfully',
            'order' => $order->load('orderItems.product')
        ]);
    }
}
