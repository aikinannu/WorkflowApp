# Godemar's Empire API Documentation

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
Most endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

Get a token by logging in or registering.

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Create a new user account.

**Request:**
```json
{
  "email": "user@empire.com",
  "password": "password123",
  "name": "Royal User"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user_id_hash",
    "email": "user@empire.com",
    "name": "Royal User",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=...",
    "token": "bearer_token_hash",
    "user": {
      "id": "user_id_hash",
      "email": "user@empire.com",
      "name": "Royal User",
      "avatar": "https://...",
      "profile": {
        "bio": "",
        "location": "",
        "website": "",
        "followers": 0,
        "following": 0
      }
    }
  }
}
```

**Errors:**
- 400: Missing email or password
- 409: User with this email already exists

---

### Login
**POST** `/auth/login`

Authenticate a user and get a token.

**Request:**
```json
{
  "email": "user@empire.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "user_id_hash",
    "email": "user@empire.com",
    "name": "Royal User",
    "avatar": "https://...",
    "token": "bearer_token_hash",
    "user": { /* user object */ }
  }
}
```

**Errors:**
- 400: Missing email or password
- 401: Invalid email or password

---

### Logout
**POST** `/auth/logout`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### Get Current User
**GET** `/auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user_id_hash",
    "email": "user@empire.com",
    "name": "Royal User",
    "avatar": "https://...",
    "profile": { /* profile object */ },
    "createdAt": "2026-06-12T14:21:34.572Z"
  }
}
```

---

## User Profile Endpoints

### Get User Profile
**GET** `/users/:userId`

Get a user's public profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user_id_hash",
    "email": "user@empire.com",
    "name": "Royal User",
    "avatar": "https://...",
    "profile": { /* profile object */ },
    "createdAt": "2026-06-12T14:21:34.572Z"
  }
}
```

---

### Update User Profile
**PUT** `/users/:userId`

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "Updated Name",
  "profile": {
    "bio": "Welcome to the empire",
    "location": "Empire City",
    "website": "https://example.com",
    "followers": 100,
    "following": 50
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { /* updated user object */ }
}
```

---

## Marketplace Endpoints

### Get All Products
**GET** `/marketplace/products`

Get all available products with optional filtering.

**Query Parameters:**
- `min_price` - Minimum price filter
- `max_price` - Maximum price filter
- `category` - Filter by category
- `sort_by` - Sort by: `price_asc`, `price_desc`, `rating`, `relevance`

**Example:** `GET /marketplace/products?category=treasures&sort_by=price_asc`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Royal Crown",
      "description": "A magnificent crown...",
      "price": 500,
      "category": "accessories",
      "image_url": "https://...",
      "rating": 4.8,
      "in_stock": true
    }
  ],
  "total": 6,
  "timestamp": "2026-06-12T14:12:07.247Z"
}
```

---

### Get Single Product
**GET** `/marketplace/products/:id`

Get details for a specific product.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Royal Crown",
    "description": "A magnificent crown...",
    "price": 500,
    "category": "accessories",
    "image_url": "https://...",
    "rating": 4.8,
    "in_stock": true
  }
}
```

---

### Search Products
**GET** `/search/products`

Search products by name and description.

**Query Parameters:**
- `q` - Search query (required)
- `category` - Optional category filter
- `min_price` - Optional min price
- `max_price` - Optional max price

**Example:** `GET /search/products?q=crown&category=accessories`

**Response (200):**
```json
{
  "success": true,
  "data": [ /* matching products */ ],
  "total": 1,
  "query": "crown"
}
```

---

### Get Categories
**GET** `/categories`

Get all product categories with counts.

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "name": "accessories", "count": 1 },
    { "name": "artifacts", "count": 1 },
    { "name": "treasures", "count": 1 },
    { "name": "rare", "count": 1 },
    { "name": "decor", "count": 1 },
    { "name": "weapons", "count": 1 }
  ],
  "total": 6
}
```

---

## Cart Endpoints

### Get Cart
**GET** `/cart`

**Headers:** `Authorization: Bearer <token>`

Get current user's shopping cart.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "user_id_hash",
    "items": [
      {
        "productId": 1,
        "quantity": 2,
        "addedAt": "2026-06-12T14:21:43.819Z"
      }
    ],
    "total": 1000,
    "itemCount": 1
  }
}
```

---

### Add Item to Cart
**POST** `/cart/items`

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "productId": 1,
  "quantity": 2
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "items": [ /* cart items */ ],
    "itemCount": 1
  }
}
```

---

### Remove Item from Cart
**DELETE** `/cart/items/:productId`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Item removed from cart",
  "data": {
    "items": [ /* remaining items */ ],
    "itemCount": 0
  }
}
```

---

### Clear Cart
**DELETE** `/cart`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Cart cleared",
  "data": {
    "items": [],
    "itemCount": 0
  }
}
```

---

## Order Endpoints

### Create Order (Checkout)
**POST** `/orders`

**Headers:** `Authorization: Bearer <token>`

Create an order from cart items.

**Request:**
```json
{
  "shippingAddress": {
    "street": "123 Royal Lane",
    "city": "Empire City",
    "state": "EC",
    "zipCode": "12345",
    "country": "Empireland"
  },
  "paymentMethod": "card"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "order_id_hash",
    "userId": "user_id_hash",
    "items": [
      {
        "productId": 1,
        "quantity": 2,
        "price": 500,
        "subtotal": 1000
      }
    ],
    "total": 1000,
    "status": "pending",
    "shippingAddress": { /* shipping address */ },
    "paymentMethod": "card",
    "createdAt": "2026-06-12T14:21:53.086Z",
    "updatedAt": "2026-06-12T14:21:53.086Z"
  }
}
```

---

### Get All Orders
**GET** `/orders`

**Headers:** `Authorization: Bearer <token>`

Get all orders for current user.

**Response (200):**
```json
{
  "success": true,
  "data": [ /* array of orders */ ],
  "total": 1
}
```

---

### Get Single Order
**GET** `/orders/:orderId`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": { /* order object */ }
}
```

---

### Update Order Status
**PATCH** `/orders/:orderId`

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "status": "shipped"
}
```

Valid statuses: `pending`, `processing`, `shipped`, `delivered`, `cancelled`

**Response (200):**
```json
{
  "success": true,
  "message": "Order updated",
  "data": { /* updated order */ }
}
```

---

## Wishlist Endpoints

### Get Wishlist
**GET** `/wishlist`

**Headers:** `Authorization: Bearer <token>`

Get current user's wishlist with full product details.

**Response (200):**
```json
{
  "success": true,
  "data": [ /* array of wishlist products */ ],
  "total": 1
}
```

---

### Add to Wishlist
**POST** `/wishlist/items`

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "productId": 3
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Added to wishlist",
  "data": {
    "wishlistCount": 1
  }
}
```

---

### Remove from Wishlist
**DELETE** `/wishlist/items/:productId`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Removed from wishlist",
  "data": {
    "wishlistCount": 0
  }
}
```

---

## Notification Endpoints

### Get Notifications
**GET** `/notifications`

**Headers:** `Authorization: Bearer <token>`

Get user's notifications.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "type": "order",
      "title": "Order Confirmed",
      "message": "Your order has been confirmed",
      "read": false,
      "timestamp": "2026-06-12T13:22:17.034Z"
    }
  ],
  "unreadCount": 2
}
```

---

### Mark Notification as Read
**PATCH** `/notifications/:notificationId`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

## Review Endpoints

### Get Product Reviews
**GET** `/products/:productId/reviews`

Get all reviews for a product.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "productId": 1,
      "userId": "user_id",
      "userName": "John Doe",
      "rating": 5,
      "title": "Excellent product!",
      "comment": "Very satisfied with this purchase",
      "helpful": 15,
      "timestamp": "2026-06-05T14:22:22.670Z"
    }
  ],
  "averageRating": "4.5"
}
```

---

### Add Product Review
**POST** `/products/:productId/reviews`

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "rating": 5,
  "title": "Amazing!",
  "comment": "Best purchase ever!"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Review added successfully",
  "data": {
    "id": "review_id_hash",
    "productId": 1,
    "userId": "user_id_hash",
    "userName": "Test User",
    "rating": 5,
    "title": "Amazing!",
    "comment": "Best purchase ever!",
    "helpful": 0,
    "timestamp": "2026-06-12T14:22:29.428Z"
  }
}
```

---

## Health Check

### Server Status
**GET** `/health`

Check if the API is running.

**Response (200):**
```json
{
  "status": "ok",
  "message": "Backend API is running"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created (for POST requests)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (permission denied)
- `404` - Not Found
- `409` - Conflict (duplicate user, etc.)
- `500` - Internal Server Error

---

## Testing the API

### Example: Complete User Flow

1. **Register:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@empire.com","password":"pass123","name":"Royal User"}'
```

2. **Add to cart:**
```bash
curl -X POST http://localhost:8000/api/v1/cart/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":2}'
```

3. **Checkout:**
```bash
curl -X POST http://localhost:8000/api/v1/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"shippingAddress":{"city":"Empire City"},"paymentMethod":"card"}'
```

4. **Add review:**
```bash
curl -X POST http://localhost:8000/api/v1/products/1/reviews \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating":5,"title":"Amazing!","comment":"Great product!"}'
```
