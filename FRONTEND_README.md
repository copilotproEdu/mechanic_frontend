# School Management System - Frontend

Next.js 14 frontend application for the School Management System.

## Features

- **Modern UI**: Clean and responsive interface built with Tailwind CSS
- **Type Safety**: Full TypeScript support
- **API Integration**: Complete REST API client for backend integration
- **Role-Based Views**: Different dashboards for Admin and Manager roles
- **Real-time Data**: Fetches and displays live data from the backend

## Pages & Routes

### Admin Routes (`/admin`)
- `/admin/dashboard` - Overview dashboard with statistics
- `/admin/students` - Student management
- `/admin/teachers` - Teacher management
- `/admin/classes` - Class management
- `/admin/subjects` - Subject management
- `/admin/attendance` - Attendance tracking
- `/admin/fees` - Fee management
- `/admin/enrollment` - Student enrollment
- `/admin/timetable` - Class timetable
- `/admin/results` - Exam results and report cards
- `/admin/users` - User management
- `/admin/reports` - Reports
- `/admin/audit-trail` - System audit logs
- `/admin/settings` - System settings

### Manager Routes (`/manager`)
- `/manager/dashboard` - Manager dashboard
- `/manager/students` - View students
- `/manager/teachers` - View teachers
- Plus other limited access features

## Components

### Core Components
- **Sidebar**: Navigation sidebar with role-based menus
- **Header**: Top header with user info and notifications
- **DataTable**: Reusable data table component
- **StatCard**: Statistics display cards
- **StatusBadge**: Status indicator badges
- **PageHeader**: Consistent page headers

### API Client

The `src/lib/api.ts` file provides a comprehensive API client:

```typescript
import api from '@/lib/api';

// Example: Fetch students
const students = await api.students.list({ status: 'active' });

// Example: Create student
const newStudent = await api.students.create({
  first_name: 'John',
  last_name: 'Doe',
  // ... other fields
});

// Example: Get statistics
const stats = await api.students.statistics();
```

## Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Getting Started

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production
```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js 14 app directory
│   ├── admin/             # Admin pages
│   ├── manager/           # Manager pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
│
├── components/            # Reusable components
│   ├── Sidebar.tsx        # Navigation sidebar
│   ├── Header.tsx         # Top header
│   ├── DataTable.tsx      # Data table
│   ├── StatCard.tsx       # Statistics card
│   └── ...
│
├── lib/                   # Utilities
│   └── api.ts            # API client
│
├── types/                 # TypeScript types
│   └── index.ts          # Type definitions
│
└── context/              # React context
    └── SidebarContext.tsx
```

## Styling

The project uses Tailwind CSS with a custom configuration:

### Theme Colors
- Primary: Custom blue theme
- Success: Green
- Warning: Yellow
- Danger: Red

### Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg, xl, 2xl

## Authentication

The app uses JWT token-based authentication:

1. User logs in via `/api/auth/login/`
2. Access token stored in localStorage
3. Token included in all API requests
4. Automatic redirect on token expiration

## Data Fetching

All data is fetched from the Django backend using the API client:

```typescript
// In component
const [students, setStudents] = useState([]);

useEffect(() => {
  api.students.list().then(data => {
    setStudents(data.results);
  });
}, []);
```

## Type Safety

TypeScript types are defined in `src/types/index.ts`:

```typescript
interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  // ... other fields
}
```

## Development Tips

### Hot Reload
Changes to files will automatically reload the page.

### API Integration
Test API endpoints with the backend running at http://localhost:8000

### Debugging
Use browser dev tools and console logs for debugging.

### Code Organization
- Keep components small and reusable
- Use TypeScript for type safety
- Follow Next.js conventions

## Common Tasks

### Adding a New Page
1. Create file in `src/app/admin/new-page/page.tsx`
2. Add route to sidebar in `src/components/Sidebar.tsx`
3. Implement page component

### Creating a New API Endpoint
1. Add method to `src/lib/api.ts`
2. Use in components with proper error handling

### Styling Components
Use Tailwind CSS classes for styling:

```tsx
<div className="bg-white rounded-lg shadow-sm p-6">
  <h2 className="text-xl font-bold mb-4">Title</h2>
</div>
```

## Troubleshooting

### API Connection Issues
- Verify backend is running at http://localhost:8000
- Check CORS settings in backend
- Verify API_URL in .env.local

### Build Errors
- Clear `.next` folder
- Delete `node_modules` and reinstall
- Check for TypeScript errors

### Style Issues
- Verify Tailwind CSS configuration
- Check for conflicting class names
- Ensure global styles are loaded

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)
