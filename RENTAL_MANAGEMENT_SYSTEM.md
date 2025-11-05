# 🏢 Rental Property Management System

## Overview
A comprehensive module for managing school properties rented to external entities (canteen operators, boarding house owners, photocopy centers, etc.)

---

## 📋 System Components

### 1. **Properties Management**
Manage all rentable spaces within the school premises.

**Data Structure:**
```javascript
{
  property_id: 1,
  name: "School Canteen",
  type: "Commercial" | "Residential" | "Office",
  location: "Ground Floor, Main Building",
  size: "150 sqm",
  monthly_rate: 15000,
  status: "Occupied" | "Vacant" | "Under Maintenance",
  amenities: "Water, Electricity, Ventilation",
  description: "Fully equipped commercial kitchen space",
  photo_url: "/uploads/canteen.jpg"
}
```

**Features:**
- ✅ Add new properties with details (location, size, rate)
- ✅ Mark properties as Occupied/Vacant
- ✅ Track property amenities and features
- ✅ Upload property photos
- ✅ Set different rates for different property types

---

### 2. **Tenants Management**
Track all individuals/businesses renting school properties.

**Data Structure:**
```javascript
{
  tenant_id: 1,
  name: "Maria Santos",
  business_name: "Santos Canteen Services",
  contact_number: "09171234567",
  email: "maria.santos@gmail.com",
  address: "123 Main St, City",
  business_permit: "BP-2025-12345",
  valid_id_type: "Driver's License",
  valid_id_number: "N01-12-345678",
  emergency_contact: "Juan Santos - 09181234567",
  status: "Active" | "Inactive"
}
```

**Features:**
- ✅ Register new tenants with complete information
- ✅ Store business permits and valid ID details
- ✅ Track emergency contact information
- ✅ View tenant rental history
- ✅ Tenant account status management

---

### 3. **Contracts Management**
Handle rental agreements and lease terms.

**Data Structure:**
```javascript
{
  contract_id: 1,
  contract_number: "RNT-2025-001",
  property_id: 1,
  tenant_id: 1,
  start_date: "2025-07-01",
  end_date: "2026-06-30",
  monthly_rent: 15000,
  security_deposit: 30000,
  advance_payment: 15000, // First month
  payment_due_day: 5, // 5th of each month
  utilities_included: ["Water"],
  utilities_separate: ["Electricity"],
  contract_terms: "12-month lease...",
  status: "Active" | "Expired" | "Terminated",
  auto_renew: true | false,
  penalty_rate: 5, // 5% per month late fee
  signed_date: "2025-06-15"
}
```

**Features:**
- ✅ Create new rental contracts
- ✅ Specify payment terms and due dates
- ✅ Set security deposits and advance payments
- ✅ Define included and separate utilities
- ✅ Auto-renewal options
- ✅ Contract expiration warnings
- ✅ Contract renewal workflow
- ✅ Contract termination process

---

### 4. **Payments Management**
Track all rental payments and transactions.

**Data Structure:**
```javascript
{
  payment_id: 1,
  payment_number: "PAY-2025-011",
  contract_id: 1,
  tenant_id: 1,
  property_id: 1,
  amount: 15000,
  payment_type: "Monthly Rent" | "Deposit" | "Utilities" | "Penalty",
  payment_date: "2025-11-01",
  due_date: "2025-11-05",
  month_covered: "November 2025",
  payment_method: "Cash" | "Bank Transfer" | "Check" | "GCash",
  reference_number: "TRX123456789",
  status: "Paid" | "Pending" | "Overdue" | "Partial",
  late_fee: 0,
  receipt_url: "/receipts/PAY-2025-011.pdf",
  notes: "Paid in full"
}
```

**Features:**
- ✅ Record monthly rental payments
- ✅ Track payment due dates
- ✅ Automatic overdue detection
- ✅ Late fee calculation
- ✅ Multiple payment methods support
- ✅ Payment receipts generation
- ✅ Payment history per tenant
- ✅ Payment reminders/notifications

---

### 5. **Maintenance Requests**
Manage property maintenance and repair requests.

