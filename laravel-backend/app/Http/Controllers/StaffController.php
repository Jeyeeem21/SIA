<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;
use App\Models\StaffInfo;
use App\Models\User;

class StaffController extends Controller
{
    // Get all staff with their info
    public function index()
    {
        $staff = Cache::remember('staff_all', 1, function () {
            return StaffInfo::with('user')->orderBy('created_at', 'desc')->get();
        });
        
        return response()->json([
            'staff' => $staff
        ]);
    }

    // Step 1: Save staff information (without creating user account yet)
    public function storeStaffInfo(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:staff_info,email|unique:users,email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'position' => 'nullable|string|max:100',
            'department' => 'nullable|string|max:100',
            'hire_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $staffInfo = StaffInfo::create([
            'full_name' => $request->full_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'date_of_birth' => $request->date_of_birth,
            'gender' => $request->gender,
            'position' => $request->position,
            'department' => $request->department,
            'hire_date' => $request->hire_date,
            'status' => 'pending', // Pending until account is created
        ]);

        return response()->json([
            'message' => 'Staff information saved successfully',
            'staff_info' => $staffInfo,
        ], 201);
    }

    // Step 2: Create user account for staff
    public function createStaffAccount(Request $request, $staffInfoId)
    {
        $staffInfo = StaffInfo::findOrFail($staffInfoId);

        // Check if user account already exists for this staff
        if ($staffInfo->user_id) {
            return response()->json([
                'message' => 'User account already exists for this staff member',
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Create user account
        $user = User::create([
            'full_name' => $staffInfo->full_name,
            'email' => $staffInfo->email,
            'password' => Hash::make($request->password),
            'phone' => $staffInfo->phone,
            'role' => 'staff',
            'status' => 'active',
            'email_verified' => true,
        ]);

        // Link user to staff info
        $staffInfo->update([
            'user_id' => $user->id,
            'status' => 'active',
        ]);

        return response()->json([
            'message' => 'Staff account created successfully',
            'user' => $user,
            'staff_info' => $staffInfo,
        ], 201);
    }

    // Update staff info
    public function updateStaffInfo(Request $request, $id)
    {
        $staffInfo = StaffInfo::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('staff_info')->ignore($staffInfo->id), Rule::unique('users')->ignore($staffInfo->user_id)],
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'position' => 'nullable|string|max:100',
            'department' => 'nullable|string|max:100',
            'hire_date' => 'nullable|date',
            'status' => 'nullable|in:pending,active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Only update specific validated fields (avoid updating extra fields from frontend)
        $staffInfo->update($request->only([
            'full_name',
            'email',
            'phone',
            'address',
            'date_of_birth',
            'gender',
            'position',
            'department',
            'hire_date',
            'status',
        ]));

        // If user account exists, update user info too
        if ($staffInfo->user_id) {
            $staffInfo->user->update([
                'full_name' => $request->full_name,
                'email' => $request->email,
                'phone' => $request->phone,
                'status' => $request->status ?? 'active',
            ]);
        }

        return response()->json([
            'message' => 'Staff information updated successfully',
            'staff_info' => $staffInfo->load('user'),
        ]);
    }

    // Delete staff
    public function destroy($id)
    {
        $staffInfo = StaffInfo::findOrFail($id);

        // Delete associated user if exists
        if ($staffInfo->user_id) {
            $staffInfo->user->delete();
        }

        $staffInfo->delete();

        return response()->json([
            'message' => 'Staff deleted successfully',
        ]);
    }

    // Get single staff info
    public function show($id)
    {
        $staffInfo = StaffInfo::with('user')->findOrFail($id);
        
        return response()->json([
            'staff_info' => $staffInfo
        ]);
    }

    // Check if email exists in staff_info or users table
    public function checkEmail(Request $request)
    {
        $email = $request->input('email');
        $staffInfoId = $request->input('staff_info_id'); // For edit mode
        
        $queryStaffInfo = StaffInfo::where('email', $email);
        $queryUsers = User::where('email', $email);
        
        if ($staffInfoId) {
            $queryStaffInfo->where('id', '!=', $staffInfoId);
            $staffInfo = StaffInfo::find($staffInfoId);
            if ($staffInfo && $staffInfo->user_id) {
                $queryUsers->where('id', '!=', $staffInfo->user_id);
            }
        }
        
        $existsInStaffInfo = $queryStaffInfo->exists();
        $existsInUsers = $queryUsers->exists();
        
        return response()->json([
            'available' => !$existsInStaffInfo && !$existsInUsers,
            'message' => ($existsInStaffInfo || $existsInUsers) ? 'Email is already taken' : 'Email is available'
        ]);
    }
}
