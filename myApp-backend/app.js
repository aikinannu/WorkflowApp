const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();
const http = require('http');
const https = require('https');
const qs = require('querystring');

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:8083',
  'http://localhost:19006',
  'http://127.0.0.1:19006',
  'http://127.0.0.1:8083',
  'http://192.168.100.193:8081',
];

// During local development allow dev origins dynamically so web frontend can access API
app.use(cors({
  origin: (origin, callback) => {
    // allow non-browser requests (curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple in-memory user storage (replace with database)
const users = new Map();
const tokens = new Map();
const cartItems = new Map();
const orders = new Map();
const licenseCache = new Map(); // in-memory cache: licenseKey -> { payload, fetchedAt }

// License server configuration
const LICENSE_SERVER_BASE = process.env.LICENSE_SERVER_BASE || 'http://localhost:8001';
const LICENSE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const axios = require('axios');

async function fetchLicenseFromServer(licenseKey, site) {
  try {
    const url = `${LICENSE_SERVER_BASE}/api/v1/validate`;
    const payload = qs.stringify({ license_key: licenseKey, site });
    const res = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 5000
    });
    // License server may return { success: true, token: '<jwt>' } or { access_token: '<jwt>' }
    if (res.data && (res.data.access_token || res.data.token || res.data.token_type)) {
      return res.data;
    }
    return null;
  } catch (err) {
    console.error('License server fetch error:', err.message || err);
    return null;
  }
}

async function getLicense(licenseKey, site) {
  const cached = licenseCache.get(licenseKey);
  const now = Date.now();
  if (cached && (now - cached.fetchedAt) < LICENSE_CACHE_TTL_MS) {
    return cached.payload;
  }
  const payload = await fetchLicenseFromServer(licenseKey, site);
  if (payload) {
    // If a JWT token is present, decode its payload for easy consumption
    const token = payload.access_token || payload.token || payload.accessToken || null;
    let claims = null;
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const b = Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
          claims = JSON.parse(b);
        }
      } catch (e) {
        // ignore
      }
    }
    const out = { raw: payload, token: token, claims };
    licenseCache.set(licenseKey, { payload: out, fetchedAt: now });
    return out;
  }
  return null;
}

// Middleware: check if user (by token) has access to a module
function requireModule(moduleName) {
  return async (req, res, next) => {
    // Expect license key in user's profile or header
    const licenseKey = req.headers['x-license-key'] || (req.userId && users.get(req.userId) && users.get(req.userId).licenseKey);
    if (!licenseKey) {
      return res.status(402).json({ success: false, error: 'License required', code: 'license_missing' });
    }

    const site = req.headers['x-site-url'] || req.hostname;
    const lic = await getLicense(licenseKey, site);
    if (!lic || !lic.access_token) {
      return res.status(403).json({ success: false, error: 'Invalid or inactive license', code: 'license_invalid' });
    }

    // Token may include features array
    try {
      const tokenPayload = lic.payload || lic; // some servers return payload at top
      const features = tokenPayload.features || (tokenPayload.claims && tokenPayload.claims.features) || [];
      if (!features.includes(moduleName)) {
        return res.status(403).json({ success: false, error: 'Module not included in license', code: 'module_not_included' });
      }
      req.license = tokenPayload;
      next();
    } catch (err) {
      console.error('License check error', err);
      return res.status(500).json({ success: false, error: 'License check failed' });
    }
  };
}

// Token validation middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No token provided'
    });
  }

  if (!tokens.has(token)) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }

  const userId = tokens.get(token);
  req.userId = userId;
  req.token = token;
  next();
};

