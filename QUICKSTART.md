# 🚀 Quick Start Guide

Get your enterprise dashboard running in 5 minutes!

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ installed (`node --version`)
- ✅ npm 9+ installed (`npm --version`)
- ✅ A modern web browser (Chrome, Firefox, Safari, Edge)

## Installation Steps

### 1. Navigate to Project Directory
```bash
cd dashboard-project
```

### 2. Install Dependencies
```bash
npm install
```

This will install all required packages (~2-3 minutes).

### 3. Configure Environment (Optional)
```bash
cp .env.example .env
```

The default configuration works out of the box. Edit `.env` only if you need to change the API endpoint.

### 4. Start Development Server
```bash
npm run dev
```

The application will automatically open at **http://localhost:3000**

## 🎉 You're Ready!

### Test the Application

#### Login Credentials (Mock Data)
Since this connects to your existing backend at `https://test.myfamilydoc.it:443`, use your actual credentials:
- Email: `your-email@example.com`
- Password: `your-password`
- OTP: Will be sent to your email/phone

#### What You Can Do:
1. **Login** - Two-step authentication (Password → OTP)
2. **Dashboard** - View KPI widgets and statistics
3. **Profile** - View and edit your profile
4. **Settings** - Change theme, language, notifications
5. **GDPR** - Export your data or request account deletion

## 🎨 Features to Explore

### Theme Switching
- Click the sun/moon icon in the header
- Choose: Light, Dark, or Auto (system preference)

### Cookie Consent
- On first visit, you'll see a cookie consent banner
- Customize your preferences (Analytics, Marketing)

### Responsive Design
- Resize your browser window
- Works perfectly on mobile, tablet, and desktop

### Keyboard Navigation
- Press `Tab` to navigate
- Press `Enter` to activate
- Press `Escape` to close dialogs

## 📱 Mobile Testing

Open on your phone:
1. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Update Vite config to allow network access (already configured)
3. Visit `http://YOUR_IP:3000` on mobile

## 🛠️ Common Commands

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Check code quality
npm run type-check       # Check TypeScript types
```

## 📊 Project Overview

```
✅ Authentication with OTP
✅ Protected routes
✅ Redux state management
✅ Material-UI design
✅ Dark/Light theme
✅ GDPR compliance
✅ Cookie consent
✅ Responsive layout
✅ Accessibility (WCAG 2.1 AA)
✅ Error handling
✅ API integration
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000 (Mac/Linux)
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- --port 3001
```

### Dependencies Installation Failed
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### TypeScript Errors
```bash
# Check for type errors
npm run type-check

# Most errors are informational and won't prevent the app from running
```

### API Connection Issues
Check that:
1. Backend API is running at `https://test.myfamilydoc.it:443`
2. No CORS issues (backend should allow your origin)
3. Network/firewall not blocking requests

## 📚 Next Steps

1. **Read the Full Documentation**
   - [README.md](README.md) - Complete project documentation
   - [SECURITY_PERFORMANCE.md](SECURITY_PERFORMANCE.md) - Best practices
   - [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Code organization

2. **Customize the Application**
   - Edit `src/theme/index.ts` for brand colors
   - Modify `src/pages/` to add/edit pages
   - Update `src/services/` for additional API endpoints

3. **Deploy to Production**
   - Run `npm run build`
   - Deploy `dist/` folder to your hosting service
   - Configure environment variables
   - Enable HTTPS

## 🎯 Key Files to Explore

- `src/App.tsx` - Main application component
- `src/pages/LoginPage.tsx` - Authentication flow
- `src/pages/DashboardPage.tsx` - Main dashboard
- `src/services/api.ts` - API client configuration
- `src/store/slices/authSlice.ts` - Auth state management
- `src/theme/index.ts` - Design system

## 💡 Tips

1. **Keep the console open** - Check for helpful development logs
2. **Hot reload is enabled** - Changes reflect immediately
3. **Redux DevTools** - Install browser extension to debug state
4. **React DevTools** - Install browser extension to inspect components

## 🆘 Need Help?

- Check the [README.md](README.md) for detailed information
- Review [SECURITY_PERFORMANCE.md](SECURITY_PERFORMANCE.md) for best practices
- Examine code comments in each file
- Check console for error messages

## ✨ Success!

If you see the login page at http://localhost:3000, you're all set! 

The application is production-ready and follows enterprise best practices for:
- Security
- Performance
- Accessibility
- GDPR compliance
- Code quality

Happy coding! 🎉
