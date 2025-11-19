const { exec } = require('child_process');
const { promisify } = require('util');
const logger = require('./logger');

const execAsync = promisify(exec);

/**
 * Execute a system command
 * @param {string} command - Command to execute
 * @param {object} options - Options for exec (optional)
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
async function executeCommand(command, options = {}) {
  try {
    logger.info(`Executing command: ${command}`);
    const result = await execAsync(command, { maxBuffer: 1024 * 1024 * 10, ...options });
    logger.info(`Command executed successfully: ${command}`);
    return result;
  } catch (error) {
    logger.error(`Command failed: ${command}, Error: ${error.message}`);
    throw error;
  }
}

/**
 * Execute a command and return only stdout
 * @param {string} command - Command to execute
 * @returns {Promise<string>}
 */
async function executeCommandSimple(command) {
  const { stdout } = await executeCommand(command);
  return stdout.trim();
}

/**
 * Check if a system user exists
 * @param {string} username - Username to check
 * @returns {Promise<boolean>}
 */
async function userExists(username) {
  try {
    await executeCommand(`id ${username}`);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if a service is running
 * @param {string} serviceName - Name of the service
 * @returns {Promise<boolean>}
 */
async function isServiceRunning(serviceName) {
  try {
    const { stdout } = await executeCommand(`systemctl is-active ${serviceName}`);
    return stdout.trim() === 'active';
  } catch (error) {
    return false;
  }
}

/**
 * Get system information
 * @returns {Promise<object>}
 */
async function getSystemInfo() {
  try {
    const [os, uptime, ramUsage, diskUsage] = await Promise.all([
      executeCommandSimple("lsb_release -ds || echo 'Unknown'"),
      executeCommandSimple("uptime -p || echo 'Unknown'"),
      executeCommandSimple("free -h | awk '/^Mem:/ {print $3 \"/\" $2}' || echo 'Unknown'"),
      executeCommandSimple("df -h / | awk 'NR==2 {print $3 \"/\" $2}' || echo 'Unknown'"),
    ]);

    return {
      os,
      uptime,
      ramUsage,
      diskUsage,
    };
  } catch (error) {
    logger.error(`Failed to get system info: ${error.message}`);
    throw error;
  }
}

module.exports = {
  executeCommand,
  executeCommandSimple,
  userExists,
  isServiceRunning,
  getSystemInfo,
};
