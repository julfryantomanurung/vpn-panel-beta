const fs = require('fs').promises;
const { executeCommand, executeCommandSimple, userExists } = require('../utils/system-command');
const { generateUUID } = require('../utils/uuid-generator');
const { generateVMessLinks } = require('../utils/vmess-link-generator');
const { generateVLESSLinks } = require('../utils/vless-link-generator');
const xrayService = require('./xray.service');
const VPN_CONFIG = require('../config/vpn.config');
const logger = require('../utils/logger');

/**
 * VPNUserService - Handles VPN user management operations
 */
class VPNUserService {
  /**
   * Create SSH user
   * @param {string} username - Username
   * @param {string} password - Password
   * @param {number} expiryDays - Number of days until expiry
   * @returns {Promise<object>}
   */
  async createSSHUser(username, password, expiryDays) {
    try {
      // Check if user already exists
      if (await userExists(username)) {
        throw new Error(`User '${username}' already exists`);
      }

      // Calculate expiry date
      const expiryDate = this._calculateExpiryDate(expiryDays);

      // Create user
      await executeCommand(`useradd -m -s /bin/bash ${username}`);
      
      // Set password
      await executeCommand(`echo '${username}:${password}' | chpasswd`);
      
      // Set expiry date
      await executeCommand(`usermod -e ${expiryDate} ${username}`);

      logger.info(`SSH user created: ${username}, expires: ${expiryDate}`);

      return {
        username,
        protocol: 'ssh',
        expiry_date: expiryDate,
        host: VPN_CONFIG.DOMAIN,
        ports: {
          ssh: VPN_CONFIG.PORTS.SSH,
          ssh_ssl: VPN_CONFIG.PORTS.SSH_SSL,
        },
      };
    } catch (error) {
      logger.error(`Failed to create SSH user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create VMess user
   * @param {string} username - Username
   * @param {number} expiryDays - Number of days until expiry
   * @returns {Promise<object>}
   */
  async createVMessUser(username, expiryDays) {
    try {
      // Check if user already exists in VMess
      const existingUsers = await this._readUserFile(VPN_CONFIG.VMESS_USER_FILE);
      if (existingUsers.some(u => u.user === username)) {
        throw new Error(`VMess user '${username}' already exists`);
      }

      // Generate UUID
      const uuid = generateUUID();

      // Calculate expiry date
      const expiryDate = this._calculateExpiryDate(expiryDays);

      // Add user to user file
      existingUsers.push({
        user: username,
        uuid: uuid,
        exp: expiryDate,
      });
      await this._writeUserFile(VPN_CONFIG.VMESS_USER_FILE, existingUsers);

      // Add client to Xray config
      await xrayService.addVMessClient(uuid);

      // Reload Xray
      await xrayService.reloadXray();

      // Generate connection links
      const links = generateVMessLinks(
        username,
        uuid,
        VPN_CONFIG.DOMAIN,
        VPN_CONFIG.PORTS.VMESS_WS,
        VPN_CONFIG.PORTS.VMESS_WSS
      );

      logger.info(`VMess user created: ${username}, UUID: ${uuid}, expires: ${expiryDate}`);

      return {
        username,
        protocol: 'vmess',
        uuid,
        expiry_date: expiryDate,
        links,
      };
    } catch (error) {
      logger.error(`Failed to create VMess user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create VLESS user
   * @param {string} username - Username
   * @param {number} expiryDays - Number of days until expiry
   * @returns {Promise<object>}
   */
  async createVLESSUser(username, expiryDays) {
    try {
      // Check if user already exists in VLESS
      const existingUsers = await this._readUserFile(VPN_CONFIG.VLESS_USER_FILE);
      if (existingUsers.some(u => u.user === username)) {
        throw new Error(`VLESS user '${username}' already exists`);
      }

      // Generate UUID
      const uuid = generateUUID();

      // Calculate expiry date
      const expiryDate = this._calculateExpiryDate(expiryDays);

      // Add user to user file
      existingUsers.push({
        user: username,
        uuid: uuid,
        exp: expiryDate,
      });
      await this._writeUserFile(VPN_CONFIG.VLESS_USER_FILE, existingUsers);

      // Add client to Xray config
      await xrayService.addVLESSClient(uuid);

      // Reload Xray
      await xrayService.reloadXray();

      // Generate connection links
      const links = generateVLESSLinks(
        username,
        uuid,
        VPN_CONFIG.DOMAIN,
        VPN_CONFIG.PORTS.VLESS_WS,
        VPN_CONFIG.PORTS.VLESS_WSS
      );

      logger.info(`VLESS user created: ${username}, UUID: ${uuid}, expires: ${expiryDate}`);

      return {
        username,
        protocol: 'vless',
        uuid,
        expiry_date: expiryDate,
        links,
      };
    } catch (error) {
      logger.error(`Failed to create VLESS user: ${error.message}`);
      throw error;
    }
  }

  /**
   * List all users
   * @param {string} protocol - Filter by protocol (optional)
   * @param {number} page - Page number for pagination
   * @param {number} limit - Items per page
   * @returns {Promise<object>}
   */
  async listAllUsers(protocol = null, page = 1, limit = 50) {
    try {
      const result = {
        ssh_users: [],
        vmess_users: [],
        vless_users: [],
      };

      // Get SSH users if requested
      if (!protocol || protocol === 'ssh') {
        result.ssh_users = await this._listSSHUsers();
      }

      // Get VMess users if requested
      if (!protocol || protocol === 'vmess') {
        result.vmess_users = await this._readUserFile(VPN_CONFIG.VMESS_USER_FILE);
      }

      // Get VLESS users if requested
      if (!protocol || protocol === 'vless') {
        result.vless_users = await this._readUserFile(VPN_CONFIG.VLESS_USER_FILE);
      }

      // Calculate pagination
      const allUsers = [
        ...result.ssh_users,
        ...result.vmess_users,
        ...result.vless_users,
      ];
      const total = allUsers.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      // Apply pagination if specific protocol is requested
      if (protocol) {
        if (protocol === 'ssh') {
          result.ssh_users = result.ssh_users.slice(startIndex, endIndex);
        } else if (protocol === 'vmess') {
          result.vmess_users = result.vmess_users.slice(startIndex, endIndex);
        } else if (protocol === 'vless') {
          result.vless_users = result.vless_users.slice(startIndex, endIndex);
        }
      }

      return {
        data: result,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error(`Failed to list users: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user by username
   * @param {string} username - Username to search for
   * @returns {Promise<object|null>}
   */
  async getUserByUsername(username) {
    try {
      // Check SSH
      if (await userExists(username)) {
        const expiry = await executeCommandSimple(
          `chage -l ${username} | grep "Account expires" | awk -F": " '{print $2}'`
        );
        return {
          username,
          protocol: 'ssh',
          expiry: expiry || 'never',
          host: VPN_CONFIG.DOMAIN,
        };
      }

      // Check VMess
      const vmessUsers = await this._readUserFile(VPN_CONFIG.VMESS_USER_FILE);
      const vmessUser = vmessUsers.find(u => u.user === username);
      if (vmessUser) {
        const links = generateVMessLinks(
          username,
          vmessUser.uuid,
          VPN_CONFIG.DOMAIN,
          VPN_CONFIG.PORTS.VMESS_WS,
          VPN_CONFIG.PORTS.VMESS_WSS
        );
        return {
          username: vmessUser.user,
          protocol: 'vmess',
          uuid: vmessUser.uuid,
          expiry_date: vmessUser.exp,
          links,
        };
      }

      // Check VLESS
      const vlessUsers = await this._readUserFile(VPN_CONFIG.VLESS_USER_FILE);
      const vlessUser = vlessUsers.find(u => u.user === username);
      if (vlessUser) {
        const links = generateVLESSLinks(
          username,
          vlessUser.uuid,
          VPN_CONFIG.DOMAIN,
          VPN_CONFIG.PORTS.VLESS_WS,
          VPN_CONFIG.PORTS.VLESS_WSS
        );
        return {
          username: vlessUser.user,
          protocol: 'vless',
          uuid: vlessUser.uuid,
          expiry_date: vlessUser.exp,
          links,
        };
      }

      return null;
    } catch (error) {
      logger.error(`Failed to get user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete user
   * @param {string} username - Username to delete
   * @returns {Promise<object>}
   */
  async deleteUser(username) {
    try {
      const deletedFrom = [];

      // Check and delete SSH user
      if (await userExists(username)) {
        await executeCommand(`userdel -r ${username}`);
        deletedFrom.push('ssh');
        logger.info(`Deleted SSH user: ${username}`);
      }

      // Check and delete VMess user
      const vmessUsers = await this._readUserFile(VPN_CONFIG.VMESS_USER_FILE);
      const vmessUser = vmessUsers.find(u => u.user === username);
      if (vmessUser) {
        const updatedVMessUsers = vmessUsers.filter(u => u.user !== username);
        await this._writeUserFile(VPN_CONFIG.VMESS_USER_FILE, updatedVMessUsers);
        await xrayService.removeVMessClient(vmessUser.uuid);
        deletedFrom.push('vmess');
        logger.info(`Deleted VMess user: ${username}`);
      }

      // Check and delete VLESS user
      const vlessUsers = await this._readUserFile(VPN_CONFIG.VLESS_USER_FILE);
      const vlessUser = vlessUsers.find(u => u.user === username);
      if (vlessUser) {
        const updatedVLESSUsers = vlessUsers.filter(u => u.user !== username);
        await this._writeUserFile(VPN_CONFIG.VLESS_USER_FILE, updatedVLESSUsers);
        await xrayService.removeVLESSClient(vlessUser.uuid);
        deletedFrom.push('vless');
        logger.info(`Deleted VLESS user: ${username}`);
      }

      if (deletedFrom.length === 0) {
        throw new Error(`User '${username}' not found`);
      }

      // Reload Xray if any Xray users were deleted
      if (deletedFrom.includes('vmess') || deletedFrom.includes('vless')) {
        await xrayService.reloadXray();
      }

      return {
        username,
        deletedFrom,
      };
    } catch (error) {
      logger.error(`Failed to delete user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Renew user expiry
   * @param {string} username - Username
   * @param {number} additionalDays - Additional days to add
   * @returns {Promise<object>}
   */
  async renewUser(username, additionalDays) {
    try {
      // Check SSH
      if (await userExists(username)) {
        const newExpiryDate = this._calculateExpiryDate(additionalDays);
        await executeCommand(`usermod -e ${newExpiryDate} ${username}`);
        logger.info(`Renewed SSH user: ${username}, new expiry: ${newExpiryDate}`);
        return {
          username,
          protocol: 'ssh',
          new_expiry_date: newExpiryDate,
        };
      }

      // Check VMess
      const vmessUsers = await this._readUserFile(VPN_CONFIG.VMESS_USER_FILE);
      const vmessUserIndex = vmessUsers.findIndex(u => u.user === username);
      if (vmessUserIndex !== -1) {
        const newExpiryDate = this._calculateExpiryDate(additionalDays);
        vmessUsers[vmessUserIndex].exp = newExpiryDate;
        await this._writeUserFile(VPN_CONFIG.VMESS_USER_FILE, vmessUsers);
        logger.info(`Renewed VMess user: ${username}, new expiry: ${newExpiryDate}`);
        return {
          username,
          protocol: 'vmess',
          new_expiry_date: newExpiryDate,
        };
      }

      // Check VLESS
      const vlessUsers = await this._readUserFile(VPN_CONFIG.VLESS_USER_FILE);
      const vlessUserIndex = vlessUsers.findIndex(u => u.user === username);
      if (vlessUserIndex !== -1) {
        const newExpiryDate = this._calculateExpiryDate(additionalDays);
        vlessUsers[vlessUserIndex].exp = newExpiryDate;
        await this._writeUserFile(VPN_CONFIG.VLESS_USER_FILE, vlessUsers);
        logger.info(`Renewed VLESS user: ${username}, new expiry: ${newExpiryDate}`);
        return {
          username,
          protocol: 'vless',
          new_expiry_date: newExpiryDate,
        };
      }

      throw new Error(`User '${username}' not found`);
    } catch (error) {
      logger.error(`Failed to renew user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update user (currently supports expiry and password for SSH)
   * @param {string} username - Username
   * @param {object} updates - Updates to apply
   * @returns {Promise<object>}
   */
  async updateUser(username, updates) {
    try {
      const { expiry_days, password } = updates;

      // Check SSH
      if (await userExists(username)) {
        if (expiry_days) {
          const newExpiryDate = this._calculateExpiryDate(expiry_days);
          await executeCommand(`usermod -e ${newExpiryDate} ${username}`);
        }
        if (password) {
          await executeCommand(`echo '${username}:${password}' | chpasswd`);
        }
        logger.info(`Updated SSH user: ${username}`);
        return {
          username,
          protocol: 'ssh',
          message: 'User updated successfully',
        };
      }

      // For VMess and VLESS, only expiry can be updated
      if (expiry_days) {
        const vmessUsers = await this._readUserFile(VPN_CONFIG.VMESS_USER_FILE);
        const vmessUserIndex = vmessUsers.findIndex(u => u.user === username);
        if (vmessUserIndex !== -1) {
          const newExpiryDate = this._calculateExpiryDate(expiry_days);
          vmessUsers[vmessUserIndex].exp = newExpiryDate;
          await this._writeUserFile(VPN_CONFIG.VMESS_USER_FILE, vmessUsers);
          logger.info(`Updated VMess user: ${username}`);
          return {
            username,
            protocol: 'vmess',
            new_expiry_date: newExpiryDate,
          };
        }

        const vlessUsers = await this._readUserFile(VPN_CONFIG.VLESS_USER_FILE);
        const vlessUserIndex = vlessUsers.findIndex(u => u.user === username);
        if (vlessUserIndex !== -1) {
          const newExpiryDate = this._calculateExpiryDate(expiry_days);
          vlessUsers[vlessUserIndex].exp = newExpiryDate;
          await this._writeUserFile(VPN_CONFIG.VLESS_USER_FILE, vlessUsers);
          logger.info(`Updated VLESS user: ${username}`);
          return {
            username,
            protocol: 'vless',
            new_expiry_date: newExpiryDate,
          };
        }
      }

      throw new Error(`User '${username}' not found`);
    } catch (error) {
      logger.error(`Failed to update user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get connection links for a user
   * @param {string} username - Username
   * @param {string} protocol - Protocol (vmess or vless)
   * @returns {Promise<object>}
   */
  async getConnectionLinks(username, protocol) {
    try {
      if (protocol === 'vmess') {
        const vmessUsers = await this._readUserFile(VPN_CONFIG.VMESS_USER_FILE);
        const vmessUser = vmessUsers.find(u => u.user === username);
        if (!vmessUser) {
          throw new Error(`VMess user '${username}' not found`);
        }
        return generateVMessLinks(
          username,
          vmessUser.uuid,
          VPN_CONFIG.DOMAIN,
          VPN_CONFIG.PORTS.VMESS_WS,
          VPN_CONFIG.PORTS.VMESS_WSS
        );
      } else if (protocol === 'vless') {
        const vlessUsers = await this._readUserFile(VPN_CONFIG.VLESS_USER_FILE);
        const vlessUser = vlessUsers.find(u => u.user === username);
        if (!vlessUser) {
          throw new Error(`VLESS user '${username}' not found`);
        }
        return generateVLESSLinks(
          username,
          vlessUser.uuid,
          VPN_CONFIG.DOMAIN,
          VPN_CONFIG.PORTS.VLESS_WS,
          VPN_CONFIG.PORTS.VLESS_WSS
        );
      } else {
        throw new Error('Connection links only available for VMess and VLESS protocols');
      }
    } catch (error) {
      logger.error(`Failed to get connection links: ${error.message}`);
      throw error;
    }
  }

  // Private helper methods

  /**
   * Calculate expiry date
   * @private
   */
  _calculateExpiryDate(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  /**
   * Read user file
   * @private
   */
  async _readUserFile(filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, return empty array
        return [];
      }
      throw error;
    }
  }

  /**
   * Write user file
   * @private
   */
  async _writeUserFile(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  /**
   * List SSH users
   * @private
   */
  async _listSSHUsers() {
    try {
      const passwdContent = await fs.readFile('/etc/passwd', 'utf8');
      const lines = passwdContent.split('\n');
      const sshUsers = [];

      for (const line of lines) {
        const parts = line.split(':');
        if (parts.length >= 3) {
          const username = parts[0];
          const uid = parseInt(parts[2]);

          // Only include regular users (UID >= 1000) and exclude 'nobody'
          if (uid >= 1000 && username !== 'nobody') {
            try {
              const expiry = await executeCommandSimple(
                `chage -l ${username} | grep "Account expires" | awk -F": " '{print $2}'`
              );
              sshUsers.push({
                username,
                expiry: expiry || 'never',
              });
            } catch (error) {
              // Skip users we can't get expiry for
            }
          }
        }
      }

      return sshUsers;
    } catch (error) {
      logger.error(`Failed to list SSH users: ${error.message}`);
      return [];
    }
  }
}

module.exports = new VPNUserService();
