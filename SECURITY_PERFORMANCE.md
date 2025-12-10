# Security & Performance Best Practices

## 🛡️ Security Recommendations

### 1. Authentication & Authorization

#### Token Security
```typescript
// ✅ DO: Store tokens securely
localStorage.setItem('auth_token', token); // For web apps
// Consider using httpOnly cookies for enhanced security in production

// ❌ DON'T: Store tokens in:
// - URL parameters
// - Session storage for long-term tokens
// - Plain text in code
```

#### Password Requirements
- Minimum 8 characters
- Mix of uppercase, lowercase, numbers, special characters
- Implement password strength meter
- Use bcrypt/argon2 on backend with proper salt rounds

#### Session Management
```typescript
// ✅ Implement session timeout
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// ✅ Refresh tokens before expiration
if (tokenExpiresIn < 5 * 60) { // 5 minutes before expiry
  await refreshToken();
}

// ✅ Clear session on logout
tokenManager.clearTokens();
sessionStorage.clear();
```

### 2. API Security

#### Request Validation
```typescript
// ✅ DO: Validate all inputs
const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
if (!emailRegex.test(email)) {
  throw new Error('Invalid email');
}

// ✅ DO: Sanitize user inputs
const sanitizedInput = DOMPurify.sanitize(userInput);
```

#### Rate Limiting
```typescript
// Implement client-side rate limiting for API calls
const rateLimiter = {
  requests: [],
  limit: 100,
  window: 60000, // 1 minute
  
  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.window);
    return this.requests.length < this.limit;
  },
  
  recordRequest(): void {
    this.requests.push(Date.now());
  }
};
```

#### CORS Configuration
```typescript
// Backend should have proper CORS headers
// Allow only specific origins in production
Access-Control-Allow-Origin: https://yourdomain.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

### 3. XSS Prevention

```typescript
// ✅ React automatically escapes content
<div>{userInput}</div> // Safe

// ❌ Dangerous: dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} /> // Unsafe!

// ✅ If you must use HTML, sanitize it
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

### 4. CSRF Protection

```typescript
// ✅ Use CSRF tokens for state-changing operations
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken,
  },
});
```

### 5. Content Security Policy (CSP)

Add to your HTML or server headers:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
               font-src 'self' https://fonts.gstatic.com;
               img-src 'self' data: https:;
               connect-src 'self' https://test.myfamilydoc.it;">
```

### 6. Secure Headers

Configure these headers on your web server:

```nginx
# Nginx configuration
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

### 7. Sensitive Data Handling

```typescript
// ❌ DON'T: Log sensitive data
console.log('User password:', password); // Never!
console.log('Credit card:', cardNumber); // Never!

// ✅ DO: Log safely
console.log('Login attempt for user:', email.replace(/(.{2}).*(@.*)/, '$1***$2'));

// ❌ DON'T: Store sensitive data
localStorage.setItem('ssn', ssn); // Never!
localStorage.setItem('password', password); // Never!

// ✅ DO: Store only necessary data
localStorage.setItem('user_id', userId);
localStorage.setItem('theme_preference', theme);
```

### 8. Dependencies Security

```bash
# Regularly audit dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update

# Use specific versions in package.json (avoid ^ and ~)
"react": "18.2.0" # Good
"react": "^18.2.0" # Less secure (auto-updates to 18.x.x)
```

---

## ⚡ Performance Recommendations

### 1. Code Splitting

```typescript
// ✅ Lazy load route components
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// ✅ Use Suspense
<Suspense fallback={<LoadingSpinner />}>
  <DashboardPage />
</Suspense>
```

### 2. Memoization

```typescript
// ✅ Memoize expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// ✅ Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);

// ✅ Memoize components
const MemoizedComponent = React.memo(MyComponent);
```

### 3. Virtual Scrolling

```typescript
// For large lists, use virtualization
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={400}
  itemCount={items.length}
  itemSize={50}
  width="100%"
>
  {Row}
</FixedSizeList>
```

### 4. Image Optimization

```typescript
// ✅ Use WebP format with fallback
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" alt="Description" loading="lazy" />
</picture>

// ✅ Lazy load images
<img src="image.jpg" loading="lazy" alt="Description" />

// ✅ Responsive images
<img 
  srcSet="small.jpg 480w, medium.jpg 800w, large.jpg 1200w"
  sizes="(max-width: 600px) 480px, (max-width: 900px) 800px, 1200px"
  src="medium.jpg"
  alt="Description"
/>
```

