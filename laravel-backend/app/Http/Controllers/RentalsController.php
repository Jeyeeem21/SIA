<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RentalProperty;
use App\Models\RentalTenant;
use App\Models\RentalContract;
use App\Models\RentalPayment;
use App\Models\RentalMaintenance;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class RentalsController extends Controller
{
    // ==================== PROPERTIES ====================

    public function getProperties()
    {
        $properties = RentalProperty::with(['contracts' => function($query) {
            $query->where('status', 'Active')->with('tenant');
        }])->get();

        // Add computed fields for frontend compatibility
        $properties = $properties->map(function ($property) {
            $activeContract = $property->contracts->first();
            $hasActiveTenant = $activeContract && $activeContract->tenant;

            // Auto-determine status based on active contracts/tenants
            $computedStatus = $hasActiveTenant ? 'Occupied' : 'Vacant';

            return [
                'id' => $property->id,
                'name' => $property->name,
                'stall_number' => $property->stall_number,
                'type' => $property->type,
                'location' => $property->location,
                'size' => $property->size,
                'monthlyRate' => $property->monthly_rate,
                'status' => $computedStatus, // Use computed status instead of stored status
                'tenant' => $activeContract && $activeContract->tenant ? $activeContract->tenant->name : null,
                'contractEnd' => $activeContract && $activeContract->end_date ? $activeContract->end_date->format('Y-m-d') : null,
            ];
        });

        return response()->json($properties);
    }

    public function createProperty(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'stall_number' => 'nullable|string|max:50|unique:rental_properties,stall_number',
            'type' => 'required|in:Commercial,Residential',
            'location' => 'required|string|max:255',
            'size' => 'required|string|max:255',
            'monthly_rate' => 'required|numeric|min:0',
            'status' => 'required|in:Occupied,Vacant,Under Maintenance',
        ], [
            'stall_number.unique' => 'This stall number is already taken. Please use a different stall number.',
        ]);

        $property = RentalProperty::create([
            'name' => $request->name,
            'stall_number' => $request->stall_number,
            'type' => $request->type,
            'location' => $request->location,
            'size' => $request->size,
            'monthly_rate' => $request->monthly_rate,
            'status' => $request->status,
        ]);

        Cache::forget('rental_stats');

        return response()->json($property, 201);
    }

    public function updateProperty(Request $request, RentalProperty $property)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'stall_number' => 'nullable|string|max:50|unique:rental_properties,stall_number,' . $property->id,
            'type' => 'required|in:Commercial,Residential',
            'location' => 'required|string|max:255',
            'size' => 'required|string|max:255',
            'monthly_rate' => 'required|numeric|min:0',
            'status' => 'required|in:Occupied,Vacant,Under Maintenance',
        ], [
            'stall_number.unique' => 'This stall number is already taken. Please use a different stall number.',
        ]);

        $property->update([
            'name' => $request->name,
            'stall_number' => $request->stall_number,
            'type' => $request->type,
            'location' => $request->location,
            'size' => $request->size,
            'monthly_rate' => $request->monthly_rate,
            'status' => $request->status,
        ]);

        Cache::forget('rental_stats');

        return response()->json($property);
    }

    public function deleteProperty(RentalProperty $property)
    {
        // Delete property - all related contracts, payments, and maintenance records
        // will be deleted automatically due to cascade foreign keys
        // This preserves historical data while removing the property
        $property->delete();

        Cache::forget('rental_stats');

        return response()->json(['message' => 'Property deleted successfully']);
    }

    // ==================== TENANTS ====================

    public function getTenants()
    {
        $tenants = RentalTenant::with(['propertyRented'])->get();

        // Add computed fields for frontend compatibility
        $tenants = $tenants->map(function ($tenant) {
            return [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'businessName' => $tenant->business_name,
                'contactNumber' => $tenant->contact_number,
                'email' => $tenant->email,
                'propertyRented' => $tenant->propertyRented?->name,
                'contractStatus' => $tenant->contract_status,
                'depositPaid' => $tenant->deposit_paid,
                'lastPayment' => $tenant->last_payment_date?->format('Y-m-d'),
            ];
        });

        return response()->json($tenants);
    }

    public function createTenant(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'business_name' => 'nullable|string|max:255',
            'contact_number' => 'required|string|max:20',
            'email' => 'required|email',
            'property_rented_id' => 'nullable|exists:rental_properties,id',
            'contract_status' => 'required|in:Active,Inactive,Expired',
            'deposit_paid' => 'required|numeric|min:0',
        ]);

        $tenant = RentalTenant::create($request->only([
            'name',
            'business_name',
            'contact_number',
            'email',
            'property_rented_id',
            'contract_status',
            'deposit_paid',
        ]));

        Cache::forget('rental_stats');

        return response()->json($tenant, 201);
    }

    public function updateTenant(Request $request, RentalTenant $tenant)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'business_name' => 'nullable|string|max:255',
            'contact_number' => 'required|string|max:20',
            'email' => 'required|email',
            'property_rented_id' => 'nullable|exists:rental_properties,id',
            'contract_status' => 'required|in:Active,Inactive,Expired',
            'deposit_paid' => 'required|numeric|min:0',
        ]);

        $tenant->update($request->only([
            'name',
            'business_name',
            'contact_number',
            'email',
            'property_rented_id',
            'contract_status',
            'deposit_paid',
        ]));

        Cache::forget('rental_stats');

        return response()->json($tenant);
    }

    public function deleteTenant(RentalTenant $tenant)
    {
        // Check if tenant has active contracts
        if ($tenant->contracts()->where('status', 'Active')->exists()) {
            return response()->json(['error' => 'Cannot delete tenant with active contracts'], 400);
        }

        $tenant->delete();

        Cache::forget('rental_stats');

        return response()->json(['message' => 'Tenant deleted successfully']);
    }

    // ==================== CONTRACTS ====================

    public function getContracts()
    {
        $contracts = RentalContract::with(['property', 'tenant'])->get();

        // Add computed fields for frontend compatibility
        $contracts = $contracts->map(function ($contract) {
            return [
                'id' => $contract->id,
                'contractNumber' => $contract->contract_number,
                'property' => $contract->property?->name,
                'propertyId' => $contract->property_id,
                'tenant' => $contract->tenant?->name,
                'tenantId' => $contract->tenant_id,
                'startDate' => $contract->start_date->format('Y-m-d'),
                'endDate' => $contract->end_date->format('Y-m-d'),
                'monthlyRent' => $contract->monthly_rent,
                'deposit' => $contract->deposit,
                'status' => $contract->status,
                'daysRemaining' => $contract->getDaysRemaining(),
            ];
        });

        return response()->json($contracts);
    }

    public function createContract(Request $request)
    {
        $request->validate([
            'contract_number' => 'required|string',
            'property_id' => 'required|exists:rental_properties,id',
            'tenant_id' => 'required|exists:rental_tenants,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'monthly_rent' => 'required|numeric|min:0',
            'deposit' => 'required|numeric|min:0',
            'status' => 'required|in:Active,Expired,Terminated',
        ]);

        // Only check if THIS SPECIFIC property already has an active contract
        // (A property can only be rented to ONE tenant at a time)
        if (RentalContract::where('property_id', $request->property_id)
            ->where('status', 'Active')
            ->exists()) {
            return response()->json([
                'message' => 'This property is already occupied by another tenant'
            ], 422);
        }

        // Allow tenants to rent multiple properties (remove this check)
        // A tenant can rent multiple properties at the same time

        $contract = RentalContract::create($request->only([
            'contract_number',
            'property_id',
            'tenant_id',
            'start_date',
            'end_date',
            'monthly_rent',
            'deposit',
            'status',
        ]));

        Cache::forget('rental_stats');

        return response()->json($contract, 201);
    }

    public function updateContract(Request $request, RentalContract $contract)
    {
        $request->validate([
            'contract_number' => 'required|string',
            'property_id' => 'required|exists:rental_properties,id',
            'tenant_id' => 'required|exists:rental_tenants,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'monthly_rent' => 'required|numeric|min:0',
            'deposit' => 'required|numeric|min:0',
            'status' => 'required|in:Active,Expired,Terminated',
        ]);

        $contract->update($request->only([
            'contract_number',
            'property_id',
            'tenant_id',
            'start_date',
            'end_date',
            'monthly_rent',
            'deposit',
            'status',
        ]));

        Cache::forget('rental_stats');

        return response()->json($contract);
    }

    public function deleteContract(RentalContract $contract)
    {
        $contract->delete();

        Cache::forget('rental_stats');

        return response()->json(['message' => 'Contract deleted successfully']);
    }

    // ==================== PAYMENTS ====================

    public function getPayments()
    {
        $payments = RentalPayment::with(['tenant', 'property'])->get();

        // Add computed fields for frontend compatibility
        $payments = $payments->map(function ($payment) {
            return [
                'id' => $payment->id,
                'paymentNumber' => $payment->payment_number,
                'tenant' => $payment->tenant?->name,
                'property' => $payment->property?->name,
                'amount' => $payment->amount,
                'paymentDate' => $payment->payment_date?->format('Y-m-d'),
                'month' => $payment->month,
                'method' => $payment->method,
                'status' => $payment->status,
            ];
        });

        return response()->json($payments);
    }

    public function createPayment(Request $request)
    {
        $request->validate([
            'tenant_id' => 'required|exists:rental_tenants,id',
            'property_id' => 'required|exists:rental_properties,id',
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'nullable|date',
            'month' => 'required|string|max:255',
            'method' => 'nullable|string|max:255',
            'status' => 'required|in:Paid,Pending,Overdue',
        ]);

        // Auto-generate payment number
        $lastPayment = RentalPayment::orderBy('id', 'desc')->first();
        $nextNumber = $lastPayment ? intval(substr($lastPayment->payment_number, 4)) + 1 : 1;
        $paymentNumber = 'PAY-' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);

        $payment = RentalPayment::create([
            'payment_number' => $paymentNumber,
            'tenant_id' => $request->tenant_id,
            'property_id' => $request->property_id,
            'amount' => $request->amount,
            'payment_date' => $request->payment_date,
            'month' => $request->month,
            'method' => $request->input('method'),
            'status' => $request->status,
        ]);

        Cache::forget('rental_stats');

        return response()->json($payment, 201);
    }

    public function updatePayment(Request $request, RentalPayment $payment)
    {
        $request->validate([
            'tenant_id' => 'required|exists:rental_tenants,id',
            'property_id' => 'required|exists:rental_properties,id',
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'nullable|date',
            'month' => 'required|string|max:255',
            'method' => 'nullable|string|max:255',
            'status' => 'required|in:Paid,Pending,Overdue',
        ]);

        // Don't allow payment_number to be updated
        $payment->update($request->except('payment_number'));

        Cache::forget('rental_stats');

        return response()->json($payment);
    }

    public function deletePayment(RentalPayment $payment)
    {
        $payment->delete();

        Cache::forget('rental_stats');

        return response()->json(['message' => 'Payment deleted successfully']);
    }

    // ==================== MAINTENANCE ====================

    public function getMaintenance()
    {
        $maintenance = RentalMaintenance::with(['property', 'tenant'])->get();

        // Add computed fields for frontend compatibility
        $maintenance = $maintenance->map(function ($item) {
            return [
                'id' => $item->id,
                'requestNumber' => $item->request_number,
                'property' => $item->property?->name,
                'tenant' => $item->tenant?->name,
                'issue' => $item->issue,
                'priority' => $item->priority,
                'status' => $item->status,
                'dateReported' => $item->date_reported?->format('Y-m-d'),
                'assignedTo' => $item->assigned_to,
            ];
        });

        return response()->json($maintenance);
    }

    public function createMaintenance(Request $request)
    {
        $request->validate([
            'property_id' => 'required|exists:rental_properties,id',
            'tenant_id' => 'required|exists:rental_tenants,id',
            'issue' => 'required|string',
            'priority' => 'required|in:Low,Medium,High,Critical',
            'status' => 'required|in:Pending,In Progress,Completed',
            'date_reported' => 'required|date',
            'assigned_to' => 'nullable|string|max:255',
        ]);

        // Auto-generate request number
        $lastMaintenance = RentalMaintenance::orderBy('id', 'desc')->first();
        $nextNumber = $lastMaintenance ? intval(substr($lastMaintenance->request_number, 4)) + 1 : 1;
        $requestNumber = 'REQ-' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);

        $maintenance = RentalMaintenance::create([
            'request_number' => $requestNumber,
            'property_id' => $request->property_id,
            'tenant_id' => $request->tenant_id,
            'issue' => $request->issue,
            'priority' => $request->priority,
            'status' => $request->status,
            'date_reported' => $request->date_reported,
            'assigned_to' => $request->assigned_to,
        ]);

        Cache::forget('rental_stats');

        return response()->json($maintenance, 201);
    }

    public function updateMaintenance(Request $request, RentalMaintenance $maintenance)
    {
        $request->validate([
            'property_id' => 'required|exists:rental_properties,id',
            'tenant_id' => 'required|exists:rental_tenants,id',
            'issue' => 'required|string',
            'priority' => 'required|in:Low,Medium,High,Critical',
            'status' => 'required|in:Pending,In Progress,Completed',
            'date_reported' => 'required|date',
            'assigned_to' => 'nullable|string|max:255',
        ]);

        // Don't allow request_number to be updated
        $maintenance->update($request->except('request_number'));

        Cache::forget('rental_stats');

        return response()->json($maintenance);
    }

    public function deleteMaintenance(RentalMaintenance $maintenance)
    {
        $maintenance->delete();

        Cache::forget('rental_stats');

        return response()->json(['message' => 'Maintenance request deleted successfully']);
    }

    // ==================== DASHBOARD STATS ====================

    public function getStats()
    {
        $stats = Cache::remember('rental_stats', 1, function () {
            // Total Properties (active only)
            $totalProperties = RentalProperty::count();
            $occupiedProperties = RentalContract::where('status', 'Active')->distinct('property_id')->count('property_id');
            $vacantProperties = $totalProperties - $occupiedProperties;
                
            // Calculate expiring contracts (within 60 days)
            $expiringContracts = RentalContract::where('status', 'Active')
                ->where('end_date', '<=', now()->addDays(60))
                ->where('end_date', '>=', now())
                ->count();
                
            // Calculate monthly revenue from active contracts
            $monthlyRevenue = RentalContract::where('status', 'Active')->sum('monthly_rent');
                
            return [
                'total_properties' => $totalProperties,
                'occupied_properties' => $occupiedProperties,
                'vacant_properties' => $vacantProperties,
                'total_tenants' => RentalTenant::count(),
                'active_contracts' => RentalContract::where('status', 'Active')->count(),
                'pending_payments' => RentalPayment::where('status', 'Pending')->count(),
                'pending_maintenance' => RentalMaintenance::where('status', 'Pending')->count(),
                'monthly_revenue' => $monthlyRevenue,
                'expiring_contracts' => $expiringContracts,
            ];
        });

        return response()->json($stats);
    }
}
