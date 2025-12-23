# API Integration Guide

Complete guide for integrating this frontend with your backend API.

## 🔌 API Base URL

The application connects to:
```
https://test.myfamilydoc.it:443
```

Configure in `.env`:
```env
VITE_API_BASE_URL=https://test.myfamilydoc.it:443
```

## 🔐 Authentication Endpoints

### 1. Login (Step 1: Password)

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Expected Response (OTP Required):**
```json
{
  "success": true,
  "requiresOTP": true,
  "sessionId": "temp-session-abc123",
  "message": "OTP sent to your email"
}
```

**Alternative Response (Direct Login - No OTP):**
```json
{
  "success": true,
  "requiresOTP": false,
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  },
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "message": "Invalid email or password",
    "code": "INVALID_CREDENTIALS",
    "statusCode": 401
  }
}
```

---

### 2. Verify OTP (Step 2: Two-Factor Authentication)

**Endpoint:** `POST /auth/otp/verify`

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "sessionId": "temp-session-abc123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  },
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00Z",
    "lastLogin": "2024-01-15T10:30:00Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "message": "Invalid or expired OTP",
    "code": "INVALID_OTP",
    "statusCode": 401
  }
}
```

---

### 3. Request OTP (Optional - Manual OTP Request)

**Endpoint:** `POST /auth/otp/request`

**Request:**
```json
{
  "email": "user@example.com",
  "sessionId": "temp-session-abc123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

---

### 4. Get Current User

**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00Z",
    "lastLogin": "2024-01-15T10:30:00Z"
  }
}
```

---

### 5. Refresh Token

**Endpoint:** `POST /auth/refresh`

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Expected Response:**
```json
{
  "success": true,
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  }
}
```

---

### 6. Logout

**Endpoint:** `POST /auth/logout`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 📊 GDPR Compliance Endpoints

### 1. Request Data Export

**Endpoint:** `POST /gdpr/data-export`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Request:**
```json
{
  "email": "user@example.com",
  "dataTypes": ["profile", "activity", "consents"],
  "format": "json"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "exportId": "export-123",
    "estimatedTime": "5-10 minutes"
  }
}
```

---

### 2. Check Export Status

**Endpoint:** `GET /gdpr/data-export/{exportId}`

**Expected Response (Processing):**
```json
{
  "success": true,
  "data": {
    "status": "processing",
    "progress": 45
  }
}
```

**Expected Response (Complete):**
```json
{
  "success": true,
  "data": {
    "status": "completed",
    "downloadUrl": "https://api.example.com/exports/export-123.zip",
    "expiresAt": "2024-01-20T00:00:00Z"
  }
}
```

---

### 3. Request Account Deletion

**Endpoint:** `POST /gdpr/account-deletion`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Request:**
```json
{
  "userId": "user-123",
  "email": "user@example.com",
  "reason": "No longer need the service"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "requestId": "deletion-123",
    "confirmationRequired": true,
    "message": "Confirmation email sent"
  }
}
```

---

### 4. Confirm Account Deletion

**Endpoint:** `POST /gdpr/account-deletion/confirm`

**Request:**
```json
{
  "requestId": "deletion-123",
  "confirmationCode": "abc123xyz"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Account deletion scheduled",
  "deletionDate": "2024-01-22T00:00:00Z"
}
```

---

### 5. Get Personal Data Overview

**Endpoint:** `GET /gdpr/personal-data`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "activity": {
      "lastLogin": "2024-01-15T10:30:00Z",
      "loginCount": 42
    },
    "consents": {
      "analytics": true,
      "marketing": false,
      "functional": true,
      "timestamp": "2024-01-15T09:00:00Z"
    },
    "dataRetention": {
      "retentionPeriod": "2 years",
      "nextReviewDate": "2026-01-01"
    }
  }
}
```

---

## 🔄 Request/Response Interceptors

### Request Interceptor (Automatic)
All authenticated requests automatically include:
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

### Response Interceptor (Automatic)
- **401 Unauthorized**: Automatically triggers token refresh
- **Network errors**: Retries up to 3 times with exponential backoff
- **Rate limiting (429)**: Retries with backoff

---

## 🔑 JWT Token Structure

### Access Token
```json
{
  "sub": "user-123",
  "email": "user@example.com",
  "role": "user",
  "iat": 1234567890,
  "exp": 1234571490
}
```

**Expiration:** Typically 1 hour (3600 seconds)

### Refresh Token
```json
{
  "sub": "user-123",
  "type": "refresh",
  "iat": 1234567890,
  "exp": 1237159890
}
```

**Expiration:** Typically 30 days (2592000 seconds)

---

## 🚨 Error Codes