### 5. Bundle Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          'mui-vendor': ['@mui/material', '@mui/icons-material'],
        },
      },
    },
    // Minify and compress
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
      },
    },
  },
});
```

### 6. Caching Strategy

```typescript
// ✅ Cache API responses
const cache = new Map();

async function fetchWithCache(url: string, ttl = 5 * 60 * 1000) {
  const cached = cache.get(url);
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  
  const data = await fetch(url).then(r => r.json());
  cache.set(url, { data, timestamp: Date.now() });
  
  return data;
}

// ✅ Use service worker for offline caching (PWA)
// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### 7. Debouncing & Throttling

```typescript
// ✅ Debounce search inputs
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
  if (debouncedSearch) {
    performSearch(debouncedSearch);
  }
}, [debouncedSearch]);

// ✅ Throttle scroll events
const handleScroll = useCallback(
  throttle(() => {
    // Handle scroll
  }, 100),
  []
);
```

### 8. Network Optimization

```typescript
// ✅ Use HTTP/2 or HTTP/3
// Configure on server

// ✅ Enable compression (gzip/brotli)
// Nginx example:
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;

// ✅ Implement connection pooling
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  maxRedirects: 5,
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
});
```

### 9. Lighthouse Recommendations

Target scores:
- **Performance**: > 90
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: > 90

```bash
# Run Lighthouse audit
npx lighthouse https://yourdomain.com --view

# CI/CD integration
npx lighthouse-ci autorun
```

### 10. Monitoring & Analytics

```typescript
// ✅ Track performance metrics
if ('performance' in window) {
  window.addEventListener('load', () => {
    const perfData = performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    
    // Send to analytics
    analytics.track('page_load', {
      duration: pageLoadTime,
      url: window.location.href,
    });
  });
}

// ✅ Track errors
window.addEventListener('error', (event) => {
  // Send to error tracking service
  errorTracker.captureException(event.error);
});

// ✅ Track unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  errorTracker.captureException(event.reason);
});
```

---

## 📊 Performance Metrics to Monitor

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Other Important Metrics
- **TTFB (Time to First Byte)**: < 600ms
- **FCP (First Contentful Paint)**: < 1.8s
- **TTI (Time to Interactive)**: < 3.8s

---

## 🎯 Checklist Before Production

### Security
- [ ] All environment variables configured
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] CSP headers implemented
- [ ] Rate limiting on API endpoints
- [ ] Input validation on all forms
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention measures
- [ ] CSRF tokens implemented
- [ ] Dependencies audited and updated
- [ ] Secrets not committed to repository
- [ ] Error messages don't expose sensitive info
- [ ] Logging sanitized (no passwords/tokens)

### Performance
- [ ] Code splitting implemented
- [ ] Lazy loading for routes
- [ ] Images optimized and lazy loaded
- [ ] Bundle size analyzed and optimized
- [ ] Caching strategy implemented
- [ ] CDN configured for static assets
- [ ] Compression enabled (gzip/brotli)
- [ ] Service worker for offline support (optional)
- [ ] Performance monitoring configured
- [ ] Lighthouse score > 90

### GDPR
- [ ] Cookie consent banner implemented
- [ ] Privacy policy page created
- [ ] Terms of service page created
- [ ] Data export functionality working
- [ ] Account deletion functionality working
- [ ] Consent management working
- [ ] Audit logging implemented
- [ ] Data retention policy documented
- [ ] Data minimization rules followed

### Accessibility
- [ ] WCAG 2.1 AA compliance verified
- [ ] Keyboard navigation working
- [ ] Screen reader tested
- [ ] Focus indicators visible
- [ ] Alt text on all images
- [ ] Proper heading hierarchy
- [ ] Color contrast meets standards
- [ ] ARIA labels where needed

### Testing
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Cross-browser testing done
- [ ] Mobile responsiveness tested
- [ ] API error scenarios tested
- [ ] Load testing completed

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web.dev Performance](https://web.dev/performance/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [React Performance](https://react.dev/learn/render-and-commit)
- [GDPR Compliance Guide](https://gdpr.eu/)
