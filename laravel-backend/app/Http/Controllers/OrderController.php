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
    public function index()
    {
        $orders = Order::with(['orderItems.product'])
            ->whereIn('status', ['Pending', 'In Progress', 'Cancelled'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($orders);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'nullable|string|max:100',
            'service_type' => 'required|in:Printing,ID Creation,Tela Purchase,Lamination,Document Binding,Uniform,Other',
            'notes' => 'nullable|string',
            'preferred_pickup_date' => 'nullable|date',
            'order_items' => 'required|array|min:1',
            'order_items.*.product_id' => 'required|exists:products,product_id',
            'order_items.*.quantity' => 'required|integer|min:1',
            'order_items.*.unit_price' => 'required|numeric|min:0',
            'order_items.*.notes' => 'nullable|string',
        ]);

        // Generate unique order number
        $orderNumber = 'ORD-' . date('Y') . '-' . str_pad(Order::count() + 1, 4, '0', STR_PAD_LEFT);

        // Create order
        $order = Order::create([
            'order_number' => $orderNumber,
            'customer_name' => $validated['customer_name'] ?? null,
            'service_type' => $validated['service_type'],
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
}
