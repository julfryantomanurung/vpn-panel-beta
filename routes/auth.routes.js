const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { validateLogin } = require('../validators/auth.validator');
const { asyncHandler } = require('../middleware/errorHandler');
const userStore = require('../utils/userStore');
const logger = require('../config/logger');
const config = require('../config/config');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user and generate JWT token
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Invalid username or password
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post('/login', validateLogin, asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Log login attempt
  logger.info('Login attempt', { username, ip: req.ip });

  // Validate credentials
  const user = await userStore.validateCredentials(username, password);

  if (!user) {
    logger.warn('Login failed - Invalid credentials', { username, ip: req.ip });
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  // Generate JWT token
  const token = jwt.sign(
    { 
      username: user.username, 
      email: user.email,
      role: user.role 
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  logger.info('Login successful', { username, ip: req.ip });

  res.json({
    token,
    user: {
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
}));

module.exports = router;
