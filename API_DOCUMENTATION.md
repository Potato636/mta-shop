# 🎮 MTA Shop - API Documentation

## 📍 Base URL
```
https://seu-replit-app.replit.dev/api
```

---

## 🔐 Authentication Routes

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "serial": "988CBCDD5B9CE9C19EBBE1268A151294",
  "email": "player@mtashop.com",
  "phone": "5511999999999",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "serial": "988CBCDD5B9CE9C19EBBE1268A151294",
  "email": "player@mtashop.com",
  "phone": "5511999999999",
  "isAdmin": 0,
  "stripeCustomerId": null,
  "createdAt": "2025-11-27T00:00:00.000Z"
}
```

---

### Login (Serial + Password)
```http
POST /api/auth/login
Content-Type: application/json

{
  "serial": "988CBCDD5B9CE9C19EBBE1268A151294",
  "password": "securePassword123"
}
```

**Response (200):** Same as Register

---

### Admin Login (Email + Password)
```http
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@mtashop.com",
  "password": "adminPassword123"
}
```

**Response (200):** User object with admin privileges

---

### Logout
```http
POST /api/auth/logout
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <session>
```

**Response (200):** Current user object

---

## 🛍️ Product Routes

### Get All Products
```http
GET /api/products
```

**Response (200):**
```json
[
  {
    "id": "product-id",
    "name": "VIP Bronze - 30 Days",
    "description": "Premium VIP status...",
    "price": "9.99",
    "category": "vip",
    "imageUrl": "/path/to/image.png",
    "mtaItemType": "vip",
    "mtaItemData": "{\"level\": \"bronze\", \"days\": 30}",
    "stock": -1,
    "isActive": 1,
    "createdAt": "2025-11-27T00:00:00.000Z"
  }
]
```

---

### Get Product by ID
```http
GET /api/products/:id
```

---

### Create Product (ADMIN ONLY)
```http
POST /api/products
Authorization: Bearer <session>
Content-Type: application/json

{
  "name": "VIP Gold - 30 Days",
  "description": "Premium VIP membership...",
  "price": "24.99",
  "category": "vip",
  "imageUrl": "/path/to/image.png",
  "mtaItemType": "vip",
  "mtaItemData": "{\"level\": \"gold\", \"days\": 30}",
  "stock": -1,
  "isActive": 1
}
```

---

### Update Product (ADMIN ONLY)
```http
PATCH /api/products/:id
Authorization: Bearer <session>
Content-Type: application/json

{
  "price": "29.99",
  "stock": 50
}
```

---

### Delete Product (ADMIN ONLY)
```http
DELETE /api/products/:id
Authorization: Bearer <session>
```

---

## 🛒 Cart Routes

### Get Cart Items
```http
GET /api/cart
Authorization: Bearer <session>
```

---

### Add to Cart
```http
POST /api/cart
Authorization: Bearer <session>
Content-Type: application/json

{
  "productId": "product-id",
  "quantity": 1
}
```

---

### Update Cart Item Quantity
```http
PATCH /api/cart/:cartItemId
Authorization: Bearer <session>
Content-Type: application/json

{
  "quantity": 2
}
```

---

### Remove from Cart
```http
DELETE /api/cart/:cartItemId
Authorization: Bearer <session>
```

---

### Clear Cart
```http
DELETE /api/cart
Authorization: Bearer <session>
```

---

## 📦 Order Routes

### Create Order
```http
POST /api/orders
Authorization: Bearer <session>
Content-Type: application/json

{
  "items": [
    {
      "productId": "product-id",
      "quantity": 1,
      "price": "9.99",
      "productName": "VIP Bronze",
      "mtaItemType": "vip",
      "mtaItemData": "{\"level\": \"bronze\", \"days\": 30}"
    }
  ],
  "totalAmount": "9.99",
  "paymentMethod": "pix",
  "mtaUsername": "PlayerName"
}
```

**Response (201):**
```json
{
  "id": "order-id",
  "userId": "user-id",
  "totalAmount": "9.99",
  "status": "pending_payment",
  "paymentMethod": "pix",
  "mtaDelivered": 0,
  "deliveryError": null,
  "createdAt": "2025-11-27T00:00:00.000Z",
  "updatedAt": "2025-11-27T00:00:00.000Z"
}
```

---

### Get User Orders
```http
GET /api/orders
Authorization: Bearer <session>
```

---

### Get All Orders (ADMIN ONLY)
```http
GET /api/admin/orders
Authorization: Bearer <session>
```

---

### Update Order Status (ADMIN ONLY)
```http
PATCH /api/admin/orders/:orderId
Authorization: Bearer <session>
Content-Type: application/json

