# Brooks Mechanics - Quick Start & Testing Guide

## ✅ System Status

**Backend**: Running on `http://localhost:8000`
**Frontend**: Running on `http://localhost:3001`

---

## 🚀 Quick Start

### Step 1: Access the Application
Open your browser and go to:
```
http://localhost:3001
```

You will be automatically redirected to the login page.

### Step 2: Login with Demo Credentials

Choose one of these accounts to test:

#### CEO Account (Full Access)
```
Email: ceo@brooks.com
Password: password123
```
**Leads to**: CEO Dashboard
**Access**: All features, reports, statistics

#### Manager Account (Approval & Inventory)
```
Email: manager@brooks.com
Password: password123
```
**Leads to**: Manager Dashboard
**Access**: Approve invoices, manage inventory, vendor payments

#### Mechanic Account (Service & Diagnostics)
```
Email: mechanic@brooks.com
Password: password123
```
**Leads to**: Mechanic Dashboard
**Access**: Diagnostics, car repair tracking, parts assignment

#### Receptionist Account (Car Intake)
```
Email: receptionist@brooks.com
Password: password123
```
**Leads to**: Receptionist Dashboard
**Access**: Car intake, invoice preparation, payment tracking

---

## 📋 Test Scenarios

### Scenario 1: Car Intake Workflow (Receptionist)

1. **Login** with receptionist@brooks.com
2. **Click** "Car Intake" button on dashboard
3. **Fill out the form**:
   - Customer Name: John Doe
   - Email: john@example.com
   - Phone: 0123456789
   - Plate: ABC123
   - Make: Toyota
   - Model: Camry
   - Mileage: 45000
   - Reason: Engine overheating
   - Routine Service: ✓ (Check if needed)
4. **Click** "Create Car Folder"
5. **Expected Result**: Redirected to car detail page

### Scenario 2: View Cars List

1. **Navigate** to Cars menu item
2. **See** list of all cars with:
   - Plate number
   - Make/Model
   - Customer name
   - Status badge
   - Action buttons
3. **Click** View button on any car
4. **Expected Result**: Opens car details with tabs

### Scenario 3: Car Details Page

1. **From Cars list**, click View on any car
2. **See tabs**:
   - Information (car & customer details)
   - Diagnostics (view/add notes)
   - Inventory (assigned parts)
   - Invoice (billing info)
   - History (timestamps)
3. **Switch tabs** to view different sections
4. **Expected Result**: All tabs load correctly

### Scenario 4: Dashboard Navigation

1. **Login** with CEO account
2. **View Dashboard** with:
   - Cars in Shop (metric card)
   - Outstanding Debt (metric card)
   - Vendor Credit (metric card)
   - Inventory Value (metric card)
   - Monthly Inflow/Expenditure chart
   - Quick stats section
3. **Test** logout button in top-right
4. **Expected Result**: Return to login page

### Scenario 5: Invoices & Payments

1. **Navigate** to Invoices
2. **See** list of all invoices with:
   - Invoice number
   - Car plate
   - Customer name
   - Total amount
   - Status badge (color-coded)
3. **Navigate** to Payments
4. **See** payment history with dates and methods
5. **Expected Result**: Data displays correctly

### Scenario 6: Inventory Management

1. **Navigate** to Inventory
2. **See** stock items with:
   - Item name
   - Category
   - Stock quantity (red if < 10)
   - Cost price
   - Selling price
3. **Expected Result**: Items display properly

### Scenario 7: Responsive Design

1. **Open** DevTools (F12)
2. **Toggle Device Toolbar** (mobile view)
3. **Test** sidebar collapse
4. **Navigate** through pages on mobile
5. **Expected Result**: Layout adapts to screen size

### Scenario 8: Role-Based Access

1. **Logout** (click logout button)
2. **Login** with different roles
3. **Observe** different dashboards and menu items
4. **Expected Result**: Each role sees appropriate content

---

## 🔍 What to Look For

### ✅ Good Signs (Everything Working)
- [ ] Login redirects to correct dashboard
- [ ] Sidebar navigation links work
- [ ] Data loads without errors
- [ ] Buttons respond to clicks
- [ ] Forms can be filled and submitted
- [ ] Logout returns to login page
- [ ] Page styling looks clean
- [ ] Responsive design works on mobile
- [ ] Status badges show colors
- [ ] Tables display data correctly

### ❌ Issues to Report
- [ ] Login fails
- [ ] Blank pages or missing data
- [ ] Navigation links don't work
- [ ] API errors in console
- [ ] Styling looks broken
- [ ] Forms can't be submitted
- [ ] Logout doesn't work
- [ ] Sidebar disappears
- [ ] Data doesn't load