// Mock marketplace products database
const mockProducts = [
  {
    id: 1,
    name: 'Royal Crown',
    description: 'A magnificent crown befitting a true ruler',
    price: 500,
    category: 'accessories',
    image_url: 'https://via.placeholder.com/300x300?text=Crown',
    rating: 4.8,
    in_stock: true
  },
  {
    id: 2,
    name: 'Ancient Scroll',
    description: 'A mysterious scroll from ancient civilizations',
    price: 250,
    category: 'artifacts',
    image_url: 'https://via.placeholder.com/300x300?text=Scroll',
    rating: 4.5,
    in_stock: true
  },
  {
    id: 3,
    name: 'Golden Goblet',
    description: 'A precious drinking vessel of legendary value',
    price: 350,
    category: 'treasures',
    image_url: 'https://via.placeholder.com/300x300?text=Goblet',
    rating: 4.7,
    in_stock: true
  },
  {
    id: 4,
    name: 'Dragon Egg',
    description: 'Rumored to contain a legendary dragon',
    price: 1000,
    category: 'rare',
    image_url: 'https://via.placeholder.com/300x300?text=Dragon+Egg',
    rating: 5.0,
    in_stock: false
  },
  {
    id: 5,
    name: 'Silk Tapestry',
    description: 'Hand-woven royal tapestry with intricate patterns',
    price: 180,
    category: 'decor',
    image_url: 'https://via.placeholder.com/300x300?text=Tapestry',
    rating: 4.3,
    in_stock: true
  },
  {
    id: 6,
    name: 'Silver Dagger',
    description: 'A finely crafted silver dagger with jeweled handle',
    price: 420,
    category: 'weapons',
    image_url: 'https://via.placeholder.com/300x300?text=Dagger',
    rating: 4.6,
    in_stock: true
  }
];

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend API is running' });
});

// API Routes
app.get('/api/v1/marketplace/products', (req, res) => {
  const { min_price, max_price, sort_by, category } = req.query;
  
  let products = [...mockProducts];
  
  // Filter by price
  if (min_price) {
    products = products.filter(p => p.price >= parseInt(min_price));
  }
  if (max_price) {
    products = products.filter(p => p.price <= parseInt(max_price));
  }
  
  // Filter by category
  if (category) {
    products = products.filter(p => p.category === category);
  }
  
  // Sort
  if (sort_by === 'price_asc') {
    products.sort((a, b) => a.price - b.price);
  } else if (sort_by === 'price_desc') {
    products.sort((a, b) => b.price - a.price);
  } else if (sort_by === 'rating') {
    products.sort((a, b) => b.rating - a.rating);
  } else if (sort_by === 'relevance') {
    // Keep original order
  }
  
  res.json({
    success: true,
    data: products,
    total: products.length,
    timestamp: new Date().toISOString()
  });
});

// License endpoints (integration with external PHP license server)
// Return cached license info for the current user.
// Accepts gateway-forwarded X-User-Id header or falls back to local token auth.
app.get('/api/v1/licenses/me', async (req, res) => {
  // Prefer gateway-provided user id
  const headerUserId = req.headers['x-user-id'] || req.headers['x_user_id'] || null;
  let userId = headerUserId || null;

  if (!userId) {
    // Fallback to local token authentication
    const authHeader = req.headers['authorization'] || req.headers['Authorization'] || '';
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, error: 'No token provided' });
    if (!tokens.has(token)) return res.status(403).json({ success: false, error: 'Invalid or expired token' });
    userId = tokens.get(token);
  }

  // Ensure a minimal user record exists so license can be assigned later
  if (!users.has(userId)) {
    users.set(userId, { id: userId, email: null, createdAt: new Date().toISOString() });
  }

  const user = users.get(userId);
  // Allow gateway to forward license info directly
  const forwardedLicense = req.headers['x-user-license-key'] || req.headers['x_user_license_key'] || null;
  const forwardedSeats = req.headers['x-user-seats'] || req.headers['x_user_seats'] || null;
  const licenseKey = forwardedLicense || (user && (user.licenseKey || user.license_key));
  if (!licenseKey) {
    return res.json({ success: true, data: null });
  }
  const site = req.headers['x-site-url'] || req.hostname;
  const lic = await getLicense(licenseKey, site);
  // Attach seats from forwarded header if available
  if (lic && forwardedSeats) {
    if (!lic.claims) lic.claims = {};
    lic.claims.seats = parseInt(forwardedSeats, 10) || lic.claims.seats || 0;
  }
  // DEBUG: include forwarded header awareness for troubleshooting
  res.json({ success: true, data: lic, debug: { forwardedLicense: forwardedLicense || null, forwardedSeats: forwardedSeats || null, x_headers: Object.keys(req.headers).filter(k => k.startsWith('x-')) } });
});

// Admin: validate arbitrary license key (internal use)
app.post('/api/v1/licenses/validate', authenticateToken, async (req, res) => {
  // restrict to admin? For now any authenticated user can call
  const { licenseKey, site } = req.body;
  if (!licenseKey) return res.status(400).json({ success: false, error: 'licenseKey required' });
  const lic = await getLicense(licenseKey, site || req.hostname);
  if (!lic) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, data: lic });
});

