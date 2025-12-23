# Complete Project Structure

```
dashboard-project/
│
├── public/                          # Static assets (optional)
│   └── favicon.ico
│
├── src/                             # Source code
│   │
│   ├── components/                  # Reusable UI components
│   │   ├── CookieConsent.tsx       # GDPR cookie consent banner
│   │   ├── MainLayout.tsx          # Main app layout with sidebar/header
│   │   ├── NotificationManager.tsx # Global notification system
│   │   └── ProtectedRoute.tsx      # Auth route wrapper
│   │
│   ├── pages/                       # Page components (routes)
│   │   ├── DashboardPage.tsx       # Main dashboard with KPIs
│   │   ├── LoginPage.tsx           # Login with email/password + OTP
│   │   ├── ProfilePage.tsx         # User profile management
│   │   ├── SettingsPage.tsx        # App settings (theme, notifications)
│   │   ├── GDPRPage.tsx            # GDPR compliance (export, delete)
│   │   └── ErrorPages.tsx          # 404 and 500 error pages
│   │
│   ├── store/                       # Redux state management
│   │   ├── index.ts                # Store configuration
│   │   └── slices/
│   │       ├── authSlice.ts        # Auth state (user, tokens, OTP)
│   │       └── uiSlice.ts          # UI state (theme, sidebar, notifications)
│   │
│   ├── services/                    # API service layer
│   │   ├── api.ts                  # Base API client (axios, interceptors)
│   │   ├── auth.service.ts         # Authentication API methods
│   │   └── gdpr.service.ts         # GDPR compliance API methods
│   │
│   ├── hooks/                       # Custom React hooks
│   │   └── index.ts                # Redux hooks, notification, media queries, etc.
│   │
│   ├── types/                       # TypeScript type definitions
│   │   └── index.ts                # User, Auth, API response types
│   │
│   ├── theme/                       # MUI theme configuration
│   │   └── index.ts                # Colors, typography, dark/light themes
│   │
│   ├── router/                      # React Router configuration
│   │   └── index.tsx               # Route definitions
│   │
│   ├── utils/                       # Utility functions (optional)
│   │   └── helpers.ts
│   │
│   ├── App.tsx                      # Root component
│   └── main.tsx                     # Application entry point
│
├── index.html                       # HTML template
│
├── Configuration Files
├── .env.example                     # Environment variables template
├── .eslintrc.cjs                    # ESLint configuration
├── .gitignore                       # Git ignore rules
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── tsconfig.node.json               # TypeScript config for Vite
├── vite.config.ts                   # Vite build configuration
│
└── Documentation
    ├── README.md                    # Main project documentation
    ├── SECURITY_PERFORMANCE.md      # Security and performance guide
    └── PROJECT_STRUCTURE.md         # This file
```

## 📁 Directory Breakdown

### `/src/components`
Reusable UI components that can be used across multiple pages.

**Key Components:**
- `CookieConsent.tsx`: GDPR-compliant cookie consent banner with granular controls
- `MainLayout.tsx`: Main application layout with responsive sidebar and header
- `NotificationManager.tsx`: Global notification/snackbar system
- `ProtectedRoute.tsx`: Higher-order component for route authentication

### `/src/pages`
Page-level components that correspond to application routes.

**Pages:**
- `LoginPage.tsx`: Two-step authentication (password → OTP verification)
- `DashboardPage.tsx`: Main dashboard with KPI cards and widgets
- `ProfilePage.tsx`: User profile viewing and editing
- `SettingsPage.tsx`: Application settings (theme, language, notifications)
- `GDPRPage.tsx`: GDPR compliance (data export, account deletion)
- `ErrorPages.tsx`: 404 Not Found and 500 Server Error pages

### `/src/store`
Redux Toolkit state management.

**Structure:**
- `index.ts`: Store configuration with reducers
- `slices/authSlice.ts`: Authentication state management
  - User data
  - Login/OTP flow
  - Token management
  - Session state
