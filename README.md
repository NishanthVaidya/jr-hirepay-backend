# HirePay - Get Hired and Get Paid

A comprehensive hiring and payment management system built with Spring Boot backend and React frontend.

## 🚀 Features

### Authentication & User Management
- JWT-based authentication
- Role-based access control (ADMIN, BACK_OFFICE, FRONT_OFFICE)
- User creation and management
- Flexible designation system

### Document Management System
- Umbrella Agreement workflow
- Document versioning and status tracking
- File upload and storage
- Google Drive integration (simulated)

### Hiring Process
- Step-by-step hiring workflow
- Task order management
- Document signing and approval
- Status tracking and notifications

## 🏗️ Architecture

### Backend (Spring Boot)
- **Framework**: Spring Boot 3.5.4
- **Database**: PostgreSQL
- **Security**: Spring Security with JWT
- **API Documentation**: OpenAPI/Swagger
- **Port**: 8080

### Frontend (React)
- **Framework**: React 18 with TypeScript
- **Routing**: React Router
- **State Management**: React Context API
- **Port**: 3001

## 📁 Project Structure

```
hirepay/
├── jr-hirepay-backend/
│   ├── hirepay/                 # Spring Boot Backend
│   │   ├── src/main/java/
│   │   │   └── com/justresults/hirepay/
│   │   │       ├── business/services/    # Business logic
│   │   │       ├── controller/           # REST controllers
│   │   │       ├── domain/               # JPA entities
│   │   │       ├── dto/                  # Data transfer objects
│   │   │       ├── repository/           # JPA repositories
│   │   │       ├── security/             # JWT and security config
│   │   │       └── util/                 # Utility classes
│   │   └── src/main/resources/
│   │       └── application.properties    # Configuration
│   └── hirepay-web/             # React Frontend
│       ├── src/
│       │   ├── components/      # React components
│       │   ├── contexts/        # React contexts
│       │   ├── pages/           # Page components
│       │   ├── services/        # API services
│       │   └── routers/         # Routing configuration
│       └── public/              # Static assets
```

## 🛠️ Setup Instructions

### Prerequisites
- Java 17 or higher
- Node.js 16 or higher
- PostgreSQL 14 or higher
- Maven 3.6 or higher

### Database Setup
1. Create a PostgreSQL database named `hirepay`
2. Update database credentials in `jr-hirepay-backend/hirepay/src/main/resources/application.properties`

### Backend Setup
```bash
cd jr-hirepay-backend/hirepay
./mvnw spring-boot:run
```

The backend will start on http://localhost:8080

### Frontend Setup
```bash
cd jr-hirepay-backend/hirepay-web
npm install
npm start
```

The frontend will start on http://localhost:3001

## 🔐 Default Users

### Admin User
- **Email**: nishanth@zform.co
- **Password**: (set during bootstrap)
- **Roles**: ADMIN, BACK_OFFICE
- **Designation**: System Administrator

### Test User
- **Email**: nisvaidya@gmail.com
- **Password**: (set during creation)
- **Roles**: FRONT_OFFICE
- **Designation**: Consultant

## 📋 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/bootstrap-admin` - Bootstrap admin user

### User Management
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `GET /api/users/front-office` - List front office users

### Document Workflow
- `POST /api/documents/send` - Send document to user
- `POST /api/documents/sign` - Sign document
- `GET /api/documents/{userId}` - Get user documents

### Umbrella Agreement
- `POST /api/umbrella-agreement/send` - Send umbrella agreement
- `POST /api/umbrella-agreement/sign` - Sign agreement
- `POST /api/umbrella-agreement/review` - Review signed agreement
- `POST /api/umbrella-agreement/save-to-drive` - Save to Google Drive

## 🔄 Workflow

### Umbrella Agreement Process
1. **Back Office** sends Umbrella Agreement to Front Office users
2. **Front Office** receives and reviews the agreement
3. **Front Office** signs the agreement (types name and confirms)
4. **Back Office** reviews the signed agreement
5. **Back Office** approves and saves to Google Drive

## 🚀 Development

### Running Tests
```bash
# Backend tests
cd jr-hirepay-backend/hirepay
./mvnw test

# Frontend tests
cd jr-hirepay-backend/hirepay-web
npm test
```

### Database Migrations
SQL migration files are located in:
- `jr-hirepay-backend/hirepay/migration.sql`
- `jr-hirepay-backend/hirepay/document_workflow_migration.sql`

## 📝 License

This project is proprietary software developed for internal use.

## 🤝 Contributing

Please follow the existing code style and add tests for new features.

## 📞 Support

For technical support, contact the development team.
