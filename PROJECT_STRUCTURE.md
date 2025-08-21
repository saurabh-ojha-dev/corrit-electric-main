# Rider Operations Management System - Complete Structure

## Project Overview
A comprehensive system for managing bike rental operations with rider onboarding, payment mandates, real-time tracking, and admin management.

## Technology Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Authentication:** JWT, bcryptjs
- **Payment:** PhonePe UPI Autopay, Webhooks
- **Real-time:** Socket.io
- **File Upload:** Multer, Cloudinary
- **Email:** Nodemailer
- **SMS:** Twilio (optional)

## Complete Folder Structure

```
corrit_electric/
│
├── /frontend                          # Next.js Frontend Application
│   ├── /app                           # Next.js App Router
│   │   ├── /admin                     # Admin routes
│   │   │   ├── /auth                  # Authentication pages
│   │   │   │   ├── /login
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── /register
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── /dashboard             # Main dashboard
│   │   │   │   ├── /customers         # Customer management
│   │   │   │   │   ├── /[id]          # Individual customer view
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── /payments          # Payment management
│   │   │   │   │   ├── /[id]          # Individual payment view
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── /riders            # Rider onboarding
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── /management        # Admin management
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── /tracking          # Vehicle tracking
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── /notifications     # Notification center
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── /reports           # Reports and analytics
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── /api                       # API routes (if needed)
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── /components                    # React Components
│   │   ├── /auth                      # Authentication components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── AuthLayout.tsx
│   │   ├── /dashboard                 # Dashboard components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── DashboardStats.tsx
│   │   │   └── DashboardLayout.tsx
│   │   ├── /customers                 # Customer management
│   │   │   ├── CustomerList.tsx
│   │   │   ├── CustomerCard.tsx
│   │   │   ├── CustomerForm.tsx
│   │   │   ├── CustomerDetails.tsx
│   │   │   └── CustomerSearch.tsx
│   │   ├── /payments                  # Payment components
│   │   │   ├── PaymentList.tsx
│   │   │   ├── PaymentCard.tsx
│   │   │   ├── PaymentHistory.tsx
│   │   │   ├── PaymentDetails.tsx
│   │   │   ├── MandateStatus.tsx
│   │   │   └── PaymentTrigger.tsx
│   │   ├── /riders                    # Rider components
│   │   │   ├── RiderList.tsx
│   │   │   ├── RiderCard.tsx
│   │   │   ├── RiderForm.tsx
│   │   │   ├── RiderOnboarding.tsx
│   │   │   ├── DocumentUpload.tsx
│   │   │   └── RiderVerification.tsx
│   │   ├── /admin                     # Admin management
│   │   │   ├── AdminList.tsx
│   │   │   ├── AdminCard.tsx
│   │   │   ├── AdminForm.tsx
│   │   │   ├── RoleManagement.tsx
│   │   │   └── AdminDetails.tsx
│   │   ├── /tracking                  # Vehicle tracking
│   │   │   ├── TrackingMap.tsx
│   │   │   ├── LocationHistory.tsx
│   │   │   ├── GeoFencing.tsx
│   │   │   └── BreadcrumbTrail.tsx
│   │   ├── /notifications             # Notification components
│   │   │   ├── NotificationList.tsx
│   │   │   ├── NotificationCard.tsx
│   │   │   ├── AlertSystem.tsx
│   │   │   └── NotificationCenter.tsx
│   │   ├── /reports                   # Reporting components
│   │   │   ├── RevenueReport.tsx
│   │   │   ├── PaymentReport.tsx
│   │   │   ├── RiderReport.tsx
│   │   │   └── ExportData.tsx
│   │   ├── /common                    # Shared components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── FilterDropdown.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   └── /forms                     # Form components
│   │       ├── LoginForm.tsx
│   │       ├── RegisterForm.tsx
│   │       ├── CustomerForm.tsx
│   │       ├── RiderForm.tsx
│   │       └── AdminForm.tsx
│   │
│   ├── /hooks                         # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useCustomers.ts
│   │   ├── usePayments.ts
│   │   ├── useRiders.ts
│   │   ├── useNotifications.ts
│   │   ├── useTracking.ts
│   │   └── useWebSocket.ts
│   │
│   ├── /utils                         # Utility functions
│   │   ├── api.ts                     # API client
│   │   ├── auth.ts                    # Authentication utilities
│   │   ├── validation.ts              # Form validation
│   │   ├── formatters.ts              # Data formatters
│   │   ├── constants.ts               # App constants
│   │   └── helpers.ts                 # Helper functions
│   │
│   ├── /types                         # TypeScript types
│   │   ├── auth.ts
│   │   ├── customer.ts
│   │   ├── payment.ts
│   │   ├── rider.ts
│   │   ├── admin.ts
│   │   ├── notification.ts
│   │   └── tracking.ts
│   │
│   ├── /styles                        # Additional styles
│   │   └── components.css
│   │
│   ├── /public                        # Static assets
│   │   ├── /images
│   │   ├── /icons
│   │   └── /documents
│   │
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── next.config.js
│
├── /backend                           # Express.js Backend
│   ├── /models                        # MongoDB Schemas
│   │   ├── Admin.js                   # Admin user model
│   │   ├── Rider.js                   # Rider/customer model
│   │   ├── Payment.js                 # Payment/mandate model
│   │   ├── Vehicle.js                 # Vehicle model
│   │   ├── Location.js                # Location tracking model
│   │   ├── Notification.js            # Notification model
│   │   ├── Document.js                # Document upload model
│   │   └── index.js                   # Model exports
│   │
│   ├── /routes                        # API Routes
│   │   ├── auth.js                    # Authentication routes
│   │   ├── riders.js                  # Rider management routes
│   │   ├── payments.js                # Payment routes
│   │   ├── vehicles.js                # Vehicle routes
│   │   ├── tracking.js                # Location tracking routes
│   │   ├── notifications.js           # Notification routes
│   │   ├── admin.js                   # Admin management routes
│   │   ├── webhooks.js                # Payment webhook routes
│   │   ├── reports.js                 # Reporting routes
│   │   └── index.js                   # Route exports
│   │
│   ├── /middleware                    # Express middleware
│   │   ├── auth.js                    # JWT authentication
│   │   ├── roleCheck.js               # Role-based access control
│   │   ├── validation.js              # Request validation
│   │   ├── upload.js                  # File upload middleware
│   │   ├── rateLimit.js               # Rate limiting
│   │   ├── errorHandler.js            # Error handling
│   │   └── logger.js                  # Request logging
│   │
│   ├── /controllers                   # Route controllers
│   │   ├── authController.js          # Authentication logic
│   │   ├── riderController.js         # Rider management logic
│   │   ├── paymentController.js       # Payment processing logic
│   │   ├── vehicleController.js       # Vehicle management logic
│   │   ├── trackingController.js      # Location tracking logic
│   │   ├── notificationController.js  # Notification logic
│   │   ├── adminController.js         # Admin management logic
│   │   ├── webhookController.js       # Webhook processing logic
│   │   └── reportController.js        # Reporting logic
│   │
│   ├── /services                      # Business logic services
│   │   ├── authService.js             # Authentication service
│   │   ├── riderService.js            # Rider service
│   │   ├── paymentService.js          # Payment service
│   │   ├── phonepeService.js          # PhonePe integration
│   │   ├── emailService.js            # Email service
│   │   ├── smsService.js              # SMS service
│   │   ├── trackingService.js         # Tracking service
│   │   ├── notificationService.js     # Notification service
│   │   ├── fileUploadService.js       # File upload service
│   │   └── reportService.js           # Report generation service
│   │
│   ├── /utils                         # Utility functions
│   │   ├── database.js                # Database connection
│   │   ├── validation.js              # Validation utilities
│   │   ├── encryption.js              # Encryption utilities
│   │   ├── formatters.js              # Data formatters
│   │   ├── constants.js               # App constants
│   │   ├── helpers.js                 # Helper functions
│   │   └── logger.js                  # Logging utilities
│   │
│   ├── /config                        # Configuration files
│   │   ├── database.js                # Database config
│   │   ├── email.js                   # Email config
│   │   ├── phonepe.js                 # PhonePe config
│   │   ├── cloudinary.js              # Cloudinary config
│   │   └── environment.js             # Environment variables
│   │
│   ├── /scripts                       # Database and utility scripts
│   │   ├── init-db.js                 # Database initialization
│   │   ├── seed-data.js               # Seed data script
│   │   ├── backup.js                  # Database backup
│   │   └── migration.js               # Database migrations
│   │
│   ├── /tests                         # Test files
│   │   ├── /unit                      # Unit tests
│   │   ├── /integration               # Integration tests
│   │   └── /e2e                       # End-to-end tests
│   │
│   ├── /docs                          # API documentation
│   │   ├── api.md                     # API documentation
│   │   └── setup.md                   # Setup guide
│   │
│   ├── server.js                      # Main server file
│   ├── package.json                   # Backend dependencies
│   ├── .env.example                   # Environment variables example
│   └── README.md                      # Backend documentation
│
├── /shared                            # Shared code between frontend/backend
│   ├── /types                         # Shared TypeScript types
│   ├── /constants                     # Shared constants
│   └── /utils                         # Shared utilities
│
├── /docs                              # Project documentation
│   ├── setup.md                       # Setup instructions
│   ├── api.md                         # API documentation
│   ├── deployment.md                  # Deployment guide
│   └── architecture.md                # System architecture
│
├── /deployment                        # Deployment files
│   ├── docker-compose.yml             # Docker compose
│   ├── Dockerfile.frontend            # Frontend Dockerfile
│   ├── Dockerfile.backend             # Backend Dockerfile
│   └── nginx.conf                     # Nginx configuration
│
├── package.json                       # Root package.json
├── README.md                          # Project overview
└── .gitignore                         # Git ignore file
```