- `slices/uiSlice.ts`: UI state management
  - Theme preferences
  - Sidebar state
  - Notifications queue
  - Loading states

### `/src/services`
API service layer for backend communication.

**Services:**
- `api.ts`: Base Axios client with:
  - Request/response interceptors
  - Token management
  - Automatic token refresh
  - Retry logic
  - Error handling

- `auth.service.ts`: Authentication endpoints
  - Login (email + password)
  - Request OTP
  - Verify OTP
  - Get current user
  - Refresh token
  - Logout
  - Password reset

- `gdpr.service.ts`: GDPR compliance endpoints
  - Get/save consent preferences
  - Request data export
  - Request account deletion
  - Confirm deletion
  - Audit logging
  - Data minimization rules

### `/src/hooks`
Custom React hooks for common functionality.

**Hooks:**
- `useAppDispatch`: Typed Redux dispatch
- `useAppSelector`: Typed Redux selector
- `useNotification`: Show notifications (success, error, warning, info)
- `useMediaQuery`: Responsive design breakpoint detection
- `useDebounce`: Debounce values (search, inputs)
- `useLocalStorage`: Persistent local storage with error handling
- `useOnlineStatus`: Network connectivity status
- `useDocumentTitle`: Dynamic page title updates
- `useAsync`: Async operation state management
- `useFocusTrap`: Accessibility focus management

### `/src/types`
TypeScript type definitions and interfaces.

**Type Categories:**
- User and authentication types
- API response types
- Dashboard/KPI types
- GDPR compliance types
- Settings types
- Form validation types

### `/src/theme`
Material-UI theme configuration.

**Theme Structure:**
- Colors (primary, secondary, success, error, etc.)
- Typography (font families, sizes, weights)
- Spacing system (8px base unit)
- Breakpoints (xs, sm, md, lg, xl)
- Component overrides (buttons, cards, inputs)
- Light and dark mode variants
- WCAG 2.1 AA compliance

### `/src/router`
React Router v6 configuration.

**Routes:**
- `/login` - Public login page
- `/` - Protected dashboard (requires auth)
- `/profile` - Protected user profile
- `/settings` - Protected settings page
- `/gdpr` - Protected GDPR compliance page
- `/404` - Not found error page
- `/500` - Server error page
- `*` - Catch-all redirect to 404

## 🔑 Key Files

### `src/main.tsx`
Application entry point with:
- React render
- Error boundary
- Redux Provider wrapper

### `src/App.tsx`
Root component with:
- Redux Provider
- Theme Provider
- Router Provider
- Global components (CookieConsent, NotificationManager)

### `src/services/api.ts`
Base API client with:
- Axios instance configuration
- Request interceptor (adds auth token)
- Response interceptor (handles token refresh)
- Retry logic with exponential backoff
- Error handling and normalization
- Token management utilities

### `src/store/slices/authSlice.ts`
Authentication state management with async thunks:
- `loginWithPassword`: Step 1 of authentication
- `verifyOTP`: Step 2 of authentication
- `fetchCurrentUser`: Load user profile
- `logout`: Clear session
- `refreshSession`: Refresh expired tokens

### `src/theme/index.ts`
Design system configuration:
- Brand colors
- Typography scale
- Spacing system
- Component styling
- Dark/light mode themes
- Accessibility features

## 📦 Dependencies

### Core
- **react**: UI library
- **react-dom**: DOM bindings
- **react-router-dom**: Routing
- **typescript**: Type safety

### State Management
- **@reduxjs/toolkit**: Redux state management
- **react-redux**: React-Redux bindings

### UI Framework
- **@mui/material**: Material-UI components
- **@mui/icons-material**: Material-UI icons
- **@emotion/react**: Styling solution
- **@emotion/styled**: Styled components

### Forms
- **react-hook-form**: Form validation and management

### HTTP Client
- **axios**: HTTP requests

