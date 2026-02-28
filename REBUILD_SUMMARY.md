# Brooks Mechanics Frontend - Complete Rebuild

## Project Structure

The frontend has been completely rebuilt from the school management template to match Brooks Mechanics requirements.

## Pages Created

### Authentication
- **`/login`** - Login page with email/password authentication and role-based demo credentials

### Dashboards
- **`/dashboard/ceo`** - CEO Dashboard with business overview, metrics, and profit/loss
- **`/dashboard/manager`** - Manager Dashboard with approval functions and inventory management
- **`/dashboard/mechanic`** - Mechanic Dashboard with assigned cars and tasks
- **`/dashboard/receptionist`** - Receptionist Dashboard with car intake shortcut and quick actions

### Car Management
- **`/cars/intake`** - Car Intake Form - Receptionist logs new vehicle arrivals with customer info
- **`/cars`** - Cars List - View all cars with status filter and search
- **`/cars/[id]`** - Car Details Page - Multi-tab interface showing info, diagnostics, inventory, invoice, history

### Diagnostics & Service
- **`/diagnostics`** - Diagnostics management (placeholder - accessed from car details)

### Inventory Management
- **`/inventory`** - Inventory Dashboard - View stock items, quantities, prices

### Financial Management
- **`/invoices`** - Invoices List - View all invoices with status indicators
- **`/payments`** - Payments Tracking - Record and track customer payments

### Vendor Management
- **`/vendors`** - Vendors List - View vendor information and outstanding balances

### Reporting & Settings
- **`/reports`** - Reports Page - Generate financial and workshop reports
- **`/settings`** - Settings - System configuration, business info, markup rules
- **`/notifications`** - Notifications Center - View all system alerts and reminders

## API Integration

### API Service (`/src/lib/brooks-api.ts`)
Complete API client with endpoints for:
- **Authentication**: login, logout, getCurrentUser
- **Customers**: list, get, create, update
- **Cars**: list, get, create, update, updateStatus
- **Diagnostics**: create, get, update
- **Inventory**: list, get, create, update
- **Car Inventory Assignments**: list, create, delete
- **Invoices**: list, get, create, update, approve, discharge, reopen
- **Payments**: list, get, create
- **Vendors**: list, get, create
- **Outsourced Services**: list, get, create
- **Dashboard**: statistics, managersView
- **Notifications**: list, markAsRead
- **Reports**: financial, workshop

## Layout Components

### DashboardLayout (`/src/components/DashboardLayout.tsx`)
- Responsive sidebar with collapsible menu
- Role-based navigation items
- Top navigation bar with user info and logout
- Auto-redirects unauthenticated users to login

## Features Implemented

✅ **Authentication**
- JWT token-based authentication
- Role-based access control (CEO, Manager, Mechanic, Receptionist)
- Auto-redirect based on user role
- Logout functionality

✅ **Dashboard**
- CEO view with business metrics (cars in shop, outstanding debt, inventory value)
- Manager view with approval functions
- Mechanic view with assigned tasks
- Receptionist view with quick-action shortcuts

✅ **Car Workflow**
- Car intake form with customer and vehicle details
- Car list with status filters and search
- Car detail page with multi-tab interface

✅ **Financial Management**
- Invoice listing and tracking
- Payment recording
- Status indicators for overdue payments

✅ **Inventory Management**
- Stock item listing
- Low stock alerts
- Vendor association

✅ **Responsive Design**
- Tailwind CSS styling
- Mobile-friendly layout
- Color-coded status badges

## Environment Configuration

**File:** `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Running the Application

The frontend is running on `http://localhost:3001`

### Default Demo Credentials
```
CEO: ceo@brooks.com / password123
Manager: manager@brooks.com / password123
Mechanic: mechanic@brooks.com / password123
Receptionist: receptionist@brooks.com / password123
```

## Technologies Used

- **Framework**: Next.js 14.0.4
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 3.4.0
- **HTTP Client**: Fetch API
- **Charts**: Recharts 2.10.3 (prepared for future use)
- **Icons**: React Icons 4.12.0

## Next Steps

1. **Complete Page Implementations**
   - Add diagnostics form
   - Implement invoice builder
   - Add payment processing
   - Vendor payment tracking

2. **Enhanced Features**
   - Email integration for invoice distribution
   - PDF generation for reports
   - Routine service scheduling
   - Customer portal

3. **UI Improvements**
   - Add more charts and visualizations
   - Implement data export functionality
   - Add print templates
   - Mobile app optimization

4. **Backend Integration**
   - Verify all API endpoints are working
   - Add error handling and validation
   - Implement real-time notifications
   - Add audit logging

## Backend Requirements

Ensure the Django backend is running with:
- All 17 models created and migrated
- 40+ REST API endpoints implemented
- JWT authentication configured
- CORS enabled for http://localhost:3001
- Email configuration for notifications

Backend runs on `http://localhost:8000`
Frontend runs on `http://localhost:3001`