## Database Schemas

### 1. Admin Schema
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  role: String (enum: ['Superadmin', 'admin', 'team_lead', 'support']),
  phone: String,
  assignedRegion: String,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Rider Schema
```javascript
{
  _id: ObjectId,
  riderId: String (unique, format: RID-{CITYCODE}{YY}{NNNN}),
  name: String,
  email: String,
  phone: String,
  upiId: String,
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  gender: String (enum: ['male', 'female', 'other']),
  weeklyRentAmount: Number,
  mandateStatus: String (enum: ['pending', 'active', 'failed', 'suspended']),
  documents: {
    aadhaar: String (file URL),
    pan: String (file URL),
    addressProof: String (file URL),
    bankProof: String (file URL),
    batteryCard: String (file URL, optional),
    picture: String (file URL)
  },
  verificationStatus: String (enum: ['pending', 'approved', 'rejected']),
  assignedAdmin: ObjectId (ref: 'Admin'),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Payment Schema
```javascript
{
  _id: ObjectId,
  riderId: ObjectId (ref: 'Rider'),
  mandateId: String (PhonePe mandate ID),
  amount: Number,
  status: String (enum: ['pending', 'success', 'failed', 'cancelled']),
  type: String (enum: ['weekly', 'monthly', 'one_time']),
  transactionId: String,
  orderId: String,
  utr: String,
  phonepeStatus: String,
  scheduledDate: Date,
  processedDate: Date,
  retryCount: Number,
  failureReason: String,
  webhookData: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Vehicle Schema
```javascript
{
  _id: ObjectId,
  riderId: ObjectId (ref: 'Rider'),
  vehicleNumber: String,
  vehicleType: String,
  gpsDeviceId: String,
  isActive: Boolean,
  assignedDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Location Schema
```javascript
{
  _id: ObjectId,
  riderId: ObjectId (ref: 'Rider'),
  vehicleId: ObjectId (ref: 'Vehicle'),
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  address: String,
  speed: Number,
  heading: Number,
  timestamp: Date,
  createdAt: Date
}
```

### 6. Notification Schema
```javascript
{
  _id: ObjectId,
  type: String (enum: ['payment_failed', 'mandate_expired', 'location_alert', 'system_alert']),
  title: String,
  description: String,
  riderId: ObjectId (ref: 'Rider'),
  adminId: ObjectId (ref: 'Admin'),
  isRead: Boolean,
  priority: String (enum: ['low', 'medium', 'high', 'critical']),
  actionRequired: Boolean,
  actionType: String,
  actionLink: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 7. Document Schema
```javascript
{
  _id: ObjectId,
  riderId: ObjectId (ref: 'Rider'),
  documentType: String (enum: ['aadhaar', 'pan', 'address_proof', 'bank_proof', 'battery_card', 'picture']),
  fileName: String,
  fileUrl: String,
  fileSize: Number,
  mimeType: String,
  uploadDate: Date,
  verificationStatus: String (enum: ['pending', 'approved', 'rejected']),
  verifiedBy: ObjectId (ref: 'Admin'),
  verifiedAt: Date,
  createdAt: Date
}
```

## API Endpoints Structure

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Admin registration
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Riders
- `GET /api/riders` - Get all riders with filters
- `POST /api/riders` - Create new rider
- `GET /api/riders/:id` - Get rider details
- `PUT /api/riders/:id` - Update rider
- `DELETE /api/riders/:id` - Delete rider
- `POST /api/riders/:id/documents` - Upload documents
- `PUT /api/riders/:id/verify` - Verify rider documents
- `POST /api/riders/:id/mandate` - Create PhonePe mandate

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments/trigger` - Trigger weekly payments
- `GET /api/payments/:id` - Get payment details
- `GET /api/payments/rider/:riderId` - Get rider payments
- `POST /api/payments/retry/:id` - Retry failed payment
- `PUT /api/payments/:id/cancel` - Cancel mandate

### Tracking
- `GET /api/tracking/current` - Get current locations
- `GET /api/tracking/:riderId` - Get rider location history
- `POST /api/tracking/update` - Update location (from GPS device)
- `GET /api/tracking/geofence` - Get geo-fencing data

### Notifications
- `GET /api/notifications` - Get all notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `POST /api/notifications/send` - Send notification

### Admin Management
- `GET /api/admin` - Get all admins
- `POST /api/admin` - Create new admin
- `PUT /api/admin/:id` - Update admin
- `DELETE /api/admin/:id` - Delete admin
- `PUT /api/admin/:id/suspend` - Suspend admin

### Reports
- `GET /api/reports/revenue` - Revenue reports
- `GET /api/reports/payments` - Payment reports
- `GET /api/reports/riders` - Rider reports
- `GET /api/reports/export` - Export data

### Webhooks
- `POST /api/webhooks/phonepe` - PhonePe webhook
- `POST /api/webhooks/location` - Location webhook

## Implementation Priority

### Phase 1: Core Foundation (Week 1-2)
1. Set up project structure
2. Implement authentication system
3. Create basic admin management
4. Set up database schemas

### Phase 2: Rider Management (Week 3-4)
1. Rider registration system
2. Document upload and verification
3. Rider ID generation
4. Basic CRUD operations

### Phase 3: Payment Integration (Week 5-6)
1. PhonePe integration
2. Mandate creation and management
3. Webhook processing
4. Payment status tracking

### Phase 4: Tracking & Notifications (Week 7-8)
1. Location tracking system
2. Real-time updates
3. Notification system
4. Alert management

### Phase 5: Advanced Features (Week 9-10)
1. Reporting and analytics
2. Data export functionality
3. Advanced filtering
4. Performance optimization

### Phase 6: Testing & Deployment (Week 11-12)
1. Comprehensive testing
2. Bug fixes
3. Documentation
4. Deployment setup

## Next Steps

1. **Set up the complete folder structure** as outlined above
2. **Create database schemas** in MongoDB
3. **Implement authentication system** with JWT
4. **Build core admin management** features
5. **Integrate PhonePe payment** system
6. **Add real-time tracking** capabilities
7. **Implement notification** system
8. **Create comprehensive** reporting

This structure provides a scalable, maintainable foundation for your Rider Operations Management System with all the features outlined in your proposal.
