import Constants from "expo-constants";
import secureStorage from "../utils/secureStorage";

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl ||
  "http://localhost:8000/api/v1";
const STORAGE_TOKEN_KEY = "gdwb_token";

const getToken = async () => {
  try {
    return await secureStorage.getItem(STORAGE_TOKEN_KEY);
  } catch {
    return null;
  }
};

const buildUrl = (path, params = {}) => {
  const url = new URL(`${API_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, String(value));
    }
  });
  return url.toString();
};

const getAuthHeaders = async () => {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const request = async (path, { method = "GET", body, headers = {} } = {}) => {
  const tokenHeaders = await getAuthHeaders();
  const requestHeaders = {
    "Content-Type": "application/json",
    ...tokenHeaders,
    ...headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let json = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  if (!response.ok) {
    const message = json?.error || json?.message || response.statusText || "Request failed";
    throw new Error(message);
  }

  return json;
};

export const auth = {
  login: async ({ email, password, tenant_id }) =>
    request("/auth/login", { method: "POST", body: { email, password, tenant_id } }),
  register: async ({ email, password, tenant_id }) =>
    request("/auth/register", { method: "POST", body: { email, password, tenant_id } }),
  introspect: async (token) =>
    request("/auth/introspect", { method: "POST", body: { token } }),
};

export const feed = {
  fetchFeed: async ({ userId, tenantId, page = 1, limit = 20 }) => {
    const url = buildUrl("/feed", {
      user_id: userId,
      tenant_id: tenantId,
      page,
      limit,
    });
    const headers = {
      "Content-Type": "application/json",
      ...(await getAuthHeaders()),
    };
    const response = await fetch(url, { headers });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || data?.message || response.statusText || "Feed request failed");
    }
    return data;
  },
};

export const marketplace = {
  listProducts: async (filters = {}) => {
    const query = {
      category: filters.category !== "All" ? filters.category : undefined,
      brand: filters.brand !== "All" ? filters.brand : undefined,
      min_price: filters.priceRange?.[0],
      max_price: filters.priceRange?.[1],
      sort_by: filters.sortBy,
    };
    const url = buildUrl("/marketplace/products", query);
    const headers = {
      "Content-Type": "application/json",
      ...(await getAuthHeaders()),
    };
    const response = await fetch(url, { headers });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || data?.message || response.statusText || "Marketplace request failed");
    }
    return data;
  },
  getProduct: async (productId) => request(`/marketplace/products/${productId}`),
  purchaseProduct: async (productId, payload = {}) =>
    request(`/marketplace/products/${productId}/purchase`, { method: "POST", body: payload }),
  createProduct: async (payload) =>
    request(`/marketplace/products`, { method: "POST", body: payload }),
};

export const social = {
  createPost: async ({ content, tenant_id, media = [] }) =>
    request("/social/posts", { method: "POST", body: { content, tenant_id, media } }),
};
