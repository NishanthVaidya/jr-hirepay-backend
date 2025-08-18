# Authentication System

This document describes the authentication and role-based access control (RBAC) system implemented for the HirePay platform.

## Overview

The system implements JWT-based authentication with three user roles:
- **ADMIN**: Can manage users and has full system access
- **BACK_OFFICE**: Internal staff who can manage procedures and send documents
- **FRONT_OFFICE**: External users/consultants who can view and sign documents

## User Types (Actor Types)

- **BACK_OFFICE**: Internal staff members
- **FRONT_OFFICE**: External consultants/clients

## Setup Instructions

### 1. Backend Setup

1. **Start the backend server**:
   ```bash
   cd jr-hirepay-backend/hirepay
   ./mvnw spring-boot:run
   ```

2. **Bootstrap the first admin user**:
   - Navigate to `http://localhost:3000/bootstrap-admin`
   - Create the first admin user with email and password
   - This user will have both ADMIN and BACK_OFFICE roles

### 2. Frontend Setup

1. **Start the frontend**:
   ```bash
   cd jr-hirepay-backend/hirepay-web
   npm start
   ```

2. **Login as admin**:
   - Navigate to `http://localhost:3000/login`
   - Use the credentials created in the bootstrap step

3. **Create additional users**:
   - Navigate to `http://localhost:3000/admin`
   - Create users with appropriate roles and actor types

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/bootstrap-admin` - Create first admin user (public)
- `POST /api/auth/login` - User login (public)
- `POST /api/auth/users` - Create new user (admin only)

### Protected Endpoints

All other endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## User Management

### Creating Users

Admins can create users through the admin panel with:
- Email and password
- Actor type (BACK_OFFICE or FRONT_OFFICE)
- Roles (ADMIN, BACK_OFFICE, FRONT_OFFICE)

### Role Permissions

- **ADMIN**: Full system access, can create/manage users
- **BACK_OFFICE**: Can manage procedures, send documents, view all procedures
- **FRONT_OFFICE**: Can view assigned procedures, sign documents

## Security Features

- JWT tokens with configurable expiration (default: 120 minutes)
- BCrypt password hashing
- Role-based access control
- Stateless authentication
- CORS enabled for frontend integration

## Configuration

JWT settings in `application.properties`:
```properties
security.jwt.secret=change-this-to-a-long-random-string-in-production
security.jwt.ttl-minutes=120
```

## Next Steps

This authentication system provides the foundation for:
1. Document routing between back-office and front-office users
2. Integration with external storage systems (Google Drive, etc.)
3. Enhanced security with method-level authorization
4. Audit logging for user actions

## Usage Examples

### Backend API Calls with Authentication

```java
// Example: Creating a hiring request with authentication
@PostMapping("/api/hiring")
public ResponseEntity<Procedure> createHiring(@RequestBody CreateHiringRequest request) {
    // User is automatically authenticated via JWT filter
    // Access user info: SecurityContextHolder.getContext().getAuthentication()
    return hiringService.createHiring(request);
}
```

### Frontend API Calls

```typescript
// The API service automatically includes the JWT token
const response = await HiringService.create({
  consultantName: "John Doe",
  consultantEmail: "john@example.com"
});
```

## Troubleshooting

1. **Token Expired**: Re-login to get a new token
2. **Access Denied**: Check user roles and permissions
3. **Database Issues**: Ensure PostgreSQL is running and tables are created
4. **CORS Issues**: Check that frontend URL is allowed in backend CORS configuration
