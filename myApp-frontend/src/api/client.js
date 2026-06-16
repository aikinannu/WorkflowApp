// API client for frontend-backend communication
// Handles all HTTP requests to the backend API with proper error handling and interceptors
import secureStorage from '../utils/secureStorage';

const BASE_URL = 'http://localhost:8000/api/v1';

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const {
    method = 'GET',
    body = null,
    headers = {},
    skipAuth = false,
  } = options;

  try {
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    // Add auth token if available and not skipped
    if (!skipAuth) {
      const token = (await secureStorage.getItem('gdwb_token')) || (await secureStorage.getItem('auth_token')) || (await secureStorage.getItem('token'));
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
};

// === MARKETPLACE API ===
export const marketplaceAPI = {
  // Get all products with optional filters
  getProducts: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.min_price) params.append('min_price', filters.min_price);
    if (filters.max_price) params.append('max_price', filters.max_price);
    if (filters.category) params.append('category', filters.category);
    if (filters.sort_by) params.append('sort_by', filters.sort_by);

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall(`/marketplace/products${query}`, { skipAuth: true });
  },

  // Get single product by ID
  getProduct: async (id) => {
    return apiCall(`/marketplace/products/${id}`, { skipAuth: true });
  },

  // Search products
  searchProducts: async (query, filters = {}) => {
    const params = new URLSearchParams({ q: query });
    if (filters.category) params.append('category', filters.category);
    if (filters.min_price) params.append('min_price', filters.min_price);
    if (filters.max_price) params.append('max_price', filters.max_price);

    return apiCall(`/search/products?${params.toString()}`, { skipAuth: true });
  },

  // Get categories
  getCategories: async () => {
    return apiCall('/categories', { skipAuth: true });
  },
};

// === AUTH API ===
export const authAPI = {
  // User registration
  register: async (userData) => {
    const response = await apiCall('/auth/register', {
      method: 'POST',
      body: userData,
      skipAuth: true,
    });

    const token = response?.token || response?.data?.token;
    const user = response?.user || response?.data?.user;
    if (token) {
      await secureStorage.setItem('gdwb_token', token);
      if (user) await secureStorage.setItem('gdwb_user', JSON.stringify(user));
    }

    return response;
  },

  // User login
  login: async (credentials) => {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: credentials,
      skipAuth: true,
    });

    const token = response?.token || response?.data?.token;
    const user = response?.user || response?.data?.user;
    if (token) {
      await secureStorage.setItem('gdwb_token', token);
      if (user) await secureStorage.setItem('gdwb_user', JSON.stringify(user));
    }

    return response;
  },

  // User logout
  logout: async () => {
    try {
      await apiCall('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.warn('Logout API call failed, clearing local storage anyway:', error);
    }

    // Clear local storage
    await secureStorage.removeItem('gdwb_token');
    await secureStorage.removeItem('gdwb_user');
    return { success: true };
  },

  // Get current user
  getCurrentUser: async () => {
    const token = (await secureStorage.getItem('gdwb_token')) || (await secureStorage.getItem('auth_token')) || (await secureStorage.getItem('token'));
    if (!token) return null;
    const resp = await apiCall('/auth/introspect', {
      method: 'POST',
      body: { token },
      skipAuth: true,
    });
    return resp?.user || resp?.data?.user || null;
  },
};

// === USER PROFILE API ===
export const userAPI = {
  // Get user profile by ID
  getUserProfile: async (userId) => {
    return apiCall(`/users/${userId}`, { skipAuth: true });
  },

  // Update user profile
  updateProfile: async (userId, profileData) => {
    return apiCall(`/users/${userId}`, {
      method: 'PUT',
      body: profileData,
    });
  },
};

// === CART API ===
export const cartAPI = {
  // Get cart
  getCart: async () => {
    return apiCall('/cart');
  },

  // Add item to cart
  addItem: async (productId, quantity = 1) => {
    return apiCall('/cart/items', {
      method: 'POST',
      body: { productId, quantity },
    });
  },

  // Remove item from cart
  removeItem: async (productId) => {
    return apiCall(`/cart/items/${productId}`, {
      method: 'DELETE',
    });
  },

  // Clear cart
  clearCart: async () => {
    return apiCall('/cart', {
      method: 'DELETE',
    });
  },
};

// === ORDER API ===
export const orderAPI = {
  // Create order (checkout)
  createOrder: async (orderData) => {
    return apiCall('/orders', {
      method: 'POST',
      body: orderData,
    });
  },

  // Get all user orders
  getOrders: async () => {
    return apiCall('/orders');
  },

  // Get single order
  getOrder: async (orderId) => {
    return apiCall(`/orders/${orderId}`);
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    return apiCall(`/orders/${orderId}`, {
      method: 'PATCH',
      body: { status },
    });
  },
};

// === WISHLIST API ===
export const wishlistAPI = {
  // Get wishlist
  getWishlist: async () => {
    return apiCall('/wishlist');
  },

  // Add to wishlist
  addItem: async (productId) => {
    return apiCall('/wishlist/items', {
      method: 'POST',
      body: { productId },
    });
  },

  // Remove from wishlist
  removeItem: async (productId) => {
    return apiCall(`/wishlist/items/${productId}`, {
      method: 'DELETE',
    });
  },
};

// === NOTIFICATION API ===
export const notificationAPI = {
  // Get notifications
  getNotifications: async () => {
    return apiCall('/notifications');
  },

  // Mark as read
  markAsRead: async (notificationId) => {
    return apiCall(`/notifications/${notificationId}`, {
      method: 'PATCH',
    });
  },
};

// === REVIEW API ===
export const reviewAPI = {
  // Get product reviews
  getProductReviews: async (productId) => {
    return apiCall(`/products/${productId}/reviews`, { skipAuth: true });
  },

  // Add product review
  addReview: async (productId, reviewData) => {
    return apiCall(`/products/${productId}/reviews`, {
      method: 'POST',
      body: reviewData,
    });
  },
};

// Default export with all API groups
export default {
  marketplace: marketplaceAPI,
  auth: authAPI,
  user: userAPI,
  cart: cartAPI,
  order: orderAPI,
  wishlist: wishlistAPI,
  notification: notificationAPI,
  review: reviewAPI,
};