---

## 🛠️ Troubleshooting

### Problem: Login fails
**Solution**:
1. Check backend is running: `python manage.py runserver`
2. Verify .env.local has correct API URL
3. Check browser console for errors (F12 → Console tab)
4. Try different demo credentials

### Problem: Pages show "Loading..." forever
**Solution**:
1. Open DevTools (F12) → Network tab
2. Check if API calls are succeeding
3. Look for 404 or 500 errors
4. Restart backend: `python manage.py runserver`

### Problem: Sidebar doesn't show
**Solution**:
1. Refresh the page (Ctrl+R)
2. Clear cache (Ctrl+Shift+Delete)
3. Check browser console for errors
4. Verify you're logged in

### Problem: Can't see API data
**Solution**:
1. Check backend has data: `http://localhost:8000/admin/`
2. Verify API endpoints exist: `http://localhost:8000/api/`
3. Check CORS is enabled in backend
4. Look at Network tab in DevTools

---

## 📊 Demo Data Expected

### Should Exist in Backend
- Multiple test customers
- Several cars with different statuses
- Sample inventory items
- Test vendors
- Demo users (4 accounts)
- Sample invoices and payments

If demo data is missing:
```bash
cd backend
python manage.py createsuperuser
python manage.py shell
# Then create test data as needed
```

---

## 📱 Browser Console Messages

### Expected Messages
```
✓ "GET /api/dashboard/statistics/" - data loaded
✓ "GET /api/cars/" - cars list loaded
✓ Token stored in localStorage
```

### Error Messages to Investigate
```
✗ "401 Unauthorized" - Token expired, login again
✗ "404 Not Found" - API endpoint doesn't exist
✗ "CORS error" - Backend CORS not configured
✗ "Network error" - Backend not running
```

---

## 🔐 Testing Authentication

### Test Valid Login
- Email: ceo@brooks.com
- Password: password123
- Expected: Dashboard loads

### Test Invalid Password
- Email: ceo@brooks.com
- Password: wrongpassword
- Expected: Error message shown

### Test Non-existent Email
- Email: nosuchuser@brooks.com
- Password: password123
- Expected: Error message shown

---

## 📋 Feature Checklist

### Dashboard Features
- [ ] CEO Dashboard shows metrics
- [ ] Manager Dashboard shows approval queue
- [ ] Mechanic Dashboard shows assigned cars
- [ ] Receptionist Dashboard shows quick actions

### Navigation
- [ ] Sidebar toggles open/closed
- [ ] Navigation links work
- [ ] Current page is highlighted
- [ ] Role-specific menus display

### Car Management
- [ ] Car intake form submits
- [ ] Cars list shows all cars
- [ ] Car details page loads
- [ ] Status badges show correct colors
- [ ] Tabs work on car detail page

### Data Tables
- [ ] Invoices show with status
- [ ] Payments display correctly
- [ ] Inventory shows stock levels
- [ ] Vendors list appears
- [ ] Notifications appear

### Forms
- [ ] Car intake form validates
- [ ] Required fields are marked
- [ ] Error messages appear
- [ ] Submit buttons are clickable
- [ ] Success redirects work

---

## 🎯 Performance Notes

Expected load times:
- Login page: < 2 seconds
- Dashboard: < 3 seconds
- Car list: < 2 seconds
- Car details: < 2 seconds

If slower:
1. Check network speed (DevTools → Network tab)
2. Check backend response time
3. Look for inefficient API calls

---

## 📞 Support

If you encounter issues:

1. **Check Backend**
   ```bash
   curl http://localhost:8000/api/
   ```

2. **Check Frontend**
   - DevTools Console (F12)
   - Network tab for failed requests
   - Application tab for stored data

3. **Restart Services**
   ```bash
   # Backend
   python manage.py runserver
   
   # Frontend
   npm run dev
   ```

4. **Clear Cache**
   - Ctrl+Shift+Delete (browser cache)
   - localStorage.clear() (in console)
   - Hard refresh: Ctrl+Shift+R

---

## ✅ Sign-Off Checklist

After testing, verify:
- [ ] Can login with all 4 roles
- [ ] Dashboard loads without errors
- [ ] Navigation works
- [ ] Car intake form works
- [ ] Data displays correctly
- [ ] Logout works
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] All pages load
- [ ] API connections working

---

**Ready to Test!** 🚀

Start at: `http://localhost:3001`
Backend at: `http://localhost:8000`
