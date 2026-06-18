# Node.js Authentication Backend

A complete Node.js backend project using MVC architecture with Express and MongoDB for user authentication.

## Features

- ✅ User Registration with validation
- ✅ User Login with JWT authentication
- ✅ Password hashing with bcryptjs
- ✅ MongoDB database integration
- ✅ MVC architecture
- ✅ Environment variables configuration
- ✅ CORS enabled
- ✅ JSON responses for all routes

## Project Structure

```
backend/
├── server.js                    # Entry point - starts the server
├── app.js                       # Express app setup, middleware, routes
├── config/
│   └── db.js                    # MongoDB connection
├── models/
│   └── User.js                  # Mongoose User model
├── controllers/
│   └── authController.js        # Register and login logic
├── routes/
│   └── authRoutes.js            # Auth routes
├── .env                         # Environment variables
├── package.json                 # Dependencies
└── README.md                    # This file
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
PORT=5000
JWT_SECRET=your_jwt_secret_key
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Test Route
- **GET** `/`
  - Returns: `{ "message": "Backend is running..." }`

### Register User
- **POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }
  ```
- **Success Response (201):**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "user_id",
        "fullName": "John Doe",
        "email": "john@example.com"
      },
      "token": "jwt_token"
    }
  }
  ```
- **Error Responses:**
  - 400: All fields required / Passwords don't match / Email already exists
  - 500: Server error

### Login User
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "user_id",
        "fullName": "John Doe",
        "email": "john@example.com"
      },
      "token": "jwt_token"
    }
  }
  ```
- **Error Responses:**
  - 400: Email and password required
  - 401: Invalid email or password
  - 500: Server error

## Validation Rules

### Registration:
- All fields (fullName, email, password, confirmPassword) are required
- Password and confirmPassword must match
- Email must be unique
- Password must be at least 6 characters
- Password is automatically hashed before saving

### Login:
- Email and password are required
- User must exist in database
- Password is compared with hashed password

## Technologies Used

- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **dotenv** - Environment variables
- **cors** - Cross-origin resource sharing

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| MONGO_URI | MongoDB connection string | mongodb+srv://user:pass@cluster.mongodb.net/db |
| PORT | Server port | 5000 |
| JWT_SECRET | Secret key for JWT | your_secret_key_here |

## License

ISC
