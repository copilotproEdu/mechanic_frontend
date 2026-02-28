# Warehouse Management System (WMS)

A comprehensive warehouse management system built with Next.js 14, TypeScript, and Tailwind CSS. This application provides role-based access for Managers and Administrators to manage inventory, orders, invoices, packages, and more.

## 🚀 Features

### Manager Role
- **Dashboard**: Overview of orders, revenue, shipments, and key metrics
- **Contacts**: Manage customer information and details
- **Items**: Track inventory items with product codes, quantities, and status
- **Orders**: Create and manage customer orders with fulfillment tracking
- **Packages**: Track shipments with status updates
- **Invoices**: Generate and manage billing invoices
- **Integrations**: Connect to third-party services (payment, shipping, ecommerce)
- **Reports**: Generate analytics and business intelligence reports

### Administrator Role
All Manager features plus:
- **Settings**: System-wide configuration
  - User Management: Add, edit, remove users with role assignment
  - Company Profile: Manage company information and branding
  - Items Configuration: Configure product categories
  - Warehouse Locations: Manage warehouse zones
  - Inventory Adjustment: Stock level adjustments
  - System Configuration: Global settings

## 📁 Project Structure

```
DDI/
├── src/
│   ├── app/
│   │   ├── manager/          # Manager dashboard and pages
│   │   │   ├── dashboard/
│   │   │   ├── contacts/
│   │   │   ├── items/
│   │   │   ├── orders/
│   │   │   ├── packages/
│   │   │   ├── invoices/
│   │   │   ├── integrations/
│   │   │   └── reports/
│   │   ├── admin/            # Administrator dashboard and pages
│   │   │   ├── dashboard/
│   │   │   ├── settings/
│   │   │   │   ├── users/
│   │   │   │   ├── company-profile/
│   │   │   │   ├── items/
│   │   │   │   ├── locations/
│   │   │   │   ├── inventory/
│   │   │   │   └── configuration/
│   │   │   └── [shared pages]
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/           # Reusable components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── PageHeader.tsx
│   │   ├── StatCard.tsx
│   │   ├── DataTable.tsx
│   │   └── StatusBadge.tsx
│   └── types/
│       └── index.ts          # TypeScript type definitions
├── public/                   # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── next.config.js
```

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: React Icons (Feather Icons)
- **Charts**: Recharts (ready for integration)
- **State Management**: React Hooks

## 📦 Installation

1. **Install Dependencies**
   ```powershell
   npm install
   ```

2. **Run Development Server**
   ```powershell
   npm run dev
   ```

3. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎨 Design Implementation

The application is built to match the pictorial designs provided in the DDI folder:
- `manager-wms.gif` - Manager Dashboard reference
- `admin-wms1.gif` - Administrator Dashboard reference
- `contacts.jpg` - Contacts page design
- `items.jpg` - Items page design
- `orders.jpg` - Orders page design
- `packages.jpg` - Packages page design
- `invoices.jpg` - Invoices page design
- `integrations.jpg` - Integrations page design
- `reports-1.jpg` - Reports page design
- `settings-wms.png` - Settings page design
- `users-wms.png` - Users management design
- `company-profile-wms.png` - Company profile design

## 🔑 User Roles

### Manager
- Basic permissions for daily operations
- Can create/edit/delete items, orders, invoices
- View statistics and reports
- Cannot manage users or system settings

### Administrator
- Full system access and permissions
- All Manager capabilities
- User management (create/delete users)
- System configuration
- Company profile management

## 🎯 Key Features Implemented

### Data Tables
- Sortable columns
- Pagination support (ready to implement)
- Row click handlers
- Custom cell rendering

### Status Management
- Color-coded status badges
- Multiple status types (Draft, Confirmed, Paid, Shipped, etc.)
- Visual indicators for order fulfillment stages

### Dashboard Statistics
- Revenue tracking
- Order metrics
- Shipment monitoring
- Trend indicators

### Responsive Design
- Mobile-first approach
- Grid-based layouts
- Tailwind CSS breakpoints

## 🔄 Routes

### Manager Routes
- `/manager/dashboard` - Manager Dashboard
- `/manager/contacts` - Customer contacts
- `/manager/items` - Inventory items
- `/manager/orders` - Order management
- `/manager/packages` - Package tracking
- `/manager/invoices` - Invoice management
- `/manager/integrations` - Third-party integrations
- `/manager/reports` - Analytics and reports

### Administrator Routes
- `/admin/dashboard` - Admin Dashboard
- `/admin/settings` - Settings overview
- `/admin/settings/users` - User management
- `/admin/settings/company-profile` - Company information
- `/admin/settings/items` - Item configuration
- `/admin/settings/locations` - Warehouse locations
- `/admin/settings/inventory` - Inventory adjustments
- `/admin/settings/configuration` - System settings
- All manager routes are also available

## 🚧 Future Enhancements

1. **Authentication & Authorization**
   - Implement user login/logout
   - JWT token management
   - Role-based route protection

2. **API Integration**
   - Connect to backend API
   - Real-time data updates
   - CRUD operations

3. **Advanced Features**
   - Barcode scanning
   - Real-time notifications
   - Advanced filtering and search
   - Bulk operations
   - Export to CSV/PDF

4. **Charts & Analytics**
   - Integrate Recharts for data visualization
   - Custom dashboard widgets
   - Configurable reports

5. **Enhanced UI/UX**
   - Modal dialogs for forms
   - Toast notifications
   - Loading states
   - Error handling

## 📝 Development Notes

- All TypeScript errors shown during development are expected until dependencies are installed
- Mock data is currently used - replace with API calls
- Component structure follows atomic design principles
- Tailwind CSS custom classes defined in `globals.css`
- Type definitions in `src/types/index.ts` for type safety

## 🤝 Contributing

This is a custom warehouse management system. For modifications:
1. Update types in `src/types/index.ts`
2. Create components in `src/components/`
3. Add pages following the existing structure
4. Use Tailwind utility classes for styling

## 📄 License

Proprietary - All rights reserved

## 🆘 Support

For issues or questions, please refer to the documentation or contact the development team.

---

**Built with ❤️ using Next.js and TypeScript**
