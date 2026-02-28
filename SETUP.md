# Quick Start Guide

## Installation Steps

### 1. Install Node.js
Make sure you have Node.js 18+ installed on your system.
Check version: `node --version`

### 2. Install Dependencies
Open PowerShell in the project directory and run:
```powershell
npm install
```

This will install:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- React Icons
- Recharts (for charts)
- And all development dependencies

### 3. Run the Development Server
```powershell
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

### 4. Access the Application

**Manager Dashboard:**
Navigate to: `http://localhost:3000/manager/dashboard`

**Administrator Dashboard:**
Navigate to: `http://localhost:3000/admin/dashboard`

## Project Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Default Routes

### Manager Pages
- Dashboard: `/manager/dashboard`
- Contacts: `/manager/contacts`
- Items: `/manager/items`
- Orders: `/manager/orders`
- Packages: `/manager/packages`
- Invoices: `/manager/invoices`
- Integrations: `/manager/integrations`
- Reports: `/manager/reports`

### Admin Pages
- Dashboard: `/admin/dashboard`
- Settings: `/admin/settings`
- Users: `/admin/settings/users`
- Company Profile: `/admin/settings/company-profile`
- Plus all Manager pages

## Customization

### Colors
Edit `tailwind.config.ts` to change the color scheme:
```typescript
colors: {
  primary: { ... },
  sidebar: { ... }
}
```

### Mock Data
Replace mock data in page files with actual API calls:
- Located in each page component
- Look for `const mock...` variables

### Types
Add or modify types in `src/types/index.ts`

## Troubleshooting

### Port 3000 already in use
```powershell
# Use a different port
npm run dev -- -p 3001
```

### TypeScript Errors
- Make sure all dependencies are installed
- Run `npm install` again if needed
- Check `tsconfig.json` for proper configuration

### Styling Issues
- Ensure Tailwind CSS is properly configured
- Check `postcss.config.js` and `tailwind.config.ts`
- Verify `globals.css` is imported in `layout.tsx`

## Next Steps

1. **Add Authentication**
   - Implement login/logout functionality
   - Add route protection based on roles

2. **Connect to Backend API**
   - Replace mock data with real API calls
   - Set up API routes in Next.js

3. **Implement Forms**
   - Add modal dialogs for create/edit operations
   - Form validation

4. **Add Charts**
   - Integrate Recharts in dashboard
   - Create custom chart components

5. **Enhance UI**
   - Add loading states
   - Implement toast notifications
   - Error boundaries

## Support

For questions or issues:
1. Check the main README.md
2. Review the code comments
3. Consult Next.js documentation: https://nextjs.org/docs
4. Tailwind CSS docs: https://tailwindcss.com/docs