// Get single product
app.get('/api/v1/marketplace/products/:id', (req, res) => {
  const product = mockProducts.find(p => p.id === parseInt(req.params.id));
  
  if (!product) {
    return res.status(404).json({
      success: false,
      error: 'Product not found'
    });
  }
  
  res.json({
    success: true,
    data: product
  });
});

// === USER PROFILE ENDPOINTS ===

// Get user profile by ID
app.get('/api/v1/users/:userId', (req, res) => {
  const user = users.get(req.params.userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      profile: user.profile,
      createdAt: user.createdAt
    }
  });
});

// Update user profile (requires authentication)
app.put('/api/v1/users/:userId', (req, res) => {
  // Allow gateway to authenticate and forward X-User-Id header
  const headerUserId = req.headers['x-user-id'] || req.headers['x_user_id'] || null;
  let userId = headerUserId || null;

  if (!userId) {
    // Fallback to token-based auth
    const authHeader = req.headers['authorization'] || req.headers['Authorization'] || '';
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, error: 'No token provided' });
    if (!tokens.has(token)) return res.status(403).json({ success: false, error: 'Invalid or expired token' });
    userId = tokens.get(token);
  }

  if (userId !== req.params.userId) {
    return res.status(403).json({ success: false, error: 'Unauthorized' });
  }

  // Ensure user record exists
  if (!users.has(userId)) {
    users.set(userId, { id: userId, email: null, createdAt: new Date().toISOString() });
  }

  const user = users.get(userId);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  const { name, profile } = req.body;
  if (name) user.name = name;
  if (profile) {
    user.profile = { ...user.profile, ...profile };
  }

  // Allow assigning a license key when updating profile
  const licenseKeyValue = req.body.licenseKey || req.body.license_key || (profile && (profile.licenseKey || profile.license_key));
  if (licenseKeyValue) {
    user.licenseKey = licenseKeyValue;
  }
  user.updatedAt = new Date().toISOString();

  res.json({ success: true, message: 'Profile updated successfully', data: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, profile: user.profile } });
});

// === CART ENDPOINTS ===

// Get user cart
app.get('/api/v1/cart', authenticateToken, (req, res) => {
  const items = cartItems.get(req.userId) || [];
  
  const total = items.reduce((sum, item) => {
    const product = mockProducts.find(p => p.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  res.json({
    success: true,
    data: {
      userId: req.userId,
      items,
      total,
      itemCount: items.length
    }
  });
});

// Add item to cart
app.post('/api/v1/cart/items', authenticateToken, (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = mockProducts.find(p => p.id === parseInt(productId));
  if (!product) {
    return res.status(404).json({
      success: false,
      error: 'Product not found'
    });
  }

  if (!cartItems.has(req.userId)) {
    cartItems.set(req.userId, []);
  }

  const items = cartItems.get(req.userId);
  const existingItem = items.find(i => i.productId === parseInt(productId));

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    items.push({
      productId: parseInt(productId),
      quantity,
      addedAt: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    message: 'Item added to cart',
    data: {
      items,
      itemCount: items.length
    }
  });
});

// Remove item from cart
app.delete('/api/v1/cart/items/:productId', authenticateToken, (req, res) => {
  const productId = parseInt(req.params.productId);
  const items = cartItems.get(req.userId) || [];
  
  const updatedItems = items.filter(i => i.productId !== productId);
  cartItems.set(req.userId, updatedItems);

  res.json({
    success: true,
    message: 'Item removed from cart',
    data: {
      items: updatedItems,
      itemCount: updatedItems.length
    }
  });
});

// Clear cart
app.delete('/api/v1/cart', authenticateToken, (req, res) => {
  cartItems.delete(req.userId);

  res.json({
    success: true,
    message: 'Cart cleared',
    data: {
      items: [],
      itemCount: 0
    }
  });
});

// === ORDER ENDPOINTS ===

// Create order (checkout)
app.post('/api/v1/orders', authenticateToken, (req, res) => {
  const items = cartItems.get(req.userId) || [];
  
  if (items.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Cart is empty'
    });
  }

  const { shippingAddress, paymentMethod } = req.body;

  const orderId = crypto.randomBytes(8).toString('hex');
  const orderItems = items.map(item => {
    const product = mockProducts.find(p => p.id === item.productId);
    return {
      productId: item.productId,
      quantity: item.quantity,
      price: product.price,
      subtotal: product.price * item.quantity
    };
  });

  const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

  const order = {
    id: orderId,
    userId: req.userId,
    items: orderItems,
    total,
    status: 'pending',
    shippingAddress: shippingAddress || {},
    paymentMethod: paymentMethod || 'card',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  orders.set(orderId, order);
  cartItems.delete(req.userId); // Clear cart after order

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: order
  });
});

