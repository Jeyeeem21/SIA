<?php

namespace App\Http\Controllers;

use App\Models\TogaDepartment;
use App\Models\TogaRental;
use App\Models\TogaPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class TogaRentalController extends Controller
{
    // ==================== DEPARTMENTS ====================
    
    /**
     * Get all departments with statistics
     */
    public function getDepartments()
    {
        $departments = Cache::remember('toga_departments', 1, function () {
            return TogaDepartment::select('id', 'name', 'code', 'color', 'icon', 'created_at', 'updated_at')
                ->withCount([
                    'rentals as total_students',
                    'rentals as active_rentals' => function ($query) {
                        $query->where('status', 'Active');
                    }
                ])
                ->withSum('rentals', 'rental_fee')
                ->orderBy('created_at', 'desc')
                ->get()
            ->map(function ($dept) {
                return [
                    'id' => $dept->id,
                    'name' => $dept->name,
                    'code' => $dept->code,
                    'color' => $dept->color,
                    'icon' => $dept->icon,
                    'totalStudents' => $dept->total_students,
                    'activeRentals' => $dept->active_rentals,
                    'revenue' => $dept->rentals_sum_rental_fee ?? 0,
                    'created_at' => $dept->created_at,
                    'updated_at' => $dept->updated_at,
                ];
            });
        });

        return response()->json($departments);
    }

    /**
     * Store a new department
     */
    public function storeDepartment(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:toga_departments,code',
            'color' => 'required|string|in:blue,purple,cyan,teal',
            'icon' => 'nullable|string|max:50',
        ]);

        $validated['icon'] = $validated['icon'] ?? 'Building2';

        $department = TogaDepartment::create($validated);

        Cache::forget('toga_departments');
        Cache::forget('toga_stats');

        return response()->json([
            'message' => 'Department created successfully',
            'department' => $department
        ], 201);
    }

    /**
     * Update a department
     */
    public function updateDepartment(Request $request, $id)
    {
        $department = TogaDepartment::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:toga_departments,code,' . $id,
            'color' => 'required|string|in:blue,purple,cyan,teal',
            'icon' => 'nullable|string|max:50',
        ]);

        $department->update($validated);

        Cache::forget('toga_departments');
        Cache::forget('toga_stats');

        return response()->json([
            'message' => 'Department updated successfully',
            'department' => $department
        ]);
    }

    /**
     * Delete a department
     */
    public function destroyDepartment($id)
    {
        $department = TogaDepartment::findOrFail($id);
        
        // Check if department has rentals
        if ($department->rentals()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete department with existing rentals'
            ], 422);
        }

        $department->delete();

        Cache::forget('toga_departments');
        Cache::forget('toga_stats');

        return response()->json([
            'message' => 'Department deleted successfully'
        ]);
    }

    // ==================== STUDENTS/RENTALS ====================

    /**
     * Get all rentals for a department
     */
    public function getRentals($departmentId)
    {
        $rentals = Cache::remember("toga_rentals_dept_{$departmentId}", 1, function () use ($departmentId) {
            return TogaRental::select('id', 'student_name', 'student_number', 'contact_number', 'size', 'rental_date', 'return_date', 'rental_fee', 'deposit', 'status', 'payment_status', 'toga_department_id', 'created_at', 'updated_at')
                ->where('toga_department_id', $departmentId)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($rental) {
                    return [
                        'id' => $rental->id,
                        'student_name' => $rental->student_name,
                        'student_number' => $rental->student_number,
                        'contact_number' => $rental->contact_number,
                        'size' => $rental->size,
                        'rental_date' => $rental->rental_date,
                        'return_date' => $rental->return_date,
                        'rental_fee' => $rental->rental_fee,
                        'deposit' => $rental->deposit,
                        'status' => $rental->status,
                        'payment_status' => $rental->payment_status,
                        'created_at' => $rental->created_at,
                        'updated_at' => $rental->updated_at,
                    ];
                });
        });

        return response()->json($rentals);
    }

    /**
     * Store a new rental/student
     */
    public function storeRental(Request $request)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:toga_departments,id',
            'student_name' => 'required|string|max:255',
            'student_number' => 'required|string|max:50',
            'contact_number' => 'required|string|max:20',
            'size' => 'required|string|in:XS,S,M,L,XL,XXL',
            'rental_date' => 'required|date',
            'return_date' => 'required|date|after:rental_date',
            'rental_fee' => 'required|numeric|min:0',
            'deposit' => 'required|numeric|min:0',
            'status' => 'required|string|in:Active,Returned,Overdue',
            'payment_status' => 'nullable|string|in:Paid,Pending',
        ]);

        $validated['payment_status'] = $validated['payment_status'] ?? 'Pending';
        $validated['toga_department_id'] = $validated['department_id'];
        unset($validated['department_id']);

        $rental = TogaRental::create($validated);

        Cache::forget("toga_rentals_dept_{$rental->toga_department_id}");
        Cache::forget('toga_departments');
        Cache::forget('toga_stats');

        return response()->json([
            'message' => 'Student rental created successfully',
            'rental' => $rental
        ], 201);
    }

    /**
     * Update a rental
     */
    public function updateRental(Request $request, $id)
    {
        $rental = TogaRental::findOrFail($id);

        $validated = $request->validate([
            'student_name' => 'required|string|max:255',
            'student_number' => 'required|string|max:50',
            'contact_number' => 'required|string|max:20',
            'size' => 'required|string|in:XS,S,M,L,XL,XXL',
            'rental_date' => 'required|date',
            'return_date' => 'required|date|after:rental_date',
            'rental_fee' => 'required|numeric|min:0',
            'deposit' => 'required|numeric|min:0',
            'status' => 'required|string|in:Active,Returned,Overdue',
            'payment_status' => 'nullable|string|in:Paid,Pending',
        ]);

        $rental->update($validated);

        Cache::forget("toga_rentals_dept_{$rental->toga_department_id}");
        Cache::forget('toga_departments');
        Cache::forget('toga_stats');

        return response()->json([
            'message' => 'Student rental updated successfully',
            'rental' => $rental
        ]);
    }

    /**
     * Delete a rental
     */
    public function destroyRental($id)
    {
        $rental = TogaRental::findOrFail($id);
        $departmentId = $rental->toga_department_id;
        
        $rental->delete();

        Cache::forget("toga_rentals_dept_{$departmentId}");
        Cache::forget('toga_departments');
        Cache::forget('toga_stats');

        return response()->json([
            'message' => 'Student rental deleted successfully'
        ]);
    }

    // ==================== PAYMENTS ====================

    /**
     * Get all payments for a department
     */
    public function getPayments($departmentId)
    {
        $payments = Cache::remember("toga_payments_dept_{$departmentId}", 1, function () use ($departmentId) {
            return TogaPayment::select('id', 'payment_number', 'student_name', 'student_number', 'amount', 'payment_date', 'payment_method', 'status', 'type', 'toga_department_id', 'created_at', 'updated_at')
                ->where('toga_department_id', $departmentId)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($payment) {
                    return [
                        'id' => $payment->id,
                        'payment_number' => $payment->payment_number,
                        'student_name' => $payment->student_name,
                        'student_number' => $payment->student_number,
                        'amount' => $payment->amount,
                        'payment_date' => $payment->payment_date,
                        'payment_method' => $payment->payment_method,
                        'status' => $payment->status,
                        'type' => $payment->type,
                        'created_at' => $payment->created_at,
                        'updated_at' => $payment->updated_at,
                    ];
                });
        });

        return response()->json($payments);
    }

    /**
     * Store a new payment
     */
    public function storePayment(Request $request)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:toga_departments,id',
            'rental_id' => 'nullable|exists:toga_rentals,id',
            'student_name' => 'required|string|max:255',
            'student_number' => 'required|string|max:50',
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'payment_method' => 'required|string|in:Cash,GCash,Bank Transfer,Card',
            'type' => 'required|string|in:Rental Fee,Deposit,Rental Fee + Deposit',
            'status' => 'required|string|in:Paid,Pending',
        ]);

        // Generate payment number
        $validated['payment_number'] = 'PAY-' . strtoupper(uniqid());
        $validated['toga_department_id'] = $validated['department_id'];
        $validated['toga_rental_id'] = $validated['rental_id'] ?? null;
        unset($validated['department_id']);
        unset($validated['rental_id']);

        $payment = TogaPayment::create($validated);

        Cache::forget("toga_payments_dept_{$payment->toga_department_id}");
        Cache::forget('toga_stats');

        return response()->json([
            'message' => 'Payment created successfully',
            'payment' => $payment
        ], 201);
    }

    /**
     * Update a payment
     */
    public function updatePayment(Request $request, $id)
    {
        $payment = TogaPayment::findOrFail($id);

        $validated = $request->validate([
            'student_name' => 'required|string|max:255',
            'student_number' => 'required|string|max:50',
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'payment_method' => 'required|string|in:Cash,GCash,Bank Transfer,Card',
            'type' => 'required|string|in:Rental Fee,Deposit,Rental Fee + Deposit',
            'status' => 'required|string|in:Paid,Pending',
        ]);

        $payment->update($validated);

        Cache::forget("toga_payments_dept_{$payment->toga_department_id}");
        Cache::forget('toga_stats');

        return response()->json([
            'message' => 'Payment updated successfully',
            'payment' => $payment
        ]);
    }

    /**
     * Delete a payment
     */
    public function destroyPayment($id)
    {
        $payment = TogaPayment::findOrFail($id);
        $departmentId = $payment->toga_department_id;
        
        $payment->delete();

        Cache::forget("toga_payments_dept_{$departmentId}");
        Cache::forget('toga_stats');

        return response()->json([
            'message' => 'Payment deleted successfully'
        ]);
    }

    // ==================== STATISTICS ====================

    /**
     * Get overall statistics
     */
    public function getStats()
    {
        $stats = Cache::remember('toga_stats', 1, function () {
            $departments = TogaDepartment::select('id')->withCount('rentals')->get();
            
            return [
                'total_departments' => $departments->count(),
                'total_students' => TogaRental::count(),
                'active_rentals' => TogaRental::where('status', 'Active')->count(),
                'total_revenue' => TogaRental::sum('rental_fee'),
                'returned' => TogaRental::where('status', 'Returned')->count(),
                'overdue' => TogaRental::where('status', 'Overdue')->count(),
                'pending_payments' => TogaPayment::where('status', 'Pending')->count(),
                'paid_payments' => TogaPayment::where('status', 'Paid')->count(),
            ];
        });

        return response()->json($stats);
    }
}
