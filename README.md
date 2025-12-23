# Enterprise Dashboard - MyFamilyDoc.

A production-ready, GDPR-compliant enterprise dashboard built with React, TypeScript, Redux Toolkit, and Material-UI.

## 🚀 Features

### Core Functionality
- ✅ **Authentication Flow**: Email + Password + OTP (two-factor authentication)
- ✅ **Session Management**: Automatic token refresh and secure storage
- ✅ **Global State Management**: Redux Toolkit for predictable state updates
- ✅ **Responsive Design**: Mobile-first approach with Material-UI
- ✅ **Dark Mode**: Auto, light, and dark theme support
- ✅ **Accessibility**: WCAG 2.1 AA compliant components

### GDPR Compliance
- ✅ **Cookie Consent Banner**: Granular consent management
- ✅ **Data Export**: Right to data portability (JSON, CSV, PDF formats)
- ✅ **Account Deletion**: Right to erasure with confirmation flow
- ✅ **Audit Logging**: Client-side activity tracking for sensitive operations
- ✅ **Data Minimization**: Clear guidelines on what data should NOT be stored
- ✅ **Secure Error Handling**: No sensitive data in logs or error messages

### Security Features
- ✅ **Token-based Authentication**: JWT with automatic refresh
- ✅ **Protected Routes**: Authentication required for dashboard access
- ✅ **Retry Logic**: Automatic retry with exponential backoff
- ✅ **Error Boundaries**: Graceful error handling
- ✅ **XSS Prevention**: React's built-in protection + CSP headers
- ✅ **Secure Storage**: Tokens in localStorage with validation

## 📋 Prerequisites

- Node.js 18+ and npm 9+
- Modern web browser with JavaScript enabled

## 🛠️ Installation

1. **Clone or extract the project**
   ```bash
   cd dashboard-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update the API base URL if needed:
   ```env
   VITE_API_BASE_URL=https://test.myfamilydoc.it:443
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   The application will open at `http://localhost:3000`

## 📦 Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload

# Production
npm run build            # Build for production (outputs to /dist)
npm run preview          # Preview production build locally

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript type checking
```

## 🏗️ Project Structure

```
dashboard-project/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── CookieConsent.tsx
│   │   ├── MainLayout.tsx
│   │   ├── NotificationManager.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/               # Page components
│   │   ├── DashboardPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── GDPRPage.tsx
│   │   └── ErrorPages.tsx
│   ├── store/               # Redux store configuration
│   │   ├── index.ts
│   │   └── slices/
│   │       ├── authSlice.ts
│   │       └── uiSlice.ts
│   ├── services/            # API services
│   │   ├── api.ts           # Base API client
│   │   ├── auth.service.ts  # Authentication API
│   │   └── gdpr.service.ts  # GDPR compliance API
│   ├── hooks/               # Custom React hooks
│   │   └── index.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── theme/               # MUI theme configuration
│   │   └── index.ts
│   ├── router/              # React Router configuration
│   │   └── index.tsx
│   ├── App.tsx              # Root component
│   └── main.tsx             # Entry point
├── index.html               # HTML template
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite config
└── README.md                # This file
```

## 🔐 Authentication Flow

### 1. Login with Email & Password
```typescript
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "requiresOTP": true,
  "sessionId": "session-123"
}
```

### 2. Verify OTP
```typescript
POST /auth/otp/verify
{
  "email": "user@example.com",
  "otp": "123456",
  "sessionId": "session-123"
}

