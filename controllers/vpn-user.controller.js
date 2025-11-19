const vpnUserService = require('../services/vpn-user.service');
const logger = require('../utils/logger');

/**
 * Create VPN user
 * POST /api/vpn/users
 */
async function createVPNUser(req, res) {
  try {
    const { username, protocol, expiry_days, password } = req.body;

    let result;
    
    if (protocol === 'ssh') {
      result = await vpnUserService.createSSHUser(username, password, expiry_days);
    } else if (protocol === 'vmess') {
      result = await vpnUserService.createVMessUser(username, expiry_days);
    } else if (protocol === 'vless') {
      result = await vpnUserService.createVLESSUser(username, expiry_days);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid protocol',
      });
    }

    res.status(201).json({
      success: true,
      message: `User '${username}' created successfully`,
      data: result,
    });
  } catch (error) {
    logger.error(`Create user error: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * List all VPN users
 * GET /api/vpn/users
 */
async function listVPNUsers(req, res) {
  try {
    const { protocol, page, limit } = req.query;

    const result = await vpnUserService.listAllUsers(
      protocol,
      parseInt(page) || 1,
      parseInt(limit) || 50
    );

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error(`List users error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get user details
 * GET /api/vpn/users/:username
 */
async function getUserDetails(req, res) {
  try {
    const { username } = req.params;

    const user = await vpnUserService.getUserByUsername(username);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: `User '${username}' not found`,
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error(`Get user error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Update user
 * PUT /api/vpn/users/:username
 */
async function updateUser(req, res) {
  try {
    const { username } = req.params;
    const updates = req.body;

    const result = await vpnUserService.updateUser(username, updates);

    res.json({
      success: true,
      message: `User '${username}' updated successfully`,
      data: result,
    });
  } catch (error) {
    logger.error(`Update user error: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Delete user
 * DELETE /api/vpn/users/:username
 */
async function deleteUser(req, res) {
  try {
    const { username } = req.params;

    const result = await vpnUserService.deleteUser(username);

    res.json({
      success: true,
      message: `User '${username}' deleted successfully`,
      deleted_from: result.deletedFrom,
    });
  } catch (error) {
    logger.error(`Delete user error: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Renew user
 * POST /api/vpn/users/:username/renew
 */
async function renewUser(req, res) {
  try {
    const { username } = req.params;
    const { additional_days } = req.body;

    const result = await vpnUserService.renewUser(username, additional_days);

    res.json({
      success: true,
      message: `User '${username}' renewed successfully`,
      data: result,
    });
  } catch (error) {
    logger.error(`Renew user error: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get user connection links
 * GET /api/vpn/users/:username/links
 */
async function getUserLinks(req, res) {
  try {
    const { username } = req.params;

    // Get user to determine protocol
    const user = await vpnUserService.getUserByUsername(username);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: `User '${username}' not found`,
      });
    }

    if (user.protocol === 'ssh') {
      return res.status(400).json({
        success: false,
        error: 'Connection links are not available for SSH users',
      });
    }

    const links = await vpnUserService.getConnectionLinks(username, user.protocol);

    res.json({
      success: true,
      data: {
        username,
        protocol: user.protocol,
        links,
      },
    });
  } catch (error) {
    logger.error(`Get user links error: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

module.exports = {
  createVPNUser,
  listVPNUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  renewUser,
  getUserLinks,
};
