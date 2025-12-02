# Authentication Implementation

This implementation provides JWT access tokens with refresh tokens and Google OAuth authentication.

## Features
- JWT access tokens (15 minutes expiry)
- Refresh tokens (7 days expiry)
- Google OAuth integration
- Token blacklisting for logout
- Simple implementation without passport

## API Endpoints

### Register
```
POST /api/v1/auth/register
Body: { username, email, password }
Response: { id, username, email, accessToken, refreshToken }
```

### Login
```
POST /api/v1/auth/login
Body: { email, password }
Response: { id, username, email, accessToken, refreshToken }
```

### Google OAuth
```
POST /api/v1/auth/google
Body: { token } // Google ID token from frontend
Response: { id, username, email, image, accessToken, refreshToken }
```

### Refresh Token
```
POST /api/v1/auth/refresh
Body: { refreshToken }
Response: { accessToken, user: { id, username, email } }
```

### Logout
```
POST /api/v1/auth/logout
Headers: Authorization: Bearer {accessToken}
Body: { refreshToken } // optional
Response: { message, timestamp }
```

### Get User Profile
```
GET /api/v1/auth/me
Headers: Authorization: Bearer {accessToken}
Response: { id, username, email }
```

## Environment Variables Required
```
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_super_secret_jwt_key_here
GOOGLE_CLIENT_ID=your_google_client_id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Database Changes
The schema includes:
- `RefreshToken` model for managing refresh tokens
- `AuthProvider` enum (LOCAL, GOOGLE)
- Updated User model with `googleId`, `provider`, `isVerified` fields
- Password field is now optional for OAuth users

## Frontend Integration

### Regular Login/Register
Use accessToken for authenticated requests, store refreshToken securely.

### Google OAuth
1. Use Google Sign-In library to get ID token
2. Send token to `/api/v1/auth/google`
3. Store returned tokens

### Token Refresh
When accessToken expires (401 error), use refreshToken to get new accessToken.

### Logout
Send both accessToken and refreshToken to logout endpoint to properly invalidate all tokens.