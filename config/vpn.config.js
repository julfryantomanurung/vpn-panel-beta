// VPN Configuration settings
const fs = require('fs');

const VPN_CONFIG = {
  // Domain configuration
  DOMAIN: process.env.DOMAIN || (() => {
    try {
      return fs.readFileSync('/root/domain', 'utf8').trim();
    } catch (error) {
      return 'localhost';
    }
  })(),

  // User file paths
  VMESS_USER_FILE: '/usr/local/etc/xray/users/vmess_users.json',
  VLESS_USER_FILE: '/usr/local/etc/xray/users/vless_users.json',
  XRAY_CONFIG: '/usr/local/etc/xray/config.json',

  // Port configuration
  PORTS: {
    VMESS_WS: 80,
    VMESS_WSS: 8443,
    VLESS_WS: 80,
    VLESS_WSS: 2043,
    SSH: 22,
    SSH_SSL: 443,
  },

  // Service names
  SERVICES: {
    XRAY: 'xray',
    NGINX: 'nginx',
    STUNNEL: 'stunnel4',
    SSH: 'ssh',
  },

  // Default values
  DEFAULTS: {
    MIN_EXPIRY_DAYS: 1,
    MAX_EXPIRY_DAYS: 365,
    DEFAULT_EXPIRY_DAYS: 30,
  },
};

module.exports = VPN_CONFIG;
