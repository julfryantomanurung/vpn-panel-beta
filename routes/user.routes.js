const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/auth');
const { 
  validateCreateUser, 
  validateListUsersQuery, 
  validateUsernameParam 
} = require('../validators/user.validator');
const { asyncHandler, NotFoundError } = require('../middleware/errorHandler');
const userStore = require('../utils/userStore');
const logger = require('../config/logger');

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user account (requires authentication)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123!
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 default: user
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Username already exists
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post('/', authenticateJWT, validateCreateUser, asyncHandler(async (req, res) => {
  const { username, password, email, role } = req.body;

  logger.info('Creating new user', { 
    username, 
    email,
    createdBy: req.user.username 
  });

  try {
    const user = await userStore.createUser({ username, password, email, role });
    
    logger.info('User created successfully', { 
      username,
      createdBy: req.user.username 
    });

    res.status(201).json({
      message: 'User created successfully',
      user
    });
  } catch (error) {
    logger.warn('User creation failed', { 
      username,
      error: error.message,
      createdBy: req.user.username 
    });

    res.status(409).json({ message: error.message });
  }
}));

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users
 *     description: Get a paginated list of all users (requires authentication)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of users per page
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedUsers'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.get('/', authenticateJWT, validateListUsersQuery, asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  logger.info('Fetching users list', { 
    page, 
    limit,
    requestedBy: req.user.username 
  });

  const result = await userStore.getAllUsers(page, limit);

  logger.info('Users list retrieved', { 
    count: result.users.length,
    page,
    requestedBy: req.user.username 
  });

  res.json(result);
}));

/**
 * @swagger
 * /api/users/{username}:
 *   get:
 *     summary: Get user details
 *     description: Get details of a specific user by username (requires authentication)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username of the user to retrieve
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.get('/:username', authenticateJWT, validateUsernameParam, asyncHandler(async (req, res) => {
  const { username } = req.params;

  logger.info('Fetching user details', { 
    username,
    requestedBy: req.user.username 
  });

  const user = await userStore.getUserByUsername(username);

  if (!user) {
    logger.warn('User not found', { 
      username,
      requestedBy: req.user.username 
    });
    throw new NotFoundError('User not found');
  }

  logger.info('User details retrieved', { 
    username,
    requestedBy: req.user.username 
  });

  res.json(user);
}));

/**
 * @swagger
 * /api/users/{username}:
 *   delete:
 *     summary: Delete a user
 *     description: Delete a user by username (requires authentication)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User deleted successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.delete('/:username', authenticateJWT, validateUsernameParam, asyncHandler(async (req, res) => {
  const { username } = req.params;

  logger.info('Deleting user', { 
    username,
    deletedBy: req.user.username 
  });

  const deleted = await userStore.deleteUser(username);

  if (!deleted) {
    logger.warn('User not found for deletion', { 
      username,
      deletedBy: req.user.username 
    });
    throw new NotFoundError('User not found');
  }

  logger.info('User deleted successfully', { 
    username,
    deletedBy: req.user.username 
  });

  res.json({ message: 'User deleted successfully' });
}));

module.exports = router;
