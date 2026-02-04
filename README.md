# Pharmacy Stock Management System

A comprehensive pharmacy inventory management system built with **Angular 21** and **PrimeNG**, designed to streamline medicine inventory tracking, stock operations, and expiry management.

![Angular](https://img.shields.io/badge/Angular-21.0-DD0031?logo=angular)
![PrimeNG](https://img.shields.io/badge/PrimeNG-21.0-007ACC?logo=primeng)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [Key Modules](#-key-modules)
- [API Integration](#-api-integration)
- [Authentication](#-authentication)
- [Real-time Updates](#-real-time-updates)
- [Development](#-development)
- [Build](#-build)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 📊 Dashboard
- Real-time statistics and KPIs
- Critical and warning alerts for expiring medicines
- Recent stock movements tracking
- Low stock notifications
- Live updates via SignalR WebSocket

### 💊 Medicine Management
- Complete CRUD operations for medicines
- Category-based organization
- Medicine code and generic name tracking
- Manufacturer and storage condition information
- Low stock threshold configuration
- Active/inactive status management

### 📦 Inventory Operations
- **Receive Stock**: Record new medicine batches from suppliers
- **Dispense Stock**: FIFO-based automatic batch allocation
- **Stock Adjustment**: Manual quantity corrections with audit trail
- **Stock History**: Complete movement tracking with filters
- **Batch Management**: Track batch numbers, expiry dates, and quantities

### ⚠️ Expiry Management
- Automated expiry date monitoring
- Color-coded status indicators (Critical/Warning/Normal)
- Batch quarantine functionality
- Expired stock disposal tracking
- Return to supplier workflow

### 🏢 Supplier Management
- Supplier registration and tracking
- Contact information management
- Supplier-based batch tracking

### 👥 User & Access Control
- Role-based access control (RBAC)
- User management with role assignment
- Permission management per role
- Password change functionality
- Secure authentication with JWT tokens

### 🔔 Notifications
- Real-time system alerts
- Priority-based notifications
- User-specific and system-wide alerts
- Integration with dashboard widgets

## 🛠 Tech Stack

### Core Framework
- **Angular 21** - Modern web application framework
- **TypeScript 5.9** - Type-safe development
- **RxJS 7.8** - Reactive programming

### UI Components & Styling
- **PrimeNG 21** - Rich UI component library
- **PrimeIcons 7** - Icon set
- **Aura Theme** - Modern PrimeNG theme preset

### Additional Libraries
- **Chart.js 4.4** - Data visualization
- **@microsoft/signalr 10.0** - Real-time communication
- **Autoprefixer** - CSS vendor prefixing

### Development Tools
- **Angular CLI 21** - Project scaffolding and build tools
- **Vitest 4** - Unit testing framework
- **Prettier** - Code formatting
- **npm 11.6** - Package management

## 📋 Prerequisites

- **Node.js**: v18.x or higher
- **npm**: v11.6 or higher
- **Backend API**: ASP.NET Core backend running on `http://localhost:5041`

## 📥 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd PharmacyStock.Client
```

2. **Install dependencies**
```bash
npm install
```

## ⚙️ Configuration

### Environment Configuration

The application uses environment-based configuration located in `src/environments/`:

```typescript
// src/environments/environment.ts
export const environment = {
    production: false,
    apiUrl: '/api',
    hubUrl: 'http://localhost:5041/hubs/dashboard',
    logging: {
        enabled: true,
        level: 'debug' as 'debug' | 'info' | 'warn' | 'error'
    }
};
```

### Proxy Configuration

API requests are proxied to the backend server via `proxy.conf.json`:

```json
{
    "/api": {
        "target": "http://localhost:5041",
        "secure": false,
        "changeOrigin": true
    },
    "/hubs": {
        "target": "http://localhost:5041",
        "secure": false,
        "ws": true
    }
}
```

**Note**: Update the `target` URL if your backend runs on a different port.

## 🚀 Running the Application

### Development Server

```bash
npm start
# or
ng serve
```

Navigate to `http://localhost:4200/`. The application will automatically reload when source files change.

### Production Build

```bash
npm run build
```

Build artifacts will be stored in the `dist/` directory.

### Running Tests

```bash
npm test
```

## 📁 Project Structure

```
PharmacyStock.Client/
├── src/
│   ├── app/
│   │   ├── core/                    # Core services and constants
│   │   │   ├── constants/           # Application constants
│   │   │   └── services/            # Core services (logging, error handling)
│   │   ├── guards/                  # Route guards
│   │   │   └── auth.guard.ts        # Authentication guard
│   │   ├── interceptors/            # HTTP interceptors
│   │   │   └── auth.interceptor.ts  # JWT token & refresh logic
│   │   ├── layout/                  # Application layout components
│   │   │   ├── component/           # Layout structure (topbar, sidebar, footer)
│   │   │   └── service/             # Layout state management
│   │   ├── models/                  # TypeScript interfaces and types
│   │   │   └── models.ts            # All data models
│   │   ├── pages/                   # Feature modules
│   │   │   ├── auth/                # Authentication pages
│   │   │   ├── dashboard/           # Dashboard with widgets
│   │   │   ├── inventory/           # Stock operations
│   │   │   ├── medicines/           # Medicine management
│   │   │   ├── settings/            # User, role, and permission management
│   │   │   └── suppliers/           # Supplier management
│   │   ├── service/                 # Business logic services
│   │   │   ├── auth.service.ts      # Authentication
│   │   │   ├── category.service.ts  # Medicine categories
│   │   │   ├── dashboard.service.ts # Dashboard data
│   │   │   ├── expiry-rule.service.ts
│   │   │   ├── http.service.ts      # Base HTTP service
│   │   │   ├── inventory.service.ts # Inventory operations
│   │   │   ├── medicine.service.ts  # Medicine CRUD
│   │   │   ├── notification.service.ts
│   │   │   ├── role.service.ts      # Role & permissions
│   │   │   ├── stock-movement.service.ts
│   │   │   ├── supplier.service.ts  # Supplier CRUD
│   │   │   ├── user.service.ts      # User management
│   │   │   └── websocket.service.ts # SignalR integration
│   │   ├── app.component.ts         # Root component
│   │   ├── app.config.ts            # Application configuration
│   │   └── app.routes.ts            # Route definitions
│   ├── assets/                      # Static assets
│   ├── environments/                # Environment configurations
│   ├── index.html                   # Main HTML file
│   ├── main.ts                      # Application entry point
│   └── styles.scss                  # Global styles
├── angular.json                     # Angular CLI configuration
├── package.json                     # Dependencies and scripts
├── proxy.conf.json                  # Development proxy configuration
├── tailwind.config.js               # TailwindCSS configuration
├── tsconfig.json                    # TypeScript configuration
└── README.md                        # This file
```

## 🔑 Key Modules

### Dashboard Module
- **StatsWidget**: Displays key metrics (total medicines, inventory value, alerts)
- **RecentMovementsWidget**: Shows latest stock movements
- **NotificationsWidget**: Real-time alerts and notifications

### Inventory Module
- **Receive Stock**: Add new batches with supplier, batch number, expiry date
- **Stock List**: View all active batches with filtering
- **Dispense Stock**: Automatic FIFO allocation with preview
- **Stock Adjustment**: Manual corrections with reason tracking
- **Stock History**: Complete audit trail with date/type filters
- **Expiry Management**: Monitor and manage expiring stock

### Settings Module
- **User Management**: Create, update, activate/deactivate users
- **Role Management**: Define roles with descriptions
- **Role Permissions**: Assign granular permissions to roles
- **Expiry Rules**: Configure expiry alert thresholds

## 🔌 API Integration

The application communicates with a RESTful ASP.NET Core backend API. All HTTP requests are handled through the `HttpService` which provides:

- Centralized error handling
- Automatic retry logic
- Request/response logging
- Type-safe API calls

### Example Service Usage

```typescript
// Medicine Service
getMedicines(page: number = 1, pageSize: number = 10): Observable<PaginatedResult<Medicine>> {
    let params = new HttpParams()
        .set('page', page.toString())
        .set('pageSize', pageSize.toString());
    
    return this.http.get<PaginatedResult<Medicine>>(this.ENDPOINT, params);
}
```

## 🔐 Authentication

### Cookie-based Authentication
- JWT tokens stored in HTTP-only cookies
- Automatic token refresh on 401 responses
- Auth guard protecting all routes except login/forgot-password
- Logout redirects to login page

### Auth Flow
1. User submits credentials via login form
2. Backend validates and returns JWT tokens (stored in cookies)
3. `authInterceptor` handles 401 errors and token refresh
4. `authGuard` protects routes and checks authentication status

## 🔄 Real-time Updates

The application uses **SignalR** for real-time bidirectional communication:

### WebSocket Events
- **StatsUpdated**: Dashboard statistics refresh
- **AlertsUpdated**: Critical/warning alerts
- **MovementAdded**: New stock movement notifications
- **Notification**: System-wide alerts

### Connection Management
- Automatic reconnection on connection loss
- Connection status monitoring
- Configurable retry delays

## 💻 Development

### Code Style
- **Prettier** configured for consistent formatting
- **Strict TypeScript** mode enabled
- **Angular ESLint** rules enforced

### Path Aliases
```typescript
// Use @ alias for app imports
import { Medicine } from '@/models/models';
```

### Component Architecture
- Standalone components (Angular 21+)
- Signal-based state management
- Reactive forms with validation
- OnPush change detection where applicable

## 🏗 Build

### Development Build
```bash
npm run build
# or
ng build --configuration development
```

### Production Build
```bash
npm run build
# or
ng build --configuration production
```

**Production optimizations:**
- Minification and tree-shaking
- Output hashing for cache busting
- Bundle size budgets enforced
- Source maps disabled

### Build Configuration
- **Initial bundle**: Max 4MB (warning at 500kB)
- **Component styles**: Max 8kB (warning at 4kB)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Guidelines
- Follow Angular style guide
- Write meaningful commit messages
- Add unit tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Si Thu Kyaw**

---

## 🙏 Acknowledgments

- **Angular Team** - For the amazing framework
- **PrimeNG Team** - For the comprehensive UI component library
- **Community Contributors** - For continuous improvements and feedback
