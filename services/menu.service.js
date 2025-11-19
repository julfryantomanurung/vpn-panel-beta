const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// In-memory store for menus (in production, this should be a database)
const MENU_FILE = path.join(__dirname, '../data/menus.json');

/**
 * MenuService - Handles menu management operations
 */
class MenuService {
  constructor() {
    this._ensureDataDir();
  }

  /**
   * Ensure data directory exists
   * @private
   */
  async _ensureDataDir() {
    const dataDir = path.dirname(MENU_FILE);
    try {
      await fs.mkdir(dataDir, { recursive: true });
      // Initialize with default menus if file doesn't exist
      try {
        await fs.access(MENU_FILE);
      } catch (error) {
        await this._initializeDefaultMenus();
      }
    } catch (error) {
      logger.error(`Failed to ensure data directory: ${error.message}`);
    }
  }

  /**
   * Initialize default menus
   * @private
   */
  async _initializeDefaultMenus() {
    const defaultMenus = [
      {
        id: uuidv4(),
        name: 'Buat Pengguna',
        action: 'create_user',
        icon: 'user-plus',
        order: 1,
        parent_id: null,
        roles: ['admin'],
        visible: true,
        description: 'Create new VPN user',
      },
      {
        id: uuidv4(),
        name: 'Hapus Pengguna',
        action: 'delete_user',
        icon: 'user-minus',
        order: 2,
        parent_id: null,
        roles: ['admin'],
        visible: true,
        description: 'Delete VPN user',
      },
      {
        id: uuidv4(),
        name: 'Daftar Pengguna',
        action: 'list_users',
        icon: 'users',
        order: 3,
        parent_id: null,
        roles: ['admin', 'user'],
        visible: true,
        description: 'List all VPN users',
      },
      {
        id: uuidv4(),
        name: 'Perbarui Sertifikat SSL',
        action: 'renew_ssl',
        icon: 'certificate',
        order: 4,
        parent_id: null,
        roles: ['admin'],
        visible: true,
        description: 'Renew SSL certificate',
      },
      {
        id: uuidv4(),
        name: 'Reboot Server',
        action: 'reboot_server',
        icon: 'power',
        order: 5,
        parent_id: null,
        roles: ['admin'],
        visible: true,
        description: 'Reboot the server',
      },
    ];
    await fs.writeFile(MENU_FILE, JSON.stringify(defaultMenus, null, 2), 'utf8');
    logger.info('Default menus initialized');
  }