{
  "status": "awaiting_pickup",
  "triggerDelivery": true
}
```

**Status Values:**
- `pending_payment` - Awaiting payment
- `paid` - Payment received
- `awaiting_pickup` - Ready for pickup
- `completed` - Pickup confirmed
- `delivered` - Item delivered to MTA
- `failed` - Delivery failed
- `cancelled` - Order cancelled

---

### Confirm Pickup (ADMIN ONLY)
```http
POST /api/admin/orders/:orderId/confirm-pickup
Authorization: Bearer <session>
```

---

### Retry Delivery (ADMIN ONLY)
```http
POST /api/admin/retry-delivery/:orderId
Authorization: Bearer <session>
```

---

## 🎮 MTA Integration Routes

### MTA Delivery Endpoint
```http
POST /api/mta/delivery
Content-Type: application/json

{
  "playerUsername": "PlayerNameInMTA",
  "items": [
    {
      "type": "vip",
      "data": {
        "level": "gold",
        "days": 30
      }
    },
    {
      "type": "coins",
      "data": {
        "amount": 1000
      }
    }
  ],
  "apiKey": "your-mta-api-key-here"
}
```

**Response (200):**
```json
{
  "success": true,
  "delivered": ["PlayerName"],
  "failed": []
}
```

---

## 👤 Profile Routes

### Get Profile
```http
GET /api/profile
Authorization: Bearer <session>
```

---

### Update Player Stats
```http
PATCH /api/profile/update-stats
Authorization: Bearer <session>
Content-Type: application/json

{
  "health": 100,
  "armor": 50,
  "money": 10000,
  "cityCoins": 500,
  "level": 5,
  "experience": 1000
}
```

---

## 📊 Analytics Routes

### Get Analytics (ADMIN ONLY)
```http
GET /api/admin/analytics
Authorization: Bearer <session>
```

**Response (200):**
```json
{
  "totalRevenue": 999.99,
  "totalOrders": 10,
  "totalProducts": 8,
  "totalCustomers": 5,
  "revenueByProduct": [
    {
      "productName": "VIP Bronze",
      "revenue": 99.99,
      "unitsSold": 10
    }
  ]
}
```

---

## 🎫 Support Tickets Routes

### Create Support Ticket
```http
POST /api/support-tickets
Authorization: Bearer <session>
Content-Type: application/json

{
  "subject": "Item not delivered",
  "message": "I purchased VIP Bronze but didn't receive it...",
  "status": "open"
}
```

---

### Get Support Tickets
```http
GET /api/support-tickets
Authorization: Bearer <session>
```

*(Admin sees all, User sees only their tickets)*

---

### Update Support Ticket
```http
PATCH /api/support-tickets/:ticketId
Authorization: Bearer <session>
Content-Type: application/json

{
  "status": "resolved",
  "message": "Delivery was processed successfully"
}
```

---

## 💳 Payment Routes

### Payment Webhook
```http
POST /api/orders/payment-webhook
Content-Type: application/json

{
  "orderId": "order-id",
  "status": "approved",
  "paymentId": "payment-id"
}
```

---

## 🔐 Authentication Headers

All protected endpoints require a valid session cookie set by the server.

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (Admin only)
- `404` - Not Found
- `500` - Server Error

---

## 📝 Error Response Format

```json
{
  "message": "Error description here"
}
```

---

## 🧪 Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "serial": "TEST123",
    "email": "test@example.com",
    "phone": "5511999999999",
    "password": "password123"
  }'
```

### Get Products
```bash
curl http://localhost:5000/api/products
```

### MTA Delivery
```bash
curl -X POST http://localhost:5000/api/mta/delivery \
  -H "Content-Type: application/json" \
  -d '{
    "playerUsername": "TestPlayer",
    "items": [{
      "type": "coins",
      "data": {"amount": 100}
    }],
    "apiKey": "your-api-key"
  }'
```

---

## 📚 Related Documentation

- `SETUP_GUIDE.md` - MTA integration setup
- `replit.md` - Project overview
- `mta_delivery_script.lua` - MTA delivery script