### Utilities
- **jwt-decode**: JWT token decoding (optional)

## 🚀 Build Output

After running `npm run build`:

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js          # Main bundle
│   ├── react-vendor-[hash].js   # React + React Router
│   ├── redux-vendor-[hash].js   # Redux Toolkit
│   ├── mui-vendor-[hash].js     # Material-UI
│   └── index-[hash].css         # Styles
└── [other static assets]
```

## 🧪 Testing Structure (Recommended)

```
src/
├── __tests__/                   # Test files
│   ├── components/
│   │   ├── CookieConsent.test.tsx
│   │   ├── MainLayout.test.tsx
│   │   └── ProtectedRoute.test.tsx
│   ├── pages/
│   │   ├── LoginPage.test.tsx
│   │   ├── DashboardPage.test.tsx
│   │   └── GDPRPage.test.tsx
│   ├── store/
│   │   ├── authSlice.test.ts
│   │   └── uiSlice.test.ts
│   ├── services/
│   │   ├── api.test.ts
│   │   ├── auth.service.test.ts
│   │   └── gdpr.service.test.ts
│   └── hooks/
│       └── index.test.ts
│
└── __mocks__/                   # Mock data
    ├── handlers.ts              # MSW handlers
    └── server.ts                # MSW server
```

## 📝 Code Organization Principles

### Single Responsibility
Each file/component has one clear purpose.

### DRY (Don't Repeat Yourself)
Common logic extracted to hooks and utilities.

### Separation of Concerns
- Components: UI rendering
- Services: API communication
- Store: State management
- Types: Type definitions
- Theme: Design tokens

### Naming Conventions
- **Components**: PascalCase (e.g., `MainLayout.tsx`)
- **Hooks**: camelCase with "use" prefix (e.g., `useNotification`)
- **Services**: camelCase with ".service" suffix (e.g., `auth.service.ts`)
- **Types**: PascalCase for interfaces (e.g., `User`, `AuthResponse`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

### File Structure
```typescript
// 1. Imports (external first, then internal)
import React from 'react';
import { Box, Typography } from '@mui/material';
import { useAppSelector } from '@/hooks';

// 2. Types/Interfaces
interface Props {
  // ...
}

// 3. Constants
const MAX_ITEMS = 10;

// 4. Component
const MyComponent: React.FC<Props> = ({ prop }) => {
  // 4a. Hooks
  const state = useAppSelector(...);
  
  // 4b. State
  const [local, setLocal] = useState();
  
  // 4c. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 4d. Handlers
  const handleClick = () => {
    // ...
  };
  
  // 4e. Render
  return (
    // JSX
  );
};

// 5. Export
export default MyComponent;
```

## 🎯 Next Steps

### Phase 1: Setup
✅ Project structure created
✅ Dependencies configured
✅ TypeScript setup
✅ Build configuration

### Phase 2: Core Features
✅ Authentication flow
✅ Protected routes
✅ Main layout
✅ Dashboard page
✅ API integration

### Phase 3: Additional Features
✅ User profile
✅ Settings page
✅ GDPR compliance
✅ Error handling

### Phase 4: Polish (Recommended)
- [ ] Add unit tests
- [ ] Add E2E tests
- [ ] Implement analytics
- [ ] Add error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Add more charts/visualizations
- [ ] Implement real-time updates (WebSocket)
- [ ] Add PWA features
- [ ] Internationalization (i18n)

### Phase 5: Deployment
- [ ] Environment configuration
- [ ] CI/CD pipeline
- [ ] Docker containerization
- [ ] Kubernetes deployment (optional)
- [ ] CDN setup
- [ ] Monitoring and logging
- [ ] Backup strategy

## 📚 Related Documentation

- [README.md](README.md) - Main project documentation
- [SECURITY_PERFORMANCE.md](SECURITY_PERFORMANCE.md) - Security and performance guide
- [.env.example](.env.example) - Environment variables