  /**
   * Read menus from file
   * @private
   */
  async _readMenus() {
    try {
      const data = await fs.readFile(MENU_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      logger.error(`Failed to read menus: ${error.message}`);
      return [];
    }
  }

  /**
   * Write menus to file
   * @private
   */
  async _writeMenus(menus) {
    try {
      await fs.writeFile(MENU_FILE, JSON.stringify(menus, null, 2), 'utf8');
    } catch (error) {
      logger.error(`Failed to write menus: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a new menu
   * @param {object} menuData - Menu data
   * @returns {Promise<object>}
   */
  async createMenu(menuData) {
    try {
      const menus = await this._readMenus();
      
      const newMenu = {
        id: uuidv4(),
        name: menuData.name,
        action: menuData.action,
        icon: menuData.icon || 'circle',
        order: menuData.order || menus.length + 1,
        parent_id: menuData.parent_id || null,
        roles: menuData.roles || ['admin'],
        visible: menuData.visible !== undefined ? menuData.visible : true,
        description: menuData.description || '',
      };

      menus.push(newMenu);
      await this._writeMenus(menus);

      logger.info(`Menu created: ${newMenu.name}`);
      return newMenu;
    } catch (error) {
      logger.error(`Failed to create menu: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all menus
   * @param {string} role - Filter by role (optional)
   * @returns {Promise<array>}
   */
  async getAllMenus(role = null) {
    try {
      let menus = await this._readMenus();

      // Filter by role if specified
      if (role) {
        menus = menus.filter(menu => menu.roles.includes(role));
      }

      // Sort by order
      menus.sort((a, b) => a.order - b.order);

      return menus;
    } catch (error) {
      logger.error(`Failed to get all menus: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get menu by ID
   * @param {string} id - Menu ID
   * @returns {Promise<object|null>}
   */
  async getMenuById(id) {
    try {
      const menus = await this._readMenus();
      const menu = menus.find(m => m.id === id);
      return menu || null;
    } catch (error) {
      logger.error(`Failed to get menu by ID: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update menu
   * @param {string} id - Menu ID
   * @param {object} menuData - Updated menu data
   * @returns {Promise<object>}
   */
  async updateMenu(id, menuData) {
    try {
      const menus = await this._readMenus();
      const menuIndex = menus.findIndex(m => m.id === id);

      if (menuIndex === -1) {
        throw new Error(`Menu with ID '${id}' not found`);
      }

      // Update menu with new data
      menus[menuIndex] = {
        ...menus[menuIndex],
        ...menuData,
        id, // Ensure ID doesn't change
      };

      await this._writeMenus(menus);

      logger.info(`Menu updated: ${menus[menuIndex].name}`);
      return menus[menuIndex];
    } catch (error) {
      logger.error(`Failed to update menu: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete menu
   * @param {string} id - Menu ID
   * @returns {Promise<object>}
   */
  async deleteMenu(id) {
    try {
      let menus = await this._readMenus();
      const menuIndex = menus.findIndex(m => m.id === id);

      if (menuIndex === -1) {
        throw new Error(`Menu with ID '${id}' not found`);
      }

      const deletedMenu = menus[menuIndex];

      // Also delete child menus
      menus = menus.filter(m => m.id !== id && m.parent_id !== id);

      await this._writeMenus(menus);

      logger.info(`Menu deleted: ${deletedMenu.name}`);
      return {
        success: true,
        message: 'Menu deleted successfully',
        deletedMenu,
      };
    } catch (error) {
      logger.error(`Failed to delete menu: ${error.message}`);
      throw error;
    }
  }

  /**
   * Reorder menus
   * @param {array} orderData - Array of {id, order} objects
   * @returns {Promise<object>}
   */
  async reorderMenus(orderData) {
    try {
      const menus = await this._readMenus();

      // Update order for each menu
      for (const { id, order } of orderData) {
        const menu = menus.find(m => m.id === id);
        if (menu) {
          menu.order = order;
        }
      }

      // Sort by order
      menus.sort((a, b) => a.order - b.order);

      await this._writeMenus(menus);

      logger.info('Menus reordered');
      return {
        success: true,
        message: 'Menus reordered successfully',
        menus,
      };
    } catch (error) {
      logger.error(`Failed to reorder menus: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get menu hierarchy
   * @returns {Promise<array>}
   */
  async getMenuHierarchy() {
    try {
      const menus = await this._readMenus();

      // Build hierarchy
      const hierarchy = [];
      const menuMap = new Map();

      // First pass: create map of all menus
      menus.forEach(menu => {
        menuMap.set(menu.id, { ...menu, children: [] });
      });

      // Second pass: build hierarchy
      menus.forEach(menu => {
        const menuNode = menuMap.get(menu.id);
        if (menu.parent_id) {
          const parent = menuMap.get(menu.parent_id);
          if (parent) {
            parent.children.push(menuNode);
          } else {
            hierarchy.push(menuNode);
          }
        } else {
          hierarchy.push(menuNode);
        }
      });

      // Sort by order at each level
      const sortByOrder = (items) => {
        items.sort((a, b) => a.order - b.order);
        items.forEach(item => {
          if (item.children.length > 0) {
            sortByOrder(item.children);
          }
        });
      };

      sortByOrder(hierarchy);

      return hierarchy;
    } catch (error) {
      logger.error(`Failed to get menu hierarchy: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new MenuService();
