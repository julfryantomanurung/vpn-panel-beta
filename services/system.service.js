const { executeCommand, getSystemInfo, isServiceRunning } = require('../utils/system-command');
const VPN_CONFIG = require('../config/vpn.config');
const logger = require('../utils/logger');

/**
 * SystemService - Handles system operations
 */
class SystemService {
  /**
   * Get system information
   * @returns {Promise<object>}
   */
  async getSystemInfo() {
    try {
      const sysInfo = await getSystemInfo();
      return {
        ...sysInfo,
        domain: VPN_CONFIG.DOMAIN,
      };
    } catch (error) {
      logger.error(`Failed to get system info: ${error.message}`);
      throw error;
    }
  }

  /**
   * Renew SSL certificate
   * @returns {Promise<object>}
   */
  async renewSSLCertificate() {
    try {
      logger.info('Starting SSL certificate renewal');
      
      // Stop nginx and stunnel
      await executeCommand(`systemctl stop ${VPN_CONFIG.SERVICES.NGINX}`);
      await executeCommand(`systemctl stop ${VPN_CONFIG.SERVICES.STUNNEL}`);

      // Renew certificate
      await executeCommand('certbot renew --force-renewal');

      // Start services again
      await executeCommand(`systemctl start ${VPN_CONFIG.SERVICES.NGINX}`);
      await executeCommand(`systemctl start ${VPN_CONFIG.SERVICES.STUNNEL}`);

      logger.info('SSL certificate renewed successfully');
      return {
        success: true,
        message: 'SSL certificate renewed successfully',
      };
    } catch (error) {
      logger.error(`Failed to renew SSL certificate: ${error.message}`);
      // Try to start services even if renewal failed
      try {
        await executeCommand(`systemctl start ${VPN_CONFIG.SERVICES.NGINX}`);
        await executeCommand(`systemctl start ${VPN_CONFIG.SERVICES.STUNNEL}`);
      } catch (startError) {
        logger.error(`Failed to restart services: ${startError.message}`);
      }
      throw error;
    }
  }

  /**
   * Reboot server
   * @returns {Promise<object>}
   */
  async rebootServer() {
    try {
      logger.warn('Server reboot initiated');
      // Use nohup to ensure reboot command executes even if connection drops
      await executeCommand('nohup reboot &');
      return {
        success: true,
        message: 'Server reboot initiated',
      };
    } catch (error) {
      logger.error(`Failed to reboot server: ${error.message}`);
      throw error;
    }
  }

  /**
   * Reload services
   * @param {string[]} services - Array of service names to reload
   * @returns {Promise<object>}
   */
  async reloadServices(services) {
    try {
      const results = [];
      
      for (const service of services) {
        try {
          await executeCommand(`systemctl reload ${service}`);
          results.push({
            service,
            status: 'success',
            message: `${service} reloaded successfully`,
          });
          logger.info(`Service reloaded: ${service}`);
        } catch (error) {
          results.push({
            service,
            status: 'failed',
            message: error.message,
          });
          logger.error(`Failed to reload ${service}: ${error.message}`);
        }
      }

      return {
        success: true,
        results,
      };
    } catch (error) {
      logger.error(`Failed to reload services: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get service status
   * @param {string[]} services - Array of service names to check
   * @returns {Promise<object>}
   */
  async getServiceStatus(services) {
    try {
      const statuses = {};
      
      for (const service of services) {
        const isRunning = await isServiceRunning(service);
        statuses[service] = {
          running: isRunning,
          status: isRunning ? 'active' : 'inactive',
        };
      }

      return statuses;
    } catch (error) {
      logger.error(`Failed to get service status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute command (admin only)
   * @param {string} command - Command to execute
   * @returns {Promise<object>}
   */
  async executeCommand(command) {
    try {
      const result = await executeCommand(command);
      return {
        success: true,
        stdout: result.stdout,
        stderr: result.stderr,
      };
    } catch (error) {
      logger.error(`Command execution failed: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new SystemService();
