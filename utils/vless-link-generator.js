/**
 * Generate VLESS connection link
 * @param {string} username - Username for the connection
 * @param {string} uuid - UUID for the user
 * @param {string} domain - Domain name
 * @param {number} port - Port number
 * @param {boolean} tls - Whether to use TLS
 * @returns {string} VLESS link
 */
function generateVLESSLink(username, uuid, domain, port, tls) {
  const security = tls ? 'security=tls&' : '';
  const path = tls ? '%2F' : '%2Fvless';
  const sni = tls ? `&sni=${domain}` : '';
  const linkType = tls ? 'WSS' : 'WS';
  
  return `vless://${uuid}@${domain}:${port}?${security}encryption=none&headerType=none&type=ws&path=${path}&host=${domain}${sni}#${username}_VLESS_${linkType}_${port}`;
}

/**
 * Generate both WS and WSS VLESS links
 * @param {string} username - Username for the connection
 * @param {string} uuid - UUID for the user
 * @param {string} domain - Domain name
 * @param {number} wsPort - WebSocket port (default: 80)
 * @param {number} wssPort - WebSocket Secure port (default: 2043)
 * @returns {object} Object containing ws and wss links
 */
function generateVLESSLinks(username, uuid, domain, wsPort = 80, wssPort = 2043) {
  return {
    ws_80: generateVLESSLink(username, uuid, domain, wsPort, false),
    wss_2043: generateVLESSLink(username, uuid, domain, wssPort, true),
  };
}

module.exports = {
  generateVLESSLink,
  generateVLESSLinks,
};
