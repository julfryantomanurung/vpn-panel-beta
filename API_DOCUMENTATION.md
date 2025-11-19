# VPN Panel REST API Documentation

## Overview

This REST API provides complete management functionality for VPN users (SSH, VMess, VLESS) and menu system, following the patterns from the bash script in the `menu` file.

## Features

- ✅ VPN User Management (SSH, VMess, VLESS)
- ✅ Menu Management with hierarchy support
- ✅ System Information and Control
- ✅ Service Management
- ✅ JWT Authentication
- ✅ Role-Based Access Control
- ✅ Input Validation
- ✅ Comprehensive Error Handling
- ✅ Swagger/OpenAPI Documentation
- ✅ Winston Logging

## Quick Start

### Installation

```bash
npm install
```

### Running the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### Access API Documentation

Open your browser and navigate to:
```
http://localhost:3000/api-docs
```

## Authentication

All API endpoints (except `/health` and `/api/vpn`) require JWT authentication.

### Headers
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Health Check

#### GET /health
Check if the API is running.

**Response:**
```json
{
  "success": true,
  "message": "VPN Panel API is running",
  "timestamp": "2025-11-19T15:36:02.269Z"
}
```

---

## VPN User Management

### Create VPN User

#### POST /api/vpn/users

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "username": "user123",
  "protocol": "vmess",
  "expiry_days": 30,
  "password": "SecurePass123"
}
```

**Parameters:**
- `username` (string, required): Alphanumeric, 3-30 characters
- `protocol` (string, required): One of: `ssh`, `vmess`, `vless`
- `expiry_days` (number, required): 1-365 days
- `password` (string, required for SSH): Minimum 8 characters

**Response:**
```json
{
  "success": true,
  "message": "User 'user123' created successfully",
  "data": {
    "username": "user123",
    "protocol": "vmess",
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "expiry_date": "2025-12-19",
    "links": {
      "ws_80": "vmess://...",
      "wss_8443": "vmess://..."
    }
  }
}
```

### List All VPN Users

#### GET /api/vpn/users

**Authentication:** Required (Admin, User)

**Query Parameters:**
- `protocol` (optional): Filter by `ssh`, `vmess`, or `vless`
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "ssh_users": [
      {"username": "user1", "expiry": "2025-12-19"}
    ],
    "vmess_users": [
      {"user": "user2", "uuid": "...", "exp": "2025-12-19"}
    ],
    "vless_users": []
  },
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 2,
    "totalPages": 1
  }
}
```

### Get User Details

#### GET /api/vpn/users/:username

**Authentication:** Required (Admin, User)

**Response:**
```json
{
  "success": true,
  "data": {
    "username": "user123",
    "protocol": "vmess",
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "expiry_date": "2025-12-19",
    "links": {
      "ws_80": "vmess://...",
      "wss_8443": "vmess://..."
    }
  }
}
```

### Update User

#### PUT /api/vpn/users/:username

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "expiry_days": 60,
  "password": "NewPassword123"
}
```

### Delete User

#### DELETE /api/vpn/users/:username

**Authentication:** Required (Admin only)

**Response:**
```json
{
  "success": true,
  "message": "User 'user123' deleted successfully",
  "deleted_from": ["vmess"]
}
```

### Renew User

#### POST /api/vpn/users/:username/renew

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "additional_days": 30
}
```

### Get User Connection Links

#### GET /api/vpn/users/:username/links

**Authentication:** Required (Admin, User)

**Response:**
```json
{
  "success": true,
  "data": {
    "username": "user123",
    "protocol": "vmess",
    "links": {
      "ws_80": "vmess://...",
      "wss_8443": "vmess://..."
    }
  }
}
```

---

## Menu Management

### Create Menu Item

#### POST /api/menus

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "name": "Buat Pengguna",
  "action": "create_user",
  "icon": "user-plus",
  "order": 1,
  "parent_id": null,
  "roles": ["admin"],
  "visible": true,
  "description": "Create new VPN user"
}
```

### List All Menus

#### GET /api/menus

**Authentication:** Required

**Query Parameters:**
- `role` (optional): Filter by role

### Get Menu Hierarchy

#### GET /api/menus/hierarchy

**Authentication:** Required

Returns menus in hierarchical structure with parent-child relationships.

### Get Menu Detail

#### GET /api/menus/:id

**Authentication:** Required

### Update Menu

#### PUT /api/menus/:id

**Authentication:** Required (Admin only)

### Delete Menu

#### DELETE /api/menus/:id

**Authentication:** Required (Admin only)

### Reorder Menus

#### PATCH /api/menus/reorder

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "orders": [
    {"id": "menu-uuid-1", "order": 1},
    {"id": "menu-uuid-2", "order": 2}
  ]
}
```

---

## System Management

### Get System Information

#### GET /api/system/info

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "os": "Ubuntu 22.04.3 LTS",
    "uptime": "up 2 days, 5 hours, 32 minutes",
    "ramUsage": "2.1G/4.0G",
    "diskUsage": "15G/50G",
    "domain": "vpn.example.com"
  }
}
```

### Renew SSL Certificate

#### POST /api/system/ssl/renew

**Authentication:** Required (Admin only)

**Response:**
```json
{
  "success": true,
  "message": "SSL certificate renewed successfully"
}
```

### Reboot Server

#### POST /api/system/reboot

**Authentication:** Required (Admin only)

**Response:**
```json
{
  "success": true,
  "message": "Server reboot initiated"
}
```

---

## Service Management

### Reload Services

#### POST /api/system/services/reload

**Authentication:** Required (Admin only)

**Request Body (optional):**
```json
{
  "services": ["xray", "nginx", "stunnel4"]
}
```

### Get Service Status

#### GET /api/system/services/status

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "xray": {
      "running": true,
      "status": "active"
    },
    "nginx": {
      "running": true,
      "status": "active"
    },
    "stunnel4": {
      "running": true,
      "status": "active"
    },
    "ssh": {
      "running": true,
      "status": "active"
    }
  }
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message here",
  "details": [
    {
      "field": "username",
      "message": "Username must be at least 3 characters long"
    }
  ]
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Configuration

### Environment Variables

Create a `.env` file:

```env
PORT=3000
DOMAIN=vpn.example.com
TOKEN_SECRET=your-secret-key-here
NODE_ENV=development
```

### VPN Configuration

The API uses configuration from `config/vpn.config.js`:

- **VMESS_USER_FILE**: `/usr/local/etc/xray/users/vmess_users.json`
- **VLESS_USER_FILE**: `/usr/local/etc/xray/users/vless_users.json`
- **XRAY_CONFIG**: `/usr/local/etc/xray/config.json`

### Ports

- **VMESS_WS**: 80
- **VMESS_WSS**: 8443
- **VLESS_WS**: 80
- **VLESS_WSS**: 2043
- **SSH**: 22
- **SSH_SSL**: 443

---

## Security

### Role-Based Access Control

Three roles are supported:
- **admin**: Full access to all endpoints
- **user**: Limited to viewing user information
- **guest**: Read-only access to public information

### Input Validation

All inputs are validated using Joi schemas:
- Username: Alphanumeric, 3-30 characters
- Password: Minimum 8 characters
- Expiry days: 1-365 days
- Protocol: One of ssh, vmess, vless

---

## Logging

All operations are logged using Winston:
- Log files stored in `logs/app.log`
- Log levels: INFO, WARN, ERROR, DEBUG

---

## Link Generation

### VMess Link Format

```
vmess://base64(json_config)
```

### VLESS Link Format

```
vless://uuid@domain:port?params#description
```

---

## Development

### Project Structure

```
├── config/           # Configuration files
├── controllers/      # Request handlers
├── services/         # Business logic
├── routes/           # API routes
├── middleware/       # Custom middleware
├── validators/       # Input validation schemas
├── utils/            # Utility functions
├── data/             # Data storage (menus)
├── logs/             # Application logs
└── server.js         # Entry point
```

### Adding New Endpoints

1. Create service in `services/`
2. Create controller in `controllers/`
3. Create validator in `validators/`
4. Create route in `routes/`
5. Add Swagger documentation
6. Register route in `server.js`

---

## Support

For issues and questions:
- GitHub Issues: [vpn-panel-beta](https://github.com/julfryantomanurung/vpn-panel-beta)
- API Documentation: http://localhost:3000/api-docs

---

## License

MIT