// Get user orders
app.get('/api/v1/orders', authenticateToken, (req, res) => {
  const userOrders = [];
  for (let order of orders.values()) {
    if (order.userId === req.userId) {
      userOrders.push(order);
    }
  }

  res.json({
    success: true,
    data: userOrders,
    total: userOrders.length
  });
});

// Get single order
app.get('/api/v1/orders/:orderId', authenticateToken, (req, res) => {
  const order = orders.get(req.params.orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found'
    });
  }

  if (order.userId !== req.userId) {
    return res.status(403).json({
      success: false,
      error: 'Unauthorized'
    });
  }

  res.json({
    success: true,
    data: order
  });
});

// Update order status (admin only)
app.patch('/api/v1/orders/:orderId', authenticateToken, (req, res) => {
  const order = orders.get(req.params.orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found'
    });
  }

  const { status } = req.body;
  if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid status'
    });
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();

  res.json({
    success: true,
    message: 'Order updated',
    data: order
  });
});

// === WISHLIST ENDPOINTS ===

// Get user wishlist
app.get('/api/v1/wishlist', authenticateToken, (req, res) => {
  const wishlist = [];
  const user = users.get(req.userId);
  
  if (user && user.wishlist) {
    user.wishlist.forEach(productId => {
      const product = mockProducts.find(p => p.id === productId);
      if (product) wishlist.push(product);
    });
  }

  res.json({
    success: true,
    data: wishlist,
    total: wishlist.length
  });
});

