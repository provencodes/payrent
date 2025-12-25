# Database Seeding Guide

This document provides comprehensive information about seeding the PayRent database for development and testing purposes.

## Quick Start

For immediate testing, use the simple seed script:

```bash
node simple-seed.js
```

## Seed Data Overview

### Test Users Created

| User Type | Email | Password | Wallet Balance | Purpose |
|-----------|-------|----------|----------------|---------|
| Admin | `admin@payrent.com` | `password123` | ₦100,000 | System administration |
| Landlord | `landlord@payrent.com` | `password123` | ₦5,000,000 | Property management & investments |
| Tenant | `tenant@payrent.com` | `password123` | ₦100,000 | Property rentals & payments |

### User Details

#### Admin User
- **Full Name**: Admin User
- **Phone**: +2348012345678
- **Location**: Lagos, Lagos, Nigeria
- **Permissions**: Full system access
- **Email Verified**: Yes

#### Landlord User
- **Full Name**: John Landlord
- **Phone**: +2348012345679
- **Location**: Abuja, FCT, Nigeria
- **Wallet**: ₦5,000,000 (for property investments)
- **Email Verified**: Yes

#### Tenant User
- **Full Name**: Jane Tenant
- **Phone**: +2348012345680
- **Location**: Port Harcourt, Rivers, Nigeria
- **Wallet**: ₦100,000 (for rent payments)
- **Email Verified**: Yes

## Seeding Methods

### Method 1: Simple Seed Script (Recommended)

```bash
node simple-seed.js
```

**Advantages:**
- Fast execution
- No dependency issues
- Direct database connection
- Idempotent (safe to run multiple times)

### Method 2: NestJS Seed (Advanced)

```bash
yarn seed
```

**Note:** This method requires all TypeScript dependencies to be properly configured.

## Database Requirements

### Prerequisites
- PostgreSQL database running
- Database connection configured in `.env`
- Required tables created (run migrations first)

### Environment Variables
Ensure these are set in your `.env` file:
```env
DB_HOST=your_host
DB_PORT=5432
DB_NAME=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

## Testing Scenarios

### Authentication Testing
```bash
# Login as admin
POST /auth/login
{
  "email": "admin@payrent.com",
  "password": "password123"
}

# Login as landlord
POST /auth/login
{
  "email": "landlord@payrent.com",
  "password": "password123"
}

# Login as tenant
POST /auth/login
{
  "email": "tenant@payrent.com",
  "password": "password123"
}
```

### Wallet Testing
- Landlord has ₦5M for property investments
- Tenant has ₦100K for rent payments
- Admin has ₦100K for system operations

### Property Management Testing
- Use landlord account to create properties
- Use tenant account to rent properties
- Use admin account for approvals

## Customization

### Adding More Users
Edit `simple-seed.js` and add users to the `users` array:

```javascript
const users = [
  // existing users...
  {
    email: 'newuser@payrent.com',
    name: 'New User',
    password: await bcrypt.hash('password123', 10),
    userType: 'tenant',
    isEmailVerified: true,
    isActive: true,
    phoneNumber: '+2348012345681',
    city: 'Kano',
    state: 'Kano',
    country: 'Nigeria',
  }
];
```

### Modifying Wallet Balances
Change the wallet balance in the seed script:

```javascript
// Current logic
user.userType === 'landlord' ? '500000000' : '10000000'

// Custom amounts (in kobo)
user.userType === 'landlord' ? '1000000000' : '50000000' // ₦10M : ₦500K
```

## Troubleshooting

### Common Issues

1. **Connection Error**
   ```
   Error: connect ECONNREFUSED
   ```
   - Check database is running
   - Verify connection details in `.env`

2. **Table Not Found**
   ```
   Error: relation "users" does not exist
   ```
   - Run database migrations first: `yarn migration:run`

3. **Duplicate Key Error**
   ```
   Error: duplicate key value violates unique constraint
   ```
   - Seeding is idempotent, this means users already exist
   - Safe to ignore or clear database first

### Clearing Seed Data

To remove all seed data:

```sql
-- Remove wallets first (foreign key constraint)
DELETE FROM wallets WHERE "userId" IN (
  SELECT id FROM users WHERE email IN (
    'admin@payrent.com',
    'landlord@payrent.com', 
    'tenant@payrent.com'
  )
);

-- Remove users
DELETE FROM users WHERE email IN (
  'admin@payrent.com',
  'landlord@payrent.com',
  'tenant@payrent.com'
);
```

## Production Considerations

⚠️ **Warning**: Never run seeding scripts in production environments.

- Seed scripts are for development/testing only
- Use proper user registration flow in production
- Implement proper security measures for production data

## API Testing with Seed Data

### Swagger Documentation
Access Swagger at `http://localhost:3000/api` and use the seed credentials for testing.

### Postman Collection
Import the API endpoints and use these credentials:
- **Admin Token**: Login with admin credentials
- **Landlord Token**: Login with landlord credentials  
- **Tenant Token**: Login with tenant credentials

---

**Last Updated**: January 2025
**Version**: 1.0.0