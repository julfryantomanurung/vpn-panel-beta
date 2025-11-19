const fs = require('fs').promises;
const { executeCommand, isServiceRunning } = require('../utils/system-command');
const VPN_CONFIG = require('../config/vpn.config');
const logger = require('../utils/logger');

/**
 * XrayService - Handles Xray configuration and operations
 */
class XrayService {
  /**
   * Add VMess client to configuration
   * @param {string} uuid - Client UUID
   * @returns {Promise<void>}
   */
  async addVMessClient(uuid) {
    try {
      const configPath = VPN_CONFIG.XRAY_CONFIG;
      const configData = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(configData);

      // Add client to inbound[0] (VMess)
      if (!config.inbounds || !config.inbounds[0]) {
        throw new Error('Invalid Xray config structure - VMess inbound not found');
      }

      if (!config.inbounds[0].settings) {
        config.inbounds[0].settings = {};
      }

      if (!config.inbounds[0].settings.clients) {
        config.inbounds[0].settings.clients = [];
      }

      config.inbounds[0].settings.clients.push({
        id: uuid,
        alterId: 0,
      });

      await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
      logger.info(`Added VMess client with UUID: ${uuid}`);
    } catch (error) {
      logger.error(`Failed to add VMess client: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add VLESS client to configuration
   * @param {string} uuid - Client UUID
   * @returns {Promise<void>}
   */
  async addVLESSClient(uuid) {
    try {
      const configPath = VPN_CONFIG.XRAY_CONFIG;
      const configData = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(configData);

      // Add client to inbound[1] (VLESS)
      if (!config.inbounds || !config.inbounds[1]) {
        throw new Error('Invalid Xray config structure - VLESS inbound not found');
      }

      if (!config.inbounds[1].settings) {
        config.inbounds[1].settings = {};
      }

      if (!config.inbounds[1].settings.clients) {
        config.inbounds[1].settings.clients = [];
      }

      config.inbounds[1].settings.clients.push({
        id: uuid,
      });

      await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
      logger.info(`Added VLESS client with UUID: ${uuid}`);
    } catch (error) {
      logger.error(`Failed to add VLESS client: ${error.message}`);
      throw error;
    }
  }

  /**
   * Remove VMess client from configuration
   * @param {string} uuid - Client UUID
   * @returns {Promise<void>}
   */
  async removeVMessClient(uuid) {
    try {
      const configPath = VPN_CONFIG.XRAY_CONFIG;
      const configData = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(configData);

      if (config.inbounds && config.inbounds[0] && config.inbounds[0].settings) {
        config.inbounds[0].settings.clients = 
          (config.inbounds[0].settings.clients || []).filter(client => client.id !== uuid);
      }

      await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
      logger.info(`Removed VMess client with UUID: ${uuid}`);
    } catch (error) {
      logger.error(`Failed to remove VMess client: ${error.message}`);
      throw error;
    }
  }

  /**
   * Remove VLESS client from configuration
   * @param {string} uuid - Client UUID
   * @returns {Promise<void>}
   */
  async removeVLESSClient(uuid) {
    try {
      const configPath = VPN_CONFIG.XRAY_CONFIG;
      const configData = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(configData);

      if (config.inbounds && config.inbounds[1] && config.inbounds[1].settings) {
        config.inbounds[1].settings.clients = 
          (config.inbounds[1].settings.clients || []).filter(client => client.id !== uuid);
      }

      await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
      logger.info(`Removed VLESS client with UUID: ${uuid}`);
    } catch (error) {
      logger.error(`Failed to remove VLESS client: ${error.message}`);
      throw error;
    }
  }

  /**
   * Reload Xray service
   * @returns {Promise<void>}
   */
  async reloadXray() {
    try {
      await executeCommand(`systemctl reload ${VPN_CONFIG.SERVICES.XRAY}`);
      logger.info('Xray service reloaded successfully');
    } catch (error) {
      logger.error(`Failed to reload Xray service: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get Xray configuration
   * @returns {Promise<object>}
   */
  async getConfig() {
    try {
      const configData = await fs.readFile(VPN_CONFIG.XRAY_CONFIG, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      logger.error(`Failed to get Xray config: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update Xray configuration
   * @param {object} config - New configuration
   * @returns {Promise<void>}
   */
  async updateConfig(config) {
    try {
      await fs.writeFile(VPN_CONFIG.XRAY_CONFIG, JSON.stringify(config, null, 2), 'utf8');
      logger.info('Xray configuration updated');
    } catch (error) {
      logger.error(`Failed to update Xray config: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if Xray service is running
   * @returns {Promise<boolean>}
   */
  async isRunning() {
    return await isServiceRunning(VPN_CONFIG.SERVICES.XRAY);
  }
}

module.exports = new XrayService();
