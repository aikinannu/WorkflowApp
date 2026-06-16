// Route license & billing calls via the API gateway
import secureStorage from '../utils/secureStorage';
const GATEWAY_BASE = process.env.GATEWAY_BASE || 'http://localhost:8000';
const LICENSE_SERVICE = '/api/v1/license';
const BILLING_SERVICE = '/api/v1/billing';

async function gatewayRequest(fullPath, options = {}) {
  const url = `${GATEWAY_BASE}${fullPath}`;
  const opts = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  if (opts.body && typeof opts.body === 'object' && opts.headers['Content-Type'] === 'application/json') {
    opts.body = JSON.stringify(opts.body);
  }

  const res = await fetch(url, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
  return data;
}

export const licenseClient = {
  // Token endpoint (supports license grant) -> /api/v1/license/token
  tokenWithLicense: async (licenseKey, site = '') => {
    const params = new URLSearchParams();
    params.append('grant_type', 'license');
    params.append('license_key', licenseKey);
    if (site) params.append('site', site);

    const res = await fetch(`${GATEWAY_BASE}${LICENSE_SERVICE}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!res.ok) throw new Error('Token request failed');
    return res.json();
  },

  // Validate license -> /api/v1/license/validate
  validate: async (licenseKey, site = '') => {
    return gatewayRequest(`${LICENSE_SERVICE}/validate`, { method: 'POST', body: { license_key: licenseKey, site } });
  },

  // Introspect token -> /api/v1/license/introspect
  introspect: async (token) => {
    return gatewayRequest(`${LICENSE_SERVICE}/introspect`, { method: 'POST', body: { token } });
  },

  // Revoke license (admin) -> /api/v1/license/revoke
  revoke: async (licenseKey, adminToken) => {
    return gatewayRequest(`${LICENSE_SERVICE}/revoke`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { license_key: licenseKey }
    });
  },

  // Purchase plan (payment + license issuance) -> /api/v1/billing/purchase
  purchasePlan: async (planId, details = {}) => {
    return gatewayRequest(`${BILLING_SERVICE}/purchase`, {
      method: 'POST',
      body: { plan: planId, ...details },
    });
  },

  // Poll/complete purchase -> /api/v1/billing/purchase/complete
  purchaseComplete: async (details = {}) => {
    return gatewayRequest(`${BILLING_SERVICE}/purchase/complete`, {
      method: 'POST',
      body: details,
    });
  },

  // Get current user's license info -> /api/v1/licenses/me
  getMyLicense: async () => {
      const token = (await secureStorage.getItem('gdwb_token')) || (await secureStorage.getItem('auth_token')) || null;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return gatewayRequest('/api/v1/licenses/me', { method: 'GET', headers });
  },

  // JWKS -> /api/v1/license/jwks
  getJWKS: async () => {
    return gatewayRequest(`${LICENSE_SERVICE}/jwks`);
  }
};

export default licenseClient;