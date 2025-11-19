/**
 * Generate VMess connection link
 * @param {string} username - Username for the connection
 * @param {string} uuid - UUID for the user
 * @param {string} domain - Domain name
 * @param {number} port - Port number
 * @param {boolean} tls - Whether to use TLS
 * @returns {string} VMess link
 */
function generateVMessLink(username, uuid, domain, port, tls) {
  const config = {
    v: '2',
    ps: `${username}_${tls ? 'WSS' : 'WS'}_${port}`,
    add: domain,
    port: port.toString(),
    id: uuid,
    aid: '0',
    net: 'ws',
    type: 'none',
    host: domain,
    path: tls ? '/' : '/vmess',
    tls: tls ? 'tls' : 'none',
  };

  if (tls) {
    config.sni = domain;
  }

  const base64Config = Buffer.from(JSON.stringify(config)).toString('base64');
  return `vmess://${base64Config}`;
}

/**
 * Generate both WS and WSS VMess links
 * @param {string} username - Username for the connection
 * @param {string} uuid - UUID for the user
 * @param {string} domain - Domain name
 * @param {number} wsPort - WebSocket port (default: 80)
 * @param {number} wssPort - WebSocket Secure port (default: 8443)
 * @returns {object} Object containing ws and wss links
 */
function generateVMessLinks(username, uuid, domain, wsPort = 80, wssPort = 8443) {
  return {
    ws_80: generateVMessLink(username, uuid, domain, wsPort, false),
    wss_8443: generateVMessLink(username, uuid, domain, wssPort, true),
  };
}

module.exports = {
  generateVMessLink,
  generateVMessLinks,
};
