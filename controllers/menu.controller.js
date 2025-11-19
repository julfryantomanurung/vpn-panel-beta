const menuService = require('../services/menu.service');
const logger = require('../utils/logger');

/**
 * Create menu item
 * POST /api/menus
 */
async function createMenu(req, res) {
  try {
    const menuData = req.body;
    const result = await menuService.createMenu(menuData);

    res.status(201).json({
      success: true,
      message: 'Menu created successfully',
      data: result,
    });
  } catch (error) {
    logger.error(`Create menu error: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * List all menus
 * GET /api/menus
 */
async function listMenus(req, res) {
  try {
    const { role } = req.query;
    const menus = await menuService.getAllMenus(role);

    res.json({
      success: true,
      data: menus,
    });
  } catch (error) {
    logger.error(`List menus error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get menu detail
 * GET /api/menus/:id
 */
async function getMenuDetail(req, res) {
  try {
    const { id } = req.params;
    const menu = await menuService.getMenuById(id);

    if (!menu) {
      return res.status(404).json({
        success: false,
        error: `Menu with ID '${id}' not found`,
      });
    }

    res.json({
      success: true,
      data: menu,
    });
  } catch (error) {
    logger.error(`Get menu error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Update menu
 * PUT /api/menus/:id
 */
async function updateMenu(req, res) {
  try {
    const { id } = req.params;
    const menuData = req.body;

    const result = await menuService.updateMenu(id, menuData);

    res.json({
      success: true,
      message: 'Menu updated successfully',
      data: result,
    });
  } catch (error) {
    logger.error(`Update menu error: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Delete menu
 * DELETE /api/menus/:id
 */
async function deleteMenu(req, res) {
  try {
    const { id } = req.params;
    const result = await menuService.deleteMenu(id);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    logger.error(`Delete menu error: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Reorder menus
 * PATCH /api/menus/reorder
 */
async function reorderMenus(req, res) {
  try {
    const { orders } = req.body;
    const result = await menuService.reorderMenus(orders);

    res.json({
      success: true,
      message: result.message,
      data: result.menus,
    });
  } catch (error) {
    logger.error(`Reorder menus error: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get menu hierarchy
 * GET /api/menus/hierarchy
 */
async function getMenuHierarchy(req, res) {
  try {
    const hierarchy = await menuService.getMenuHierarchy();

    res.json({
      success: true,
      data: hierarchy,
    });
  } catch (error) {
    logger.error(`Get menu hierarchy error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

module.exports = {
  createMenu,
  listMenus,
  getMenuDetail,
  updateMenu,
  deleteMenu,
  reorderMenus,
  getMenuHierarchy,
};
