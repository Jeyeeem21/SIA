# 🔐 Admin Account Credentials

## Created Admin Accounts

### 1. Primary Admin Account
- **Email**: `admin@sia.com`
- **Password**: `admin123`
- **Full Name**: System Administrator
- **Role**: Admin
- **Status**: Active
- **Email Verified**: Yes

### 2. Test Admin Account
- **Email**: `test@example.com`
- **Password**: `password`
- **Full Name**: Test Admin
- **Role**: Admin
- **Status**: Active
- **Email Verified**: Yes

---

## How to Use

### Login to the System:
1. Open your React frontend: `http://localhost:5173`
2. Navigate to Login page
3. Use either admin credentials above
4. Access full admin features

### Run Seeder Again (if needed):
```bash
cd "c:\xampp\htdocs\Jeyeeem's files\SIA\SIA\laravel-backend"
php artisan db:seed --class=AdminSeeder
```

### Run All Seeders:
```bash
php artisan db:seed
```

### Reset Database & Reseed:
```bash
php artisan migrate:fresh --seed
```

---

## Seeder Location
- **File**: `database/seeders/AdminSeeder.php`
- **Called by**: `database/seeders/DatabaseSeeder.php`

---

## Security Notes
⚠️ **IMPORTANT**: Change these default passwords in production!

To change password in database:
```bash
php artisan tinker
>>> $user = User::find(1);
>>> $user->password = Hash::make('your_new_password');
>>> $user->save();
```

---

**Status**: ✅ Admin accounts created and verified
**Date**: December 10, 2025
