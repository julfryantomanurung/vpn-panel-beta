const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');
const { validate } = require('../middleware/validator.middleware');
const { requireRole } = require('../middleware/role.middleware');
const authenticateJWT = require('../middleware/auth');
const {
  createMenuSchema,
  updateMenuSchema,
  reorderMenusSchema,
  menuIdParamSchema,
} = require('../validators/menu.validator');

/**
 * @swagger
 * /api/menus:
 *   post:
 *     summary: Create a new menu item
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Menu created successfully
 */
router.post(
  '/',
  authenticateJWT,
  requireRole(['admin']),
  validate(createMenuSchema, 'body'),
  menuController.createMenu
);

/**
 * @swagger
 * /api/menus:
 *   get:
 *     summary: List all menus
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of menus
 */
router.get(
  '/',
  authenticateJWT,
  menuController.listMenus
);

/**
 * @swagger
 * /api/menus/hierarchy:
 *   get:
 *     summary: Get menu hierarchy
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Menu hierarchy
 */
router.get(
  '/hierarchy',
  authenticateJWT,
  menuController.getMenuHierarchy
);

/**
 * @swagger
 * /api/menus/{id}:
 *   get:
 *     summary: Get menu detail
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Menu details
 */
router.get(
  '/:id',
  authenticateJWT,
  validate(menuIdParamSchema, 'params'),
  menuController.getMenuDetail
);

/**
 * @swagger
 * /api/menus/{id}:
 *   put:
 *     summary: Update menu
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Menu updated successfully
 */
router.put(
  '/:id',
  authenticateJWT,
  requireRole(['admin']),
  validate(menuIdParamSchema, 'params'),
  validate(updateMenuSchema, 'body'),
  menuController.updateMenu
);

/**
 * @swagger
 * /api/menus/{id}:
 *   delete:
 *     summary: Delete menu
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Menu deleted successfully
 */
router.delete(
  '/:id',
  authenticateJWT,
  requireRole(['admin']),
  validate(menuIdParamSchema, 'params'),
  menuController.deleteMenu
);

/**
 * @swagger
 * /api/menus/reorder:
 *   patch:
 *     summary: Reorder menus
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Menus reordered successfully
 */
router.patch(
  '/reorder',
  authenticateJWT,
  requireRole(['admin']),
  validate(reorderMenusSchema, 'body'),
  menuController.reorderMenus
);

module.exports = router;
