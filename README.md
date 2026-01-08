# Asset Management System

A full-stack web application for managing organizational assets built with React (TypeScript) frontend and FastAPI (Python) backend.

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Installation & Setup

1. **Clone and navigate to the project**

   ```bash
   cd asset-management-system
   ```

2. **Backend Setup**

   ```bash
   cd backend
   pip install -r requirements.txt
   python init_db.py  # Initialize the database
   ```

3. **Frontend Setup**

   ```bash
   cd frontend
   npm install
   ```

4. **Start Development Servers**

   ```bash
   # From the root directory
   node start-dev.js
   ```

   Or start them separately:

   ```bash
   # Terminal 1 - Backend
   cd backend
   python -m uvicorn app.main:app --reload --port 8000

   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

## 📱 Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Alternative API Docs**: http://localhost:8000/redoc

## 🧪 Testing

### Backend Tests

```bash
cd backend
python -m pytest tests/ -v
```

### Frontend Tests

```bash
cd frontend
npm test
```

### End-to-End Tests

```bash
# Make sure both servers are running first
node run-integration-tests.js
```

## 🏗️ Architecture

### Backend (FastAPI + SQLite)

- **Framework**: FastAPI with SQLAlchemy ORM
- **Database**: SQLite (development), easily configurable for PostgreSQL
- **API**: RESTful API with automatic OpenAPI documentation
- **Testing**: Pytest with comprehensive test coverage

### Frontend (React + TypeScript)

- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **Styling**: CSS Modules with responsive design
- **State Management**: React hooks and context
- **Testing**: Jest + React Testing Library

## 📋 Features

### Asset Management

- ✅ Create new assets with validation
- ✅ View asset list with pagination
- ✅ View detailed asset information
- ✅ Update existing assets
- ✅ Delete assets with confirmation
- ✅ Search assets by name, description, or serial number
- ✅ Filter assets by category and status

### Data Validation

- ✅ Required field validation
- ✅ Serial number uniqueness
- ✅ Date format validation
- ✅ Price validation (positive numbers)
- ✅ Real-time form validation

### User Interface

- ✅ Responsive design (desktop and mobile)
- ✅ Loading indicators
- ✅ Error handling and user feedback
- ✅ Toast notifications
- ✅ Confirmation dialogs

## 🗄️ Database Schema

### Assets Table

- `id` - Primary key
- `name` - Asset name (required)
- `description` - Asset description (optional)
- `category` - Asset category (required)
- `serial_number` - Unique serial number (required)
- `purchase_date` - Purchase date (required)
- `purchase_price` - Purchase price (required)
- `status` - Asset status: active, inactive, maintenance, disposed
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database Configuration
DATABASE_URL=sqlite:///./asset_management.db

# Application Configuration
DEBUG=True
SECRET_KEY=your-secret-key-here

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000
```

## 📊 API Endpoints

### Assets

- `GET /api/assets` - List assets with pagination and filters
- `POST /api/assets` - Create new asset
- `GET /api/assets/{id}` - Get asset by ID
- `PUT /api/assets/{id}` - Update asset
- `DELETE /api/assets/{id}` - Delete asset

### Utilities

- `GET /api/assets/categories` - Get available categories
- `GET /api/assets/statuses` - Get available statuses
- `GET /health` - Health check endpoint

## 🧪 Test Coverage

### Backend Tests (150+ tests)

- API endpoint testing
- Database operations
- Business logic validation
- Error handling
- Integration tests

### Frontend Tests (232+ tests)

- Component unit tests
- Hook testing
- Service layer tests
- Integration tests
- User interaction tests

### E2E Tests (31+ scenarios)

- Complete user workflows
- Cross-browser testing
- Mobile responsiveness
- Error scenarios

## 🚀 Deployment

### Backend Deployment

```bash
# Production setup
pip install -r requirements.txt
python init_db.py
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend Deployment

```bash
# Build for production
npm run build
# Serve the build folder with your preferred web server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Database not found**: Run `python backend/init_db.py` to initialize
2. **Port conflicts**: Change ports in the configuration files
3. **CORS errors**: Ensure backend CORS settings include frontend URL
4. **Test failures**: Make sure both servers are stopped before running tests

### Getting Help

- Check the API documentation at http://localhost:8000/docs
- Review test files for usage examples
- Check the browser console for frontend errors
- Review backend logs for API errors