**Data Structure:**
```javascript
{
  request_id: 1,
  request_number: "MNT-2025-015",
  property_id: 1,
  tenant_id: 1,
  issue_type: "Plumbing" | "Electrical" | "Structural" | "Other",
  description: "Leaking faucet in kitchen area",
  priority: "Low" | "Medium" | "High" | "Critical",
  status: "Pending" | "In Progress" | "Completed" | "Cancelled",
  date_reported: "2025-11-03",
  assigned_to: "Maintenance Staff Name",
  scheduled_date: "2025-11-05",
  completed_date: null,
  cost: 500,
  photos: ["/maintenance/leak.jpg"],
  notes: "Fixed with new washer"
}
```

**Features:**
- ✅ Submit maintenance requests
- ✅ Priority-based queue
- ✅ Assign to maintenance staff
- ✅ Track repair costs
- ✅ Photo documentation
- ✅ Status updates
- ✅ Completion tracking

---

## 📊 Dashboard Statistics

**Monthly Overview:**
- Total Properties (Occupied vs Vacant)
- Total Active Tenants
- Monthly Rental Revenue
- Pending Payments Count
- Overdue Payments Alert
- Pending Maintenance Requests
- Expiring Contracts (30-day warning)

**Financial Summary:**
- Total Security Deposits Held
- Total Monthly Expected Revenue
- Total Collected This Month
- Total Outstanding Balance
- Average Occupancy Rate

---

## 🔄 Workflow Examples

### **New Tenant Onboarding:**
1. Register tenant in system with personal/business details
2. Create property contract with terms
3. Record security deposit payment
4. Record advance payment (first month)
5. Mark property as "Occupied"
6. Generate welcome packet/contract documents

### **Monthly Payment Process:**
1. System generates monthly bills (auto)
2. Send payment reminders 3 days before due date
3. Tenant pays (record payment with method)
4. Generate receipt
5. If overdue → calculate late fee
6. Send overdue notice

### **Contract Renewal:**
1. System alerts 60 days before expiration
2. Contact tenant for renewal intention
3. If renewing:
   - Create new contract (or extend current)
   - Update rates if applicable
   - Collect any additional deposits
4. If not renewing:
   - Schedule move-out inspection
   - Process security deposit return
   - Mark property as "Vacant"

### **Maintenance Request Flow:**
1. Tenant reports issue via system
2. Admin reviews and assigns priority
3. Assign to maintenance staff
4. Schedule repair date
5. Complete repair and document
6. Update cost if tenant-responsible
7. Close request

---

## 🗄️ Database Tables Needed