// Add to wishlist
app.post('/api/v1/wishlist/items', authenticateToken, (req, res) => {
  const { productId } = req.body;
  const user = users.get(req.userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  if (!user.wishlist) user.wishlist = [];

  if (!user.wishlist.includes(productId)) {
    user.wishlist.push(productId);
  }

  res.json({
    success: true,
    message: 'Added to wishlist',
    data: { wishlistCount: user.wishlist.length }
  });
});

// Remove from wishlist
app.delete('/api/v1/wishlist/items/:productId', authenticateToken, (req, res) => {
  const productId = parseInt(req.params.productId);
  const user = users.get(req.userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  if (user.wishlist) {
    user.wishlist = user.wishlist.filter(id => id !== productId);
  }

  res.json({
    success: true,
    message: 'Removed from wishlist',
    data: { wishlistCount: user.wishlist ? user.wishlist.length : 0 }
  });
});

// === SEARCH ENDPOINTS ===

// Search products
app.get('/api/v1/search/products', (req, res) => {
  const { q, category, min_price, max_price } = req.query;
  
  let results = mockProducts;

  if (q) {
    results = results.filter(p => 
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.description.toLowerCase().includes(q.toLowerCase())
    );
  }

  if (category) {
    results = results.filter(p => p.category === category);
  }

  if (min_price) {
    results = results.filter(p => p.price >= parseInt(min_price));
  }

  if (max_price) {
    results = results.filter(p => p.price <= parseInt(max_price));
  }

  res.json({
    success: true,
    data: results,
    total: results.length,
    query: q || ''
  });
});

// === CATEGORY ENDPOINTS ===

// Get all categories
app.get('/api/v1/categories', (req, res) => {
  const categories = [...new Set(mockProducts.map(p => p.category))];
  
  res.json({
    success: true,
    data: categories.map(cat => ({
      name: cat,
      count: mockProducts.filter(p => p.category === cat).length
    })),
    total: categories.length
  });
});

// === NOTIFICATIONS (mock) ===

// Get user notifications
app.get('/api/v1/notifications', authenticateToken, (req, res) => {
  const notifications = [
    {
      id: '1',
      type: 'order',
      title: 'Order Confirmed',
      message: 'Your order has been confirmed',
      read: false,
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '2',
      type: 'promotion',
      title: 'Special Offer',
      message: '20% off on all items',
      read: false,
      timestamp: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  res.json({
    success: true,
    data: notifications,
    unreadCount: notifications.filter(n => !n.read).length
  });
});

// Mark notification as read
app.patch('/api/v1/notifications/:notificationId', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Notification marked as read'
  });
});

// === REVIEWS ENDPOINTS ===

// Get product reviews
app.get('/api/v1/products/:productId/reviews', (req, res) => {
  const reviews = [
    {
      id: '1',
      productId: parseInt(req.params.productId),
      userId: 'user1',
      userName: 'John Doe',
      rating: 5,
      title: 'Excellent product!',
      comment: 'Very satisfied with this purchase',
      helpful: 15,
      timestamp: new Date(Date.now() - 604800000).toISOString()
    },
    {
      id: '2',
      productId: parseInt(req.params.productId),
      userId: 'user2',
      userName: 'Jane Smith',
      rating: 4,
      title: 'Good quality',
      comment: 'Met my expectations',
      helpful: 8,
      timestamp: new Date(Date.now() - 1209600000).toISOString()
    }
  ];

  res.json({
    success: true,
    data: reviews,
    averageRating: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
  });
});

// Add product review
app.post('/api/v1/products/:productId/reviews', authenticateToken, (req, res) => {
  const { rating, title, comment } = req.body;

  if (!rating || !title || !comment) {
    return res.status(400).json({
      success: false,
      error: 'Rating, title, and comment are required'
    });
  }

  const user = users.get(req.userId);
  const review = {
    id: crypto.randomBytes(8).toString('hex'),
    productId: parseInt(req.params.productId),
    userId: req.userId,
    userName: user.name,
    rating,
    title,
    comment,
    helpful: 0,
    timestamp: new Date().toISOString()
  };

  res.status(201).json({
    success: true,
    message: 'Review added successfully',
    data: review
  });
});

// User registration (with validation)
app.post('/api/v1/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  
  // Validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    });
  }

  // Check if user already exists
  for (let user of users.values()) {
    if (user.email === email) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      });
    }
  }
  
  // Create new user
  const userId = crypto.randomBytes(8).toString('hex');
  const hashedPassword = Buffer.from(password).toString('base64'); // In production, use bcrypt
  
  const newUser = {
    id: userId,
    email,
    password: hashedPassword,
    name: name || 'User',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    profile: {
      bio: '',
      location: '',
      website: '',
      followers: 0,
      following: 0
    }
  };

  users.set(userId, newUser);

  // Generate token
  const token = crypto.randomBytes(32).toString('hex');
  tokens.set(token, userId);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      id: userId,
      email,
      name: newUser.name,
      avatar: newUser.avatar,
      token,
      user: {
        id: userId,
        email,
        name: newUser.name,
        avatar: newUser.avatar,
        profile: newUser.profile
      }
    }
  });
});

// User login (with validation)
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    });
  }
  
  // Find user by email
  let user = null;
  let userId = null;
  for (let [id, u] of users.entries()) {
    if (u.email === email) {
      user = u;
      userId = id;
      break;
    }
  }

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid email or password'
    });
  }

  // Verify password
  const hashedPassword = Buffer.from(password).toString('base64');
  if (user.password !== hashedPassword) {
    return res.status(401).json({
      success: false,
      error: 'Invalid email or password'
    });
  }

  // Generate token
  const token = crypto.randomBytes(32).toString('hex');
  tokens.set(token, userId);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      id: userId,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      token,
      user: {
        id: userId,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        profile: user.profile
      }
    }
  });
});

// Token introspection used by frontend AuthProvider
app.post('/api/v1/auth/introspect', (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, valid: false, error: 'token required' });
  }

  if (tokens.has(token)) {
    const userId = tokens.get(token);
    const user = users.get(userId);
    return res.json({ success: true, valid: true, data: { id: userId, email: user.email, name: user.name } });
  }

  return res.json({ success: false, valid: false });
});

// Logout
app.post('/api/v1/auth/logout', authenticateToken, (req, res) => {
  tokens.delete(req.token);
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// Get current user profile
app.get('/api/v1/auth/me', authenticateToken, (req, res) => {
  const user = users.get(req.userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      profile: user.profile,
      createdAt: user.createdAt
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path
  });
});

module.exports = app;