Response:
{
  "success": true,
  "tokens": {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token",
    "expiresIn": 3600
  },
  "user": { ... }
}
```

### 3. Automatic Token Refresh
The API client automatically refreshes expired tokens using the refresh token.

## 🎨 Theming

The application supports three theme modes:
- **Light**: Traditional light theme
- **Dark**: Dark theme for reduced eye strain
- **Auto**: Follows system preference

Customize the theme in `src/theme/index.ts`:
```typescript
export const colors = {
  primary: { main: '#1976d2' },
  // Add your brand colors
};
```

## ♿ Accessibility

This application is WCAG 2.1 AA compliant:
- Semantic HTML with proper ARIA labels
- Keyboard navigation support
- Screen reader friendly
- Focus indicators on all interactive elements
- Color contrast ratios meeting AA standards
- Skip to main content link

## 🛡️ Security Best Practices

### Data Storage Rules
**DO NOT STORE:**
- Credit card numbers
- Social security numbers
- Passwords (even hashed) in localStorage
- Sensitive health information without consent
- Precise geolocation without consent

**MINIMIZE STORAGE:**
- Store only essential profile data
- Clear tokens on logout
- Implement automatic data expiration
- Use session storage for temporary data

### Token Management
- Access tokens stored in localStorage
- Refresh tokens stored securely
- Automatic token validation before requests
- Token expiration checking
- Secure logout clears all tokens

### Error Handling
- No sensitive data in error messages
- Sanitized error logs
- User-friendly error pages
- Global error boundary

## 🌍 GDPR Compliance

### Cookie Consent
- Granular consent options (analytics, marketing, functional)
- Consent preferences stored locally
- Easy to update preferences
- Functional cookies cannot be disabled (required for operation)

### Data Rights
1. **Right to Access**: Users can view all personal data
2. **Right to Rectification**: Users can update their information
3. **Right to Erasure**: Account deletion with confirmation
4. **Right to Data Portability**: Export data in JSON, CSV, or PDF

### Audit Logging
All sensitive actions are logged:
- Data export requests
- Account deletion requests
- Consent changes
- Settings updates

Logs stored client-side (last 100 actions) and sent to backend for permanent storage.

## 📊 State Management

### Redux Store Structure
```typescript
{
  auth: {
    user: User | null,
    isAuthenticated: boolean,
    isLoading: boolean,
    error: ApiError | null,
    sessionId: string | null,
    requiresOTP: boolean
  },
  ui: {
    theme: 'light' | 'dark' | 'auto',
    sidebarOpen: boolean,
    notifications: Notification[],
    globalLoading: boolean
  }
}
```

## 🔄 API Integration

### Base URL
```typescript
const API_BASE_URL = 'https://test.myfamilydoc.it:443';
```

### Request Interceptor
Automatically adds Bearer token to all requests:
```typescript
Authorization: `Bearer ${accessToken}`
```

### Response Interceptor
- Handles token refresh on 401 errors
- Implements retry logic with exponential backoff
- Queues failed requests during token refresh

## 🚨 Error Handling

### HTTP Status Codes
- **401**: Unauthorized → Trigger token refresh
- **403**: Forbidden → Show error message
- **404**: Not Found → Redirect to 404 page
- **429**: Rate Limited → Retry with backoff
- **500**: Server Error → Show error page

### Retry Strategy
- Network errors: Retry 3 times
- Rate limits: Retry with exponential backoff
- Client errors (4xx): No retry
- Server errors (5xx): Retry once

## 🎯 Performance Optimization

- Code splitting by route
- Lazy loading of components
- Memoization of expensive computations
- Debounced search inputs
- Optimized bundle size with tree shaking
- Manual chunking for vendor libraries

## 🧪 Testing Recommendations

```bash
# Unit tests (to be implemented)
npm run test

# E2E tests (to be implemented)
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

Output directory: `dist/`

### Environment Configuration
Update these environment variables for production:
- `VITE_API_BASE_URL`: Production API endpoint
- `VITE_ENABLE_ANALYTICS`: Enable analytics tracking
- `VITE_ENABLE_ERROR_REPORTING`: Enable error reporting service

### Server Configuration
Configure your web server with:
- HTTPS only (redirect HTTP to HTTPS)
- Content Security Policy headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security header

### Example Nginx Config
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    # SSL configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Security headers
    add_header X-Frame-Options "DENY";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000";
    
    root /var/www/dashboard/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 📝 License

This project is proprietary and confidential.

## 🤝 Support

For support, email support@myfamilydoc.it

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [Material-UI](https://mui.com)
- [GDPR Compliance](https://gdpr.eu)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
