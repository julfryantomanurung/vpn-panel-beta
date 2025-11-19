const express = require('express');
const router = express.Router();
const vpnUserController = require('../controllers/vpn-user.controller');
const { validate } = require('../middleware/validator.middleware');
const { requireRole } = require('../middleware/role.middleware');
const authenticateJWT = require('../middleware/auth');
const {
  createVPNUserSchema,
  updateVPNUserSchema,
  renewUserSchema,
  listUsersQuerySchema,
  usernameParamSchema,
} = require('../validators/vpn-user.validator');

/**
 * @swagger
 * /api/vpn/users:
 *   post:
 *     summary: Create a new VPN user
 *     tags: [VPN Users]
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
 *               - protocol
 *               - expiry_days
 *             properties:
 *               username:
 *                 type: string
 *               protocol:
 *                 type: string
 *                 enum: [ssh, vmess, vless]
 *               expiry_days:
 *                 type: number
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input
 */
router.post(
  '/',
  authenticateJWT,
  requireRole(['admin']),
  validate(createVPNUserSchema, 'body'),
  vpnUserController.createVPNUser
);

/**
 * @swagger
 * /api/vpn/users:
 *   get:
 *     summary: List all VPN users
 *     tags: [VPN Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: protocol
 *         schema:
 *           type: string
 *           enum: [ssh, vmess, vless]
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of users
 */
router.get(
  '/',
  authenticateJWT,
  requireRole(['admin', 'user']),
  validate(listUsersQuerySchema, 'query'),
  vpnUserController.listVPNUsers
);

/**
 * @swagger
 * /api/vpn/users/{username}:
 *   get:
 *     summary: Get user details
 *     tags: [VPN Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
router.get(
  '/:username',
  authenticateJWT,
  requireRole(['admin', 'user']),
  validate(usernameParamSchema, 'params'),
  vpnUserController.getUserDetails
);

/**
 * @swagger
 * /api/vpn/users/{username}:
 *   put:
 *     summary: Update user
 *     tags: [VPN Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expiry_days:
 *                 type: number
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put(
  '/:username',
  authenticateJWT,
  requireRole(['admin']),
  validate(usernameParamSchema, 'params'),
  validate(updateVPNUserSchema, 'body'),
  vpnUserController.updateUser
);

/**
 * @swagger
 * /api/vpn/users/{username}:
 *   delete:
 *     summary: Delete user
 *     tags: [VPN Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete(
  '/:username',
  authenticateJWT,
  requireRole(['admin']),
  validate(usernameParamSchema, 'params'),
  vpnUserController.deleteUser
);

/**
 * @swagger
 * /api/vpn/users/{username}/renew:
 *   post:
 *     summary: Renew user expiry
 *     tags: [VPN Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - additional_days
 *             properties:
 *               additional_days:
 *                 type: number
 *     responses:
 *       200:
 *         description: User renewed successfully
 */
router.post(
  '/:username/renew',
  authenticateJWT,
  requireRole(['admin']),
  validate(usernameParamSchema, 'params'),
  validate(renewUserSchema, 'body'),
  vpnUserController.renewUser
);

/**
 * @swagger
 * /api/vpn/users/{username}/links:
 *   get:
 *     summary: Get user connection links
 *     tags: [VPN Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Connection links
 */
router.get(
  '/:username/links',
  authenticateJWT,
  requireRole(['admin', 'user']),
  validate(usernameParamSchema, 'params'),
  vpnUserController.getUserLinks
);

module.exports = router;