### **rental_properties**
```sql
CREATE TABLE rental_properties (
  property_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  type ENUM('Commercial', 'Residential', 'Office') NOT NULL,
  location VARCHAR(255) NOT NULL,
  size VARCHAR(50),
  monthly_rate DECIMAL(10,2) NOT NULL,
  status ENUM('Vacant', 'Occupied', 'Under Maintenance') DEFAULT 'Vacant',
  amenities TEXT,
  description TEXT,
  photo_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### **rental_tenants**
```sql
CREATE TABLE rental_tenants (
  tenant_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  business_name VARCHAR(100),
  contact_number VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  address TEXT,
  business_permit VARCHAR(100),
  valid_id_type VARCHAR(50),
  valid_id_number VARCHAR(50),
  emergency_contact VARCHAR(200),
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### **rental_contracts**
```sql
CREATE TABLE rental_contracts (
  contract_id INT PRIMARY KEY AUTO_INCREMENT,
  contract_number VARCHAR(50) UNIQUE NOT NULL,
  property_id INT NOT NULL,
  tenant_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent DECIMAL(10,2) NOT NULL,
  security_deposit DECIMAL(10,2) NOT NULL,
  advance_payment DECIMAL(10,2),
  payment_due_day INT DEFAULT 5,
  utilities_included JSON,
  utilities_separate JSON,
  contract_terms TEXT,
  status ENUM('Active', 'Expired', 'Terminated') DEFAULT 'Active',
  auto_renew BOOLEAN DEFAULT FALSE,
  penalty_rate DECIMAL(5,2) DEFAULT 5.00,
  signed_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES rental_properties(property_id),
  FOREIGN KEY (tenant_id) REFERENCES rental_tenants(tenant_id)
);
```

### **rental_payments**
```sql
CREATE TABLE rental_payments (
  payment_id INT PRIMARY KEY AUTO_INCREMENT,
  payment_number VARCHAR(50) UNIQUE NOT NULL,
  contract_id INT NOT NULL,
  tenant_id INT NOT NULL,
  property_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_type ENUM('Monthly Rent', 'Deposit', 'Utilities', 'Penalty') NOT NULL,
  payment_date DATE,
  due_date DATE NOT NULL,
  month_covered VARCHAR(20),
  payment_method ENUM('Cash', 'Bank Transfer', 'Check', 'GCash'),
  reference_number VARCHAR(100),
  status ENUM('Paid', 'Pending', 'Overdue', 'Partial') DEFAULT 'Pending',
  late_fee DECIMAL(10,2) DEFAULT 0,
  receipt_url VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_id) REFERENCES rental_contracts(contract_id),
  FOREIGN KEY (tenant_id) REFERENCES rental_tenants(tenant_id),
  FOREIGN KEY (property_id) REFERENCES rental_properties(property_id)
);
```

### **rental_maintenance**
```sql
CREATE TABLE rental_maintenance (
  request_id INT PRIMARY KEY AUTO_INCREMENT,
  request_number VARCHAR(50) UNIQUE NOT NULL,
  property_id INT NOT NULL,
  tenant_id INT NOT NULL,
  issue_type ENUM('Plumbing', 'Electrical', 'Structural', 'Other') NOT NULL,
  description TEXT NOT NULL,
  priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
  status ENUM('Pending', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Pending',
  date_reported DATE NOT NULL,
  assigned_to VARCHAR(100),
  scheduled_date DATE,
  completed_date DATE,
  cost DECIMAL(10,2) DEFAULT 0,
  photos JSON,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES rental_properties(property_id),
  FOREIGN KEY (tenant_id) REFERENCES rental_tenants(tenant_id)
);
```

---

## 🔐 Security & Permissions

**Admin Access:**
- Full CRUD on all modules
- Generate financial reports
- Approve contracts
- Process refunds

**Tenant Portal (Future):**
- View own contract details
- Submit maintenance requests
- View payment history
- Upload payment proofs

---

## 📈 Reports & Analytics

**Financial Reports:**
- Monthly revenue by property
- Payment collection rate
- Overdue payments list
- Security deposits held
- Maintenance costs per property

**Occupancy Reports:**
- Occupancy rate trends
- Vacant properties list
- Expiring contracts list
- Average rental duration

**Maintenance Reports:**
- Requests by property
- Response time analysis
- Maintenance cost breakdown
- Recurring issues tracking

---

## 🎯 Benefits

1. **Centralized Management** - All rental data in one system
2. **Automated Tracking** - Payment due dates, contract expirations
3. **Financial Clarity** - Clear revenue tracking and reporting
4. **Tenant Communication** - Organized maintenance and payment records
5. **Legal Documentation** - Contract storage and tracking
6. **Revenue Optimization** - Identify high-performing properties

---

## 📱 Mobile Responsive Design

All tables convert to cards on mobile devices:
- Property cards with key info
- Tenant cards with contact details
- Payment cards with status badges
- Maintenance request cards with priority indicators

---

## 🔄 Integration Points

**With Existing System:**
- Dashboard statistics include rental revenue
- Reports page can show rental income trends
- Settings can manage rental-related configurations

**Future Enhancements:**
- Email/SMS payment reminders
- Online tenant portal
- Digital contract signing
- Automated receipt generation
- Payment gateway integration

---

## 🚀 Implementation Status

✅ Frontend UI completed with modular design
✅ API endpoints defined
⏳ Backend controllers needed
⏳ Database migration needed
⏳ Form modals implementation
⏳ CRUD operations hookup

**Next Steps:**
1. Create Laravel migrations for 5 tables
2. Create Models (Property, Tenant, Contract, Payment, Maintenance)
3. Create RentalController with all CRUD methods
4. Implement form modals in Rentals.jsx
5. Connect frontend to backend APIs
6. Add validation and error handling
7. Test all workflows

---

## 📝 Notes

- All mock data is currently in frontend - replace with API calls
- Payment receipts can be generated as PDFs
- Consider adding document upload for contracts
- May need notification system for payment reminders
- Consider adding calendar view for maintenance scheduling
