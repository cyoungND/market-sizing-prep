# Market Sizing Prep - Backend API

A scalable Node.js/Express backend for the Market Sizing Interview Prep app with PostgreSQL database and JWT authentication.

## 🚀 Features

- **User Authentication**: JWT-based registration and login
- **Session Management**: Track practice sessions and performance
- **Question Management**: API endpoints for questions and components
- **Performance Analytics**: Detailed tracking of user progress
- **Rate Limiting**: Protection against abuse
- **Security**: Helmet, CORS, and input validation

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with bcrypt
- **Validation**: Zod schemas
- **Security**: Helmet, CORS, rate limiting

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Update `.env` with your configuration:
```env
# Database - Replace with your PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/market_sizing_prep?schema=public"

# JWT - Generate a secure secret key
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="development"

# CORS - Update with your frontend URL
CORS_ORIGIN="http://localhost:8081"
```

### 3. Database Setup

Generate Prisma client:
```bash
npm run db:generate
```

Push the schema to your database:
```bash
npm run db:push
```

Seed the database with questions:
```bash
npm run db:seed
```

### 4. Start the Server

Development mode (with hot reload):
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Questions
- `GET /api/questions` - Get all questions (authenticated)
- `GET /api/questions/:id` - Get specific question
- `GET /api/questions/random/:count` - Get random questions for practice

### Sessions
- `POST /api/sessions` - Create new practice session
- `GET /api/sessions` - Get user's session history
- `POST /api/sessions/:id/responses` - Submit question response
- `PATCH /api/sessions/:id/end` - End practice session

### Health Check
- `GET /health` - Server health status

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📊 Database Schema

### Users
- User accounts with email/password authentication
- Tracks registration and profile information

### Questions & Components
- Questions with multiple choice components
- Each component has correct/incorrect flag and explanations

### Sessions & Responses
- Practice sessions track user performance
- Individual responses record attempts and timing
- Comprehensive analytics and progress tracking

## 🧪 Development

### Database Management

View database in Prisma Studio:
```bash
npm run db:studio
```

Create and apply migrations:
```bash
npm run db:migrate
```

Reset and reseed database:
```bash
npm run db:push
npm run db:seed
```

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and apply migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with questions

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Helmet**: Security headers protection
- **CORS**: Configurable cross-origin resource sharing
- **Input Validation**: Zod schema validation
- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure authentication with expiration

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV="production"
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-jwt-secret"
PORT=3001
CORS_ORIGIN="https://your-frontend-domain.com"
```

### Deployment Platforms

This backend is ready to deploy on:
- **Vercel**: Zero-config deployment
- **Railway**: PostgreSQL included
- **Heroku**: Add PostgreSQL addon
- **AWS/GCP/Azure**: Container or serverless deployment

## 🤝 Integration with Frontend

The React Native app should:

1. **Authentication**: Store JWT token in AsyncStorage
2. **API Calls**: Use the token in Authorization headers
3. **Error Handling**: Handle 401/403 responses for token refresh
4. **Offline Support**: Cache questions and sync sessions when online

## 📈 Performance Considerations

- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Prisma handles connection management
- **Caching**: Consider Redis for session caching in production
- **Rate Limiting**: Prevents abuse and ensures fair usage

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection**: Verify PostgreSQL is running and connection string is correct
2. **JWT Errors**: Ensure JWT_SECRET is set and tokens aren't expired
3. **CORS Issues**: Update CORS_ORIGIN to match your frontend URL
4. **Seed Failures**: Check that questions.json exists in the assets folder

### Logs

The server logs all errors and important events. In development, you'll see detailed error messages and stack traces.

## 📝 Next Steps

1. **Deploy the backend** to your preferred platform
2. **Update your React Native app** to use the API endpoints
3. **Add user registration/login screens** to your mobile app
4. **Implement offline synchronization** for better UX
5. **Add analytics dashboard** for admin users
