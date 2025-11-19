const systemService = require('../services/system.service');
const VPN_CONFIG = require('../config/vpn.config');
const logger = require('../utils/logger');

/**
 * Get system information
 * GET /api/system/info
 */
async function getSystemInfo(req, res) {
  try {
    const info = await systemService.getSystemInfo();

    res.json({
      success: true,
      data: info,
    });
  } catch (error) {
    logger.error(`Get system info error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Renew SSL certificate
 * POST /api/system/ssl/renew
 */
async function renewSSL(req, res) {
  try {
    const result = await systemService.renewSSLCertificate();

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    logger.error(`Renew SSL error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Reboot server
 * POST /api/system/reboot
 */
async function rebootServer(req, res) {
  try {
    const result = await systemService.rebootServer();

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    logger.error(`Reboot server error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Reload services
 * POST /api/services/reload
 */
async function reloadServices(req, res) {
  try {
    const { services } = req.body;

    // Default to common services if none specified
    const servicesToReload = services || [
      VPN_CONFIG.SERVICES.XRAY,
      VPN_CONFIG.SERVICES.NGINX,
      VPN_CONFIG.SERVICES.STUNNEL,
    ];

    const result = await systemService.reloadServices(servicesToReload);

    res.json({
      success: true,
      message: 'Service reload completed',
      results: result.results,
    });
  } catch (error) {
    logger.error(`Reload services error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get service status
 * GET /api/services/status
 */
async function getServiceStatus(req, res) {
  try {
    const services = [
      VPN_CONFIG.SERVICES.XRAY,
      VPN_CONFIG.SERVICES.NGINX,
      VPN_CONFIG.SERVICES.STUNNEL,
      VPN_CONFIG.SERVICES.SSH,
    ];

    const statuses = await systemService.getServiceStatus(services);

    res.json({
      success: true,
      data: statuses,
    });
  } catch (error) {
    logger.error(`Get service status error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

module.exports = {
  getSystemInfo,
  renewSSL,
  rebootServer,
  reloadServices,
  getServiceStatus,
};