### Authentication Errors
- `INVALID_CREDENTIALS` - Wrong email/password
- `INVALID_OTP` - Wrong or expired OTP
- `OTP_EXPIRED` - OTP has expired
- `SESSION_EXPIRED` - Session ID invalid
- `TOKEN_EXPIRED` - Access token expired
- `INVALID_TOKEN` - Malformed or invalid token
- `REFRESH_TOKEN_EXPIRED` - Refresh token expired

### Authorization Errors
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `ACCOUNT_LOCKED` - Account temporarily locked
- `ACCOUNT_SUSPENDED` - Account suspended

### Validation Errors
- `INVALID_EMAIL` - Email format invalid
- `WEAK_PASSWORD` - Password doesn't meet requirements
- `REQUIRED_FIELD` - Required field missing

### Server Errors
- `INTERNAL_ERROR` - Generic server error
- `DATABASE_ERROR` - Database operation failed
- `SERVICE_UNAVAILABLE` - Service temporarily unavailable

---

## 🔧 Client Configuration

### Axios Configuration
```typescript
const apiClient = axios.create({
  baseURL: 'https://test.myfamilydoc.it:443',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Retry Logic
- **Max retries**: 3
- **Initial delay**: 1 second
- **Multiplier**: Exponential (1s, 2s, 4s)
- **Retry conditions**: Network errors, 5xx errors, 429 rate limit

---

## 📝 Backend Requirements

### CORS Headers
```
Access-Control-Allow-Origin: https://yourdomain.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

### Security Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### Rate Limiting
- **Authentication endpoints**: 5 requests per minute
- **General API**: 100 requests per minute
- **Data export**: 1 request per hour

---

## 🧪 Testing API Integration

### Using cURL

**Login:**
```bash
curl -X POST https://test.myfamilydoc.it:443/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**Verify OTP:**
```bash
curl -X POST https://test.myfamilydoc.it:443/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"123456","sessionId":"session-123"}'
```

**Get Current User:**
```bash
curl -X GET https://test.myfamilydoc.it:443/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman
1. Import the API endpoints
2. Set environment variable for `baseURL`
3. Create collection with authentication flow
4. Use Postman's automated token refresh

---

## 📊 Audit Logging

Frontend logs these actions to backend:
```typescript
interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}
```

**Endpoint:** `POST /audit/log`

**Example:**
```json
{
  "action": "DATA_EXPORT_REQUESTED",
  "resource": "user_data",
  "metadata": {
    "dataTypes": ["profile", "activity"],
    "format": "json"
  }
}
```

---

## 🔄 Token Refresh Flow

1. Client makes request with expired token
2. Server returns 401 Unauthorized
3. Client automatically calls `/auth/refresh` with refresh token
4. Server returns new access token
5. Client retries original request with new token
6. Original request succeeds

**This happens automatically!** No user intervention needed.

---

## 📱 Real-time Updates (Optional)

For real-time features, consider implementing:

### WebSocket Connection
```typescript
const ws = new WebSocket('wss://test.myfamilydoc.it/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle real-time update
};
```

### Server-Sent Events
```typescript
const eventSource = new EventSource('https://test.myfamilydoc.it/events');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle update
};
```

---

## 🎯 Implementation Checklist

### Backend Developer Checklist
- [ ] Implement all authentication endpoints
- [ ] Implement GDPR compliance endpoints
- [ ] Configure CORS headers
- [ ] Implement rate limiting
- [ ] Add security headers
- [ ] Set up JWT token generation/validation
- [ ] Implement OTP generation/sending
- [ ] Set up email service for OTP
- [ ] Implement audit logging
- [ ] Add input validation
- [ ] Add error handling
- [ ] Test all endpoints
- [ ] Document any deviations from this spec

### Frontend Integration Checklist
- [x] API client configured
- [x] Authentication flow implemented
- [x] Token management
- [x] Automatic token refresh
- [x] Error handling
- [x] Retry logic
- [x] GDPR endpoints integrated
- [x] Audit logging

---

## 🆘 Troubleshooting

### CORS Issues
**Problem:** "Access to fetch blocked by CORS policy"
**Solution:** Backend must return proper CORS headers

### 401 Errors Persisting
**Problem:** Token refresh failing
**Solution:** Check refresh token validity and expiration

### OTP Not Received
**Problem:** User doesn't receive OTP
**Solution:** Check email service configuration

### Rate Limiting
**Problem:** "Too many requests"
**Solution:** Implement proper rate limiting on backend

---

## 📞 Support

For API integration questions:
- Backend Team: backend@myfamilydoc.it
- Frontend Team: frontend@myfamilydoc.it
- DevOps: devops@myfamilydoc.it

---

## 🔄 API Versioning

Current version: `v1`

All endpoints prefixed with version:
```
https://test.myfamilydoc.it:443/v1/auth/login
```

When API changes:
- Increment version to `v2`
- Maintain backward compatibility
- Deprecate old version with 6-month notice
