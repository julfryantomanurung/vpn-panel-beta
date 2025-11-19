const express = require('express');
const router = express.Router();
const systemController = require('../controllers/system.controller');
const { requireAdmin } = require('../middleware/role.middleware');
const authenticateJWT = require('../middleware/auth');

/**
 * @swagger
 * /api/system/info:
 *   get:
 *     summary: Get system information
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System information
 */
router.get(
  '/info',
  authenticateJWT,
  systemController.getSystemInfo
);

/**
 * @swagger
 * /api/system/ssl/renew:
 *   post:
 *     summary: Renew SSL certificate
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: SSL certificate renewed successfully
 */
router.post(
  '/ssl/renew',
  authenticateJWT,
  requireAdmin,
  systemController.renewSSL
);

/**
 * @swagger
 * /api/system/reboot:
 *   post:
 *     summary: Reboot server
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Server reboot initiated
 */
router.post(
  '/reboot',
  authenticateJWT,
  requireAdmin,
  systemController.rebootServer
);

/**
 * @swagger
 * /api/services/reload:
 *   post:
 *     summary: Reload services
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               services:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Services reloaded
 */
router.post(
  '/services/reload',
  authenticateJWT,
  requireAdmin,
  systemController.reloadServices
);

/**
 * @swagger
 * /api/services/status:
 *   get:
 *     summary: Get service status
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Service statuses
 */
router.get(
  '/services/status',
  authenticateJWT,
  systemController.getServiceStatus
);

module.exports = router;
