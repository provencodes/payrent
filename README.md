# PayRent - Real Estate Investment & Management Platform

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)

A comprehensive real estate investment and property management platform built with NestJS, enabling users to invest in properties, manage rentals, apply for loans, and track financial portfolios.

## 🚀 Features

### 🏠 Property Management
- **Multiple Investment Types**: Sale, Rent, Shares, Joint Ventures, Co-investment, Property Flipping
- **Property Listings**: Create and manage property listings with detailed information
- **Multi-tenant Rentals**: Support for multiple tenants per rental property
- **Property Status Tracking**: Real-time updates on property sales and rental status

### 💰 Financial Services
- **Multi-payment Options**: Card, Bank Transfer, Wallet, Direct Bank payments
- **Wallet System**: Integrated wallet for seamless transactions
- **Investment Tracking**: Comprehensive portfolio management
- **Financial Overview**: Complete transaction history and analytics

### 🏦 Tenant Services
- **Rent Savings Plans**: Automated savings for future rent payments
- **Loan Applications**: Apply for rental and deposit loans
- **Payment History**: Track all rental payments and transactions
- **Financial Planning**: Interest calculations and repayment schedules

### 👥 User Management
- **Multi-user Types**: Landlords, Tenants, Investors
- **Authentication**: JWT-based auth with email verification
- **Social Login**: Google and Facebook integration
- **Referral System**: Earn bonuses for successful referrals

## 🛠️ Technology Stack

- **Backend**: NestJS (Node.js)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT, Passport
- **Payment Gateway**: Paystack Integration
- **Email Service**: Nodemailer with Handlebars templates
- **File Storage**: Cloudinary
- **API Documentation**: Swagger/OpenAPI
- **Validation**: Class Validator
- **Configuration**: Environment-based config

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Yarn or npm
- Paystack account (for payments)
- Cloudinary account (for file uploads)

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd payRent
```

### 2. Install Dependencies
```bash
yarn install
# or
npm install
```

### 3. Environment Setup
Create `.env` file in the root directory:
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password
DATABASE_NAME=payrent_db

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Paystack
PAYSTACK_SECRET_KEY=your_paystack_secret
PAYSTACK_PUBLIC_KEY=your_paystack_public

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# App
PORT=3000
CLIENT_BASE_URL=http://localhost:3000
```

### 4. Database Setup
```bash
# Run migrations
yarn migration:run

# Or generate new migration
yarn migration:generate src/migrations/InitialMigration
```

### 5. Start the Application
```bash
# Development
yarn start:dev

# Production
yarn build
yarn start:prod
```

### 6. Access the Application
- **API**: http://localhost:3000
- **Swagger Documentation**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

## 📚 API Documentation

### Authentication Endpoints
```
POST /auth/register          # User registration
POST /auth/login             # User login
POST /auth/verify-email      # Email verification
POST /auth/forgot-password   # Password reset
POST /auth/google            # Google OAuth
POST /auth/facebook          # Facebook OAuth
```

### Property Endpoints
```
GET    /properties           # Get all properties
POST   /properties           # Create property
GET    /properties/:id       # Get property by ID
PATCH  /properties/:id       # Update property
DELETE /properties/:id       # Delete property
GET    /properties/:id/renters # Get property renters
GET    /properties/joint-ventures # Get joint venture properties
```

### Financial Endpoints
```
GET /financial/transactions   # Transaction history
GET /financial/wallet/history # Wallet transactions
GET /financial/payments/all   # Complete payment history
GET /financial/overview       # Financial overview
```

### Landlord Endpoints
```
POST /landlord/invest         # Initiate investment
POST /landlord/joint-ventures # Joint venture investment
```

### Tenant Endpoints
```
POST /tenant/rent-savings     # Create rent savings plan
POST /tenant/loan/apply       # Apply for loan
GET  /tenant/rent-payments    # Get rent payment history
GET  /tenant/loan-applications # Get loan applications
```

### Wallet Endpoints
```
GET  /wallet                  # Get wallet details
POST /wallet/fund             # Fund wallet
POST /wallet/pay              # Pay with wallet
POST /wallet/verify           # Verify funding
```

## 🏗️ Project Structure

```
src/
├── modules/
│   ├── auth/              # Authentication & authorization
│   ├── user/              # User management
│   ├── property/          # Property management
│   ├── payment/           # Payment processing
│   ├── wallet/            # Wallet operations
│   ├── landlord/          # Landlord-specific features
│   ├── tenant/            # Tenant-specific features
│   ├── mailer/            # Email services
│   └── cloudinary/        # File upload services
├── helpers/               # Utility functions
├── guards/                # Authentication guards
├── database/              # Database configuration
├── migrations/            # Database migrations
└── templates/             # Email templates
```

## 🔧 Configuration

### Financial Settings
```typescript
// config/app.config.ts
finance: {
  referralBonusKobo: 25000,    // ₦250 referral bonus
  baseInterestRate: 15,         // 15% base interest rate
  highAmountThreshold: 1000000, // ₦1M threshold
  longTermThreshold: 12,        // 12 months threshold
}
```

### Loan Configuration
```typescript
loan: {
  maxDebtToIncomeRatio: 0.4,   // 40% max debt-to-income
  minLoanAmount: 10000,        // ₦10,000 minimum
  maxLoanAmount: 5000000,      // ₦5,000,000 maximum
  minRepaymentPeriod: 3,       // 3 months minimum
  maxRepaymentPeriod: 24,      // 24 months maximum
}
```

## 🧪 Testing

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Test coverage
yarn test:cov
```

## 🚀 Deployment

### Using Docker
```bash
# Build image
docker build -t payrent .

# Run container
docker run -p 3000:3000 payrent
```

### Using PM2
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start ecosystem.config.js
```

## 📊 Database Schema

### Core Entities
- **Users**: User accounts and profiles
- **Properties**: Property listings and details
- **Payments**: Transaction records
- **Rentals**: Rental agreements
- **Wallets**: User wallet balances
- **WalletTransactions**: Wallet transaction history
- **RentSavings**: Tenant savings plans
- **LoanApplications**: Loan requests

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection prevention
- Rate limiting (recommended)
- CORS configuration
- Environment variable protection

## 📈 Performance Optimizations

- Database indexing on frequently queried fields
- Pagination for large datasets
- Query optimization with TypeORM
- Transaction management for data consistency
- Efficient error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation at `/api`

## 🔄 Changelog

### v1.0.0
- Initial release with core features
- Property management system
- Multi-payment integration
- Tenant and landlord portals
- Financial tracking and analytics

---

**Built with ❤️ using NestJS**