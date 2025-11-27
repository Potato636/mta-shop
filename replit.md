# MTA Shop - E-Commerce Platform

## 📋 Project Overview

**Status:** MVP Complete ✅  
**Type:** Full-stack e-commerce application for MTA (Multi Theft Auto) game server  
**Stack:** React + Express + PostgreSQL + TypeScript

## 🎯 MVP Features Implemented

### Frontend
- ✅ Responsive hero landing page with gaming aesthetic
- ✅ Product catalog with filtering, search, and sorting
- ✅ Shopping cart with real-time updates
- ✅ Checkout flow with order summary
- ✅ User authentication (register/login)
- ✅ User dashboard with order tracking
- ✅ Admin panel with full CRUD for products
- ✅ Admin pickup confirmation interface
- ✅ Beautiful loading states and empty states
- ✅ Dark mode support
- ✅ Fully responsive design (mobile, tablet, desktop)

### Backend
- ✅ User authentication with bcrypt password hashing
- ✅ Session management with express-session
- ✅ Complete product management API
- ✅ Shopping cart API with persistence
- ✅ Order management system
- ✅ Admin operations (order status updates, pickup confirmation)
- ✅ PostgreSQL database with Drizzle ORM
- ✅ Payment webhook handler
- ✅ MTA delivery API endpoint
- ✅ Automatic product seeding on first run

### Database Schema
- `users` - Player accounts with admin flag
- `products` - Shop products with MTA metadata
- `orders` - Purchase orders with status tracking
- `orderItems` - Items in each order
- `cartItems` - Temporary shopping cart storage

### Security
- ✅ Password hashing with bcrypt
- ✅ Session-based authentication
- ✅ Admin middleware for protected routes
- ✅ API key validation for MTA callbacks
- ✅ CORS handled via credentials

## 🛠️ Tech Stack

**Frontend:**
- React 18 with Vite
- TypeScript
- TanStack Query v5 for state management
- React Hook Form for forms
- Zod for validation
- Tailwind CSS for styling
- Shadcn UI components
- Wouter for routing
- Lucide React for icons

**Backend:**
- Express.js
- TypeScript
- PostgreSQL with Drizzle ORM
- Express Session for auth
- Bcrypt for password hashing
- Neon serverless database

**MTA Integration:**
- Lua script for server-side delivery
- HTTP callbacks for real-time updates
- API key authentication

## 📊 Data Models

### User
```typescript
id: string (UUID)
username: string (unique)
email: string (unique)
password: string (hashed)
mtaUsername: string | null
isAdmin: 0 | 1
createdAt: Date
```

### Product
```typescript
id: string (UUID)
name: string
description: string
price: decimal
category: "vip" | "currency" | "items" | "special"
imageUrl: string
mtaItemType: string
mtaItemData: string (JSON)
stock: number (-1 = unlimited)
isActive: 0 | 1
createdAt: Date
```

### Order
```typescript
id: string (UUID)
userId: string (FK)
totalAmount: decimal
status: "pending_payment" | "paid" | "awaiting_pickup" | "completed" | "delivered" | "failed"
paymentMethod: "pix" | "card" | null
mtaDelivered: 0 | 1
deliveryError: string | null
createdAt: Date
updatedAt: Date
```

## 🎮 MTA Integration

The system includes a Lua script (`mta_delivery_script.lua`) that:
- Receives delivery requests from the backend
- Validates API keys
- Delivers items to players
- Supports: VIP status, coins, vehicles, weapons, bundles
- Maintains delivery logs
- Provides admin test commands

## 🚀 Deployment

**Current Status:** Running on Replit  
**URL:** Set `MTA_SHOP_URL` in MTA script to your Replit deployment URL

**Environment Variables Required:**
- `DATABASE_URL` - PostgreSQL connection (auto-generated)
- `SESSION_SECRET` - Session encryption key (auto-generated)
- `MTA_API_KEY` - Secret for MTA callbacks (set manually)

## 📝 Setup Instructions

1. **Database:** Already configured with PostgreSQL and Drizzle ORM
2. **Products:** Auto-seeded with 8 default products on first run
3. **Admin:** Update user `isAdmin` to 1 in database to grant admin access
4. **MTA Script:** Copy `mta_delivery_script.lua` to your MTA resource folder

## 🔄 API Workflows

### User Journey
1. Register account
2. Browse products
3. Add items to cart
4. Checkout (creates order)
5. View orders and status

### Admin Workflow
1. Login as admin
2. View all products and orders
3. Create/edit/delete products
4. Confirm customer pickups
5. Trigger MTA delivery

### MTA Delivery Flow
1. Admin confirms pickup in web UI
2. Backend triggers delivery check
3. MTA script receives HTTP request
4. Script validates and delivers item
5. Callback sent back to backend
6. Order marked as "delivered"

## 📁 Project Structure

```
├── client/
│   ├── src/
│   │   ├── pages/        # Route pages
│   │   ├── components/   # Reusable components
│   │   ├── lib/          # Auth, cart, theme contexts
│   │   ├── App.tsx       # Main app with routing
│   │   └── index.css     # Styling
│   └── index.html
├── server/
│   ├── routes.ts         # API endpoints
│   ├── storage.ts        # Database interface
│   ├── db.ts             # Drizzle ORM setup
│   └── index.ts          # Express setup
├── shared/
│   └── schema.ts         # Data models and types
├── mta_delivery_script.lua    # MTA integration script
└── package.json
```

## 🎨 Design System

**Colors:** Gaming-first aesthetic with primary blue (217° 91% 45%)  
**Typography:** Inter for body, Rajdhani for headings  
**Spacing:** Consistent rhythm using Tailwind spacing scale  
**Components:** Shadcn UI with custom gaming theme  

## 💳 Payment Integration Status

**PIX:**
- ✅ Fully implemented with QR Code (static EMV format)
- ✅ Manual confirmation flow working
- ✅ Ready for production

**Credit Card (Stripe):**
- ⏳ Available via Replit Stripe integration (user declined setup)
- 📝 Alternative: Can be configured manually by adding Stripe credentials as secrets
- 📋 Instructions: User can provide Stripe API keys to enable card payments

## ✨ Future Enhancements

- [ ] Stripe payment gateway integration (optional - can be setup manually)
- [ ] Email notifications for orders
- [ ] Admin analytics dashboard improvements
- [ ] Inventory management system
- [ ] Customer support system
- [ ] Product reviews/ratings
- [ ] Coupon/discount codes
- [ ] Auto-delivery retry mechanism
- [ ] Analytics graphs and reports

## 🐛 Known Issues

- None identified in MVP

## 📞 Support

Refer to:
- `MTA_SETUP_GUIDE.md` - MTA integration instructions
- `SETUP_REPLIT.md` - Replit deployment guide
- Backend logs in Replit console
- MTA delivery logs in `mta_delivery_log.txt`
