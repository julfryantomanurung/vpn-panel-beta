# Alxzy-VPN-Beta

🧪 **Beta Version Warning**  
This script is currently in **beta stage**. Please use with caution.  
We are **not responsible** for any damage that may occur to your system or VPS.

---

## ✅ Supported Operating Systems

- ✅ Tested: **Ubuntu 22.04**
- ⚠️ Untested: **Debian/Ubuntu 24+**

---

## 🚀 Features

### VPN Management
- Automated VPN setup
- Lightweight and easy to use
- Minimal user interaction
- Fast installation

### REST API
- **Complete CRUD Operations** - User management with full create, read, update, delete
- **JWT Authentication** - Secure token-based authentication
- **Rate Limiting** - Protection against abuse (5/15min for login, 100/15min for API)
- **Input Validation** - Comprehensive validation using Joi
- **Security Headers** - Helmet middleware for enhanced security
- **Structured Logging** - Winston logger with daily rotation
- **API Documentation** - Interactive Swagger UI
- **Error Handling** - Centralized error handling with proper status codes
- **CORS Support** - Configurable cross-origin resource sharing

---

## 📥 VPN Installation

One-liner install (recommended):

```bash
bash <(curl -sSL https://raw.githubusercontent.com/alands-offc/Alxzy-VPN/main/install.sh)
```

---

## 🔧 API Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/julfryantomanurung/vpn-panel-beta.git
cd vpn-panel-beta
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env and update JWT_SECRET and other settings
```

4. **Start the server**
```bash
# Development
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:3000`

---

## 📚 API Documentation

Once the server is running, access the interactive API documentation at:

**http://localhost:3000/api-docs**

### Quick Start

#### 1. Login (Get JWT Token)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Default credentials:
- **Username:** `admin`
- **Password:** `admin123`

#### 2. Create a User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "username": "johndoe",
    "password": "securepass123",
    "email": "john@example.com",
    "role": "user"
  }'
```

#### 3. List All Users
```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 4. Get User Details
```bash
curl -X GET http://localhost:3000/api/users/johndoe \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 5. Delete User
```bash
curl -X DELETE http://localhost:3000/api/users/johndoe \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Rate Limiting** - Prevent brute force attacks
  - Login: 5 requests per 15 minutes
  - API: 100 requests per 15 minutes
  - General: 1000 requests per 15 minutes
- **Helmet Security Headers** - XSS, CSRF, CSP protection
- **Input Validation** - Joi schemas for all inputs
- **Password Hashing** - bcrypt with salt rounds
- **CORS Configuration** - Controlled cross-origin access
- **NoSQL Injection Protection** - Sanitization middleware

---

## 📝 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | User login | ❌ |

### Users
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/users` | Create new user | ✅ |
| GET | `/api/users` | List all users (paginated) | ✅ |
| GET | `/api/users/:username` | Get user details | ✅ |
| DELETE | `/api/users/:username` | Delete user | ✅ |

### Health & Documentation
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check | ❌ |
| GET | `/api-docs` | API documentation | ❌ |

---

## 🔧 Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Database Configuration (future)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vpn_panel
DB_USER=vpn_user
DB_PASSWORD=your-database-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_LOGIN_MAX=5

# Logging
LOG_LEVEL=info

# CORS
CORS_ORIGIN=http://localhost:3000
```

---

## 📊 Project Structure

```
vpn-panel-beta/
├── config/
│   ├── config.js          # Centralized configuration
│   ├── logger.js          # Winston logger setup
│   └── swagger.js         # Swagger/OpenAPI config
├── middleware/
│   ├── auth.js            # JWT authentication
│   ├── errorHandler.js    # Error handling
│   └── rateLimiter.js     # Rate limiting
├── routes/
│   ├── auth.routes.js     # Authentication routes
│   └── user.routes.js     # User CRUD routes
├── validators/
│   ├── auth.validator.js  # Auth validation
│   └── user.validator.js  # User validation
├── utils/
│   ├── logger.js          # Basic logger
│   └── userStore.js       # In-memory user store
├── logs/                  # Log files (auto-generated)
├── .env                   # Environment variables (not in git)
├── .env.example           # Environment template
├── .gitignore             # Git ignore rules
├── package.json           # Dependencies
└── server.js              # Main application file
```

---

## 🧪 Testing

The API has been thoroughly tested:
- ✅ All CRUD operations
- ✅ Authentication flow
- ✅ Rate limiting
- ✅ Input validation
- ✅ Error handling
- ✅ Security headers
- ✅ Logging functionality

---

## 📦 Dependencies

### Production
- `express` - Web framework
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `joi` - Input validation
- `helmet` - Security headers
- `cors` - CORS support
- `express-rate-limit` - Rate limiting
- `winston` - Structured logging
- `winston-daily-rotate-file` - Log rotation
- `morgan` - HTTP request logging
- `swagger-ui-express` - API documentation
- `swagger-jsdoc` - Swagger generation
- `express-mongo-sanitize` - NoSQL injection protection
- `dotenv` - Environment variables

### Development
- `nodemon` - Auto-restart on changes

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

---

## 📄 License

MIT License - see LICENSE file for details

---

## ⚠️ Disclaimer

This software is provided "as is", without warranty of any kind. Use at your own risk.
