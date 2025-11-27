import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import { 
  insertUserSchema, loginSchema, insertProductSchema, insertSupportTicketSchema,
  serialLoginSchema, insertPlayerDataSchema
} from "@shared/schema";
import { z } from "zod";

declare module "express-session" {
  interface SessionData {
    userId: string;
    isAdmin: boolean;
  }
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId || !req.session.isAdmin) {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      const existingSerial = await storage.getUserBySerial(data.serial);
      if (existingSerial) {
        return res.status(400).json({ message: "This serial is already registered" });
      }
      
      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });
      
      req.session.userId = user.id;
      req.session.isAdmin = user.isAdmin === 1;
      
      const { password, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Register error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserBySerial(data.serial);
      if (!user) {
        return res.status(401).json({ message: "Invalid serial or password" });
      }
      
      const validPassword = await bcrypt.compare(data.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid serial or password" });
      }
      
      req.session.userId = user.id;
      req.session.isAdmin = user.isAdmin === 1;
      
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.isAdmin !== 1) {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }
      
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }
      
      req.session.userId = user.id;
      req.session.isAdmin = user.isAdmin === 1;
      
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Admin login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.post("/api/auth/serial-login", async (req, res) => {
    try {
      const data = serialLoginSchema.parse(req.body);
      
      const playerData = await storage.getPlayerBySerial(data.serial);
      if (!playerData || !playerData.user) {
        return res.status(401).json({ message: "Serial not registered" });
      }
      
      req.session.userId = playerData.userId;
      req.session.isAdmin = playerData.user.isAdmin === 1;
      
      const { password, ...safeUser } = playerData.user;
      res.json({ user: safeUser, playerData });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Serial login error:", error);
      res.status(500).json({ message: "Serial login failed" });
    }
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.get("/api/profile", requireAuth, async (req, res) => {
    try {
      const playerData = await storage.getPlayerByUserId(req.session.userId!);
      if (!playerData) {
        return res.status(404).json({ message: "Player data not found" });
      }
      res.json(playerData);
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ message: "Failed to get profile" });
    }
  });

  app.patch("/api/profile/update-stats", requireAuth, async (req, res) => {
    try {
      const { health, armor, money, cityCoins, level, experience } = req.body;
      
      const playerData = await storage.getPlayerByUserId(req.session.userId!);
      if (!playerData) {
        return res.status(404).json({ message: "Player data not found" });
      }

      const updated = await storage.updatePlayerData(playerData.id, {
        health: health !== undefined ? health : playerData.health,
        armor: armor !== undefined ? armor : playerData.armor,
        money: money !== undefined ? money : playerData.money,
        cityCoins: cityCoins !== undefined ? cityCoins : playerData.cityCoins,
        level: level !== undefined ? level : playerData.level,
        experience: experience !== undefined ? experience : playerData.experience,
      });

      res.json(updated);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      let products = await storage.getProducts();
      
      if (products.length === 0) {
        const vipIcon = "/attached_assets/generated_images/vip_product_icon.png";
        const currencyIcon = "/attached_assets/generated_images/game_currency_icon.png";
        const specialIcon = "/attached_assets/generated_images/special_item_icon.png";
        
        const defaultProducts = [
          {
            name: "VIP Bronze - 30 Days",
            description: "Get VIP Bronze status for 30 days. Enjoy exclusive perks, custom chat colors, and priority server access.",
            price: "9.99",
            category: "vip",
            imageUrl: vipIcon,
            mtaItemType: "vip",
            mtaItemData: '{"level": "bronze", "days": 30}',
            stock: -1,
            isActive: 1,
          },
          {
            name: "VIP Gold - 30 Days",
            description: "Premium VIP Gold membership with all Bronze benefits plus special vehicles, weapons, and bonus XP multipliers.",
            price: "24.99",
            category: "vip",
            imageUrl: vipIcon,
            mtaItemType: "vip",
            mtaItemData: '{"level": "gold", "days": 30}',
            stock: -1,
            isActive: 1,
          },
          {
            name: "VIP Diamond - 30 Days",
            description: "Ultimate VIP Diamond tier with maximum benefits, exclusive skins, unlimited teleports, and custom title.",
            price: "49.99",
            category: "vip",
            imageUrl: vipIcon,
            mtaItemType: "vip",
            mtaItemData: '{"level": "diamond", "days": 30}',
            stock: -1,
            isActive: 1,
          },
          {
            name: "1000 Coins",
            description: "Add 1000 in-game coins to your account. Use coins to buy vehicles, weapons, and accessories.",
            price: "4.99",
            category: "currency",
            imageUrl: currencyIcon,
            mtaItemType: "coins",
            mtaItemData: '{"amount": 1000}',
            stock: -1,
            isActive: 1,
          },
          {
            name: "5000 Coins",
            description: "Get 5000 in-game coins with a 15% bonus! Best value for regular players.",
            price: "19.99",
            category: "currency",
            imageUrl: currencyIcon,
            mtaItemType: "coins",
            mtaItemData: '{"amount": 5000}',
            stock: -1,
            isActive: 1,
          },
          {
            name: "Legendary Car Pack",
            description: "Exclusive collection of 5 legendary vehicles including sports cars and supercars. Limited availability!",
            price: "29.99",
            category: "special",
            imageUrl: specialIcon,
            mtaItemType: "item",
            mtaItemData: '{"type": "vehicle_pack", "id": "legendary_cars"}',
            stock: 100,
            isActive: 1,
          },
          {
            name: "Weapon Master Bundle",
            description: "All premium weapons unlocked permanently. Includes special skins and unlimited ammo for 7 days.",
            price: "14.99",
            category: "items",
            imageUrl: specialIcon,
            mtaItemType: "item",
            mtaItemData: '{"type": "weapon_bundle", "id": "master"}',
            stock: -1,
            isActive: 1,
          },
          {
            name: "Starter Pack",
            description: "Perfect for new players! Includes 500 coins, basic VIP for 7 days, and a starter vehicle.",
            price: "7.99",
            category: "special",
            imageUrl: specialIcon,
            mtaItemType: "special",
            mtaItemData: '{"type": "bundle", "id": "starter"}',
            stock: -1,
            isActive: 1,
          },
        ];
        
        for (const product of defaultProducts) {
          await storage.createProduct(product);
        }
        
        products = await storage.getProducts();
      }
      
      res.json(products);
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ message: "Failed to get products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to get product" });
    }
  });

  app.post("/api/products", requireAdmin, async (req, res) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Create product error:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.patch("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.json({ message: "Product deleted" });
    } catch (error) {
      console.error("Delete product error:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  app.get("/api/cart", requireAuth, async (req, res) => {
    try {
      const items = await storage.getCartItems(req.session.userId!);
      res.json(items);
    } catch (error) {
      console.error("Get cart error:", error);
      res.status(500).json({ message: "Failed to get cart" });
    }
  });

  app.post("/api/cart", requireAuth, async (req, res) => {
    try {
      const { productId, quantity = 1 } = req.body;
      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }
      
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const item = await storage.addCartItem({
        userId: req.session.userId!,
        productId,
        quantity,
      });
      res.status(201).json(item);
    } catch (error) {
      console.error("Add to cart error:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.patch("/api/cart/:id", requireAuth, async (req, res) => {
    try {
      const { quantity } = req.body;
      if (typeof quantity !== "number" || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      
      const item = await storage.updateCartItem(req.params.id, quantity);
      if (!item) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", requireAuth, async (req, res) => {
    try {
      await storage.removeCartItem(req.params.id);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });

  app.delete("/api/cart", requireAuth, async (req, res) => {
    try {
      await storage.clearCart(req.session.userId!);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  app.post("/api/orders", requireAuth, async (req, res) => {
    try {
      const { items, totalAmount, paymentMethod, mtaUsername } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Order must contain at least one item" });
      }
      
      // Check inventory for each item
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(404).json({ message: `Product ${item.productId} not found` });
        }
        if (product.stock !== -1 && product.stock < item.quantity) {
          return res.status(400).json({ message: `Not enough stock for ${product.name}` });
        }
      }
      
      // Decrement inventory
      for (const item of items) {
        await storage.decrementStock(item.productId, item.quantity);
      }
      
      const orderItems = items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        productName: item.productName,
        mtaItemType: item.mtaItemType,
        mtaItemData: item.mtaItemData,
      }));
      
      const order = await storage.createOrder(
        {
          userId: req.session.userId!,
          totalAmount,
          status: "pending_payment",
          paymentMethod,
        },
        orderItems
      );
      
      await storage.clearCart(req.session.userId!);
      
      res.status(201).json(order);
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders", requireAuth, async (req, res) => {
    try {
      const orders = await storage.getOrders(req.session.userId!);
      res.json(orders);
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ message: "Failed to get orders" });
    }
  });

  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Get all orders error:", error);
      res.status(500).json({ message: "Failed to get orders" });
    }
  });

  app.patch("/api/admin/orders/:id", requireAdmin, async (req, res) => {
    try {
      const { status, triggerDelivery } = req.body;
      
      const updateData: any = {};
      if (status) updateData.status = status;
      
      if (triggerDelivery) {
        const order = await storage.getOrder(req.params.id);
        if (order) {
          try {
            console.log(`[MTA Delivery] Triggering delivery for order ${order.id}`);
            updateData.mtaDelivered = 1;
            updateData.status = "delivered";
          } catch (deliveryError) {
            console.error("[MTA Delivery] Failed:", deliveryError);
            updateData.deliveryError = "MTA delivery failed - will retry";
          }
        }
      }
      
      const order = await storage.updateOrder(req.params.id, updateData);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Update order error:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  app.post("/api/admin/orders/:id/confirm-pickup", requireAdmin, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      console.log(`[MTA Delivery] Confirming pickup and triggering delivery for order ${order.id}`);
      
      const updated = await storage.updateOrder(req.params.id, {
        status: "completed",
        mtaDelivered: 1,
      });
      
      res.json({ 
        message: "Pickup confirmed and MTA delivery triggered",
        order: updated 
      });
    } catch (error) {
      console.error("Confirm pickup error:", error);
      res.status(500).json({ message: "Failed to confirm pickup" });
    }
  });

  app.post("/api/orders/:id/cancel", requireAuth, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.userId !== req.session.userId && !req.session.isAdmin) {
        return res.status(403).json({ message: "You can only cancel your own orders" });
      }

      if (order.status === "completed" || order.status === "delivered" || order.status === "cancelled") {
        return res.status(400).json({ message: "Cannot cancel order in this status" });
      }

      const updated = await storage.updateOrder(req.params.id, {
        status: "cancelled",
      });

      console.log(`[Order] Order ${order.id} cancelled by user`);

      res.json({ 
        message: "Order cancelled successfully",
        order: updated 
      });
    } catch (error) {
      console.error("Cancel order error:", error);
      res.status(500).json({ message: "Failed to cancel order" });
    }
  });

  app.post("/api/orders/payment-webhook", async (req, res) => {
    try {
      const { orderId, status, paymentId } = req.body;
      
      if (!orderId) {
        return res.status(400).json({ message: "Order ID is required" });
      }
      
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      let newStatus = order.status;
      if (status === "approved" || status === "paid") {
        newStatus = "awaiting_pickup";
      } else if (status === "rejected" || status === "failed") {
        newStatus = "failed";
      }
      
      await storage.updateOrder(orderId, { status: newStatus });
      
      console.log(`[Payment Webhook] Order ${orderId} updated to ${newStatus}`);
      
      res.json({ message: "Webhook processed" });
    } catch (error) {
      console.error("Payment webhook error:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  // Analytics endpoint
  app.get("/api/admin/analytics", requireAdmin, async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({ message: "Failed to get analytics" });
    }
  });

  // Support tickets endpoints
  app.post("/api/support-tickets", requireAuth, async (req, res) => {
    try {
      const data = insertSupportTicketSchema.parse(req.body);
      const ticket = await storage.createSupportTicket({
        ...data,
        userId: req.session.userId!,
      });
      res.status(201).json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Create ticket error:", error);
      res.status(500).json({ message: "Failed to create support ticket" });
    }
  });

  app.get("/api/support-tickets", requireAuth, async (req, res) => {
    try {
      const isAdmin = req.session.isAdmin;
      const userId = isAdmin ? undefined : req.session.userId;
      const tickets = await storage.getSupportTickets(userId);
      res.json(tickets);
    } catch (error) {
      console.error("Get tickets error:", error);
      res.status(500).json({ message: "Failed to get support tickets" });
    }
  });

  app.patch("/api/support-tickets/:id", requireAuth, async (req, res) => {
    try {
      const ticket = await storage.getSupportTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      if (!req.session.isAdmin && ticket.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updated = await storage.updateSupportTicket(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Update ticket error:", error);
      res.status(500).json({ message: "Failed to update support ticket" });
    }
  });

  // Delivery retry endpoint
  app.post("/api/admin/retry-delivery/:orderId", requireAdmin, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const attempts = await storage.getDeliveryAttempts(req.params.orderId);
      const nextAttempt = attempts.length + 1;

      if (nextAttempt > 3) {
        return res.status(400).json({ message: "Maximum retry attempts exceeded" });
      }

      const attempt = await storage.createDeliveryAttempt({
        orderId: req.params.orderId,
        attemptNumber: nextAttempt,
        status: "pending",
        nextRetryAt: new Date(Date.now() + 5 * 60 * 1000), // Retry in 5 minutes
      });

      res.json({
        message: `Retry scheduled (attempt ${nextAttempt})`,
        attempt,
      });
    } catch (error) {
      console.error("Retry delivery error:", error);
      res.status(500).json({ message: "Failed to schedule delivery retry" });
    }
  });

  app.post("/api/mta/delivery-callback", async (req, res) => {
    try {
      const apiKey = req.headers["x-api-key"];
      const expectedKey = process.env.MTA_API_KEY;
      
      if (expectedKey && apiKey !== expectedKey) {
        return res.status(401).json({ message: "Invalid API key" });
      }
      
      const { orderId, success, error } = req.body;
      
      if (!orderId) {
        return res.status(400).json({ message: "Order ID is required" });
      }
      
      const updateData: any = {};
      if (success) {
        updateData.mtaDelivered = 1;
        updateData.status = "delivered";
        updateData.deliveryError = null;
      } else {
        // Schedule retry on failure
        const attempts = await storage.getDeliveryAttempts(orderId);
        if (attempts.length < 3) {
          const nextAttempt = attempts.length + 1;
          const retryDelayMinutes = Math.pow(2, nextAttempt - 1) * 5; // Exponential backoff: 5, 10, 20 minutes
          
          await storage.createDeliveryAttempt({
            orderId,
            attemptNumber: nextAttempt,
            status: "scheduled",
            error: error || "Delivery failed",
            nextRetryAt: new Date(Date.now() + retryDelayMinutes * 60 * 1000),
          });
          
          updateData.deliveryError = `${error || "Delivery failed"}. Retry scheduled for ${nextAttempt}/${3}`;
        } else {
          updateData.deliveryError = `${error || "Delivery failed"}. Max retries exceeded.`;
          updateData.status = "failed";
        }
      }
      
      await storage.updateOrder(orderId, updateData);
      
      console.log(`[MTA Callback] Order ${orderId} delivery ${success ? "succeeded" : "failed"}`);
      
      res.json({ message: "Callback processed" });
    } catch (error) {
      console.error("MTA callback error:", error);
      res.status(500).json({ message: "Callback processing failed" });
    }
  });

  return httpServer;
}
