# MedBee Backend

Backend server for the MedBee healthcare management application. This server provides APIs for managing medical records, medications, health metrics, and user data.

## Features

- 🔐 User Authentication & Authorization
- 📊 Health Metrics Tracking
- 💊 Medication Management
- 📋 Medical Records Management
- 💉 Vaccination Records
- 📈 Analytics & Reporting
- 🔔 Reminders & Notifications

## Tech Stack

- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- Winston Logger
- Express Validator
- CORS enabled
- Rate Limiting
- Security Headers

## Project Structure

```
src/
├── config/          # Configuration files and environment setup
├── controllers/     # Route controllers (business logic)
├── middleware/      # Custom middleware (auth, validation, etc.)
├── models/         # Database models and schemas
├── routes/         # API route definitions
├── scripts/        # Utility scripts (database seeding, etc.)
├── utils/          # Helper functions and utilities
└── app.js          # Main application entry point
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn
- Git

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/medbee
   JWT_SECRET=your_jwt_secret_here
   API_PREFIX=/api/v1
   LOG_LEVEL=debug
   ```

5. Create a test admin user (optional):
   ```bash
   npm run create-admin
   ```

6. Start development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm start`: Start production server
- `npm run dev`: Start development server with hot reload
- `npm test`: Run tests
- `npm run create-admin`: Create admin user
- `npm run seed`: Seed database with sample data
- `npm run lint`: Run ESLint
- `npm run lint:fix`: Fix ESLint errors

## API Documentation

### Authentication Endpoints

#### POST /api/v1/auth/login
- Login user
- Body: `{ email: string, password: string }`
- Returns: User data with JWT token

#### POST /api/v1/auth/register
- Register new user
- Body: `{ email: string, password: string, firstName: string, lastName: string }`
- Returns: User data with JWT token

### Health Metrics Endpoints

#### GET /api/v1/health/metrics
- Get all health metrics
- Protected route
- Query params: `type`, `startDate`, `endDate`

#### POST /api/v1/health/metrics
- Add new health metric
- Protected route
- Body: `{ type: string, value: { value: number, unit: string }, notes: string }`

### Medications Endpoints

#### GET /api/v1/health/medications
- Get all medications
- Protected route

#### GET /api/v1/health/medications/active
- Get active medications
- Protected route

#### POST /api/v1/health/medications
- Add new medication
- Protected route
- Body:
  ```json
  {
    "name": "string",
    "dosage": "string",
    "frequency": "string",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD" (optional),
    "notes": "string" (optional)
  }
  ```

### Medical Records Endpoints

#### GET /api/v1/health/records
- Get all medical records
- Protected route

#### POST /api/v1/health/records
- Add new medical record
- Protected route
- Body: `{ title: string, fileUrl: string, fileType: string, recordDate: date }`

### Vaccination Records Endpoints

#### GET /api/v1/health/vaccinations
- Get all vaccination records
- Protected route

#### POST /api/v1/health/vaccinations
- Add new vaccination record
- Protected route
- Body: `{ name: string, dateReceived: date, nextDoseDate: date }`

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

Error responses follow this format:
```json
{
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on auth routes
- CORS configuration
- Helmet security headers
- Request validation
- MongoDB injection protection

## Development Guidelines

1. **Code Style**
   - Follow ESLint configuration
   - Use async/await for asynchronous operations
   - Add JSDoc comments for functions
   - Use meaningful variable names

2. **Git Workflow**
   - Create feature branches from `develop`
   - Use conventional commit messages
   - Submit PRs for review
   - Keep commits atomic and focused

3. **Testing**
   - Write unit tests for new features
   - Ensure all tests pass before committing
   - Test API endpoints with Postman/Insomnia

4. **Documentation**
   - Update README for new features
   - Document API changes
   - Include example requests/responses

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Set production environment variables

3. Start the server:
   ```bash
   npm start
   ```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@medbee.com or join our Slack channel. 