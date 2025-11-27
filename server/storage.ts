import { 
  users, products, orders, orderItems, cartItems, deliveryAttempts, supportTickets, playerData as playerDataTable,
  type User, type InsertUser, 
  type Product, type InsertProduct,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type CartItem, type InsertCartItem,
  type CartItemWithProduct,
  type OrderWithItems,
  type OrderWithUser,
  type DeliveryAttempt,
  type InsertDeliveryAttempt,
  type SupportTicket,
  type InsertSupportTicket,
  type SupportTicketWithUser,
  type AnalyticsData,
  type PlayerData,
  type InsertPlayerData,
  type PlayerDataWithUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sum, count } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserBySerial(serial: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<void>;
  
  getCartItems(userId: string): Promise<CartItemWithProduct[]>;
  addCartItem(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: string): Promise<void>;
  clearCart(userId: string): Promise<void>;
  
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrders(userId: string): Promise<OrderWithItems[]>;
  getAllOrders(): Promise<OrderWithUser[]>;
  getOrder(id: string): Promise<Order | undefined>;
  updateOrder(id: string, data: Partial<Order>): Promise<Order | undefined>;
  
  // Inventory management
  decrementStock(productId: string, quantity: number): Promise<boolean>;
  restoreStock(productId: string, quantity: number): Promise<void>;
  
  // Delivery attempts (retries)
  createDeliveryAttempt(attempt: InsertDeliveryAttempt): Promise<DeliveryAttempt>;
  getDeliveryAttempts(orderId: string): Promise<DeliveryAttempt[]>;
  updateDeliveryAttempt(id: string, data: Partial<DeliveryAttempt>): Promise<DeliveryAttempt | undefined>;
  
  // Support tickets
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  getSupportTickets(userId?: string): Promise<SupportTicketWithUser[]>;
  getSupportTicket(id: string): Promise<SupportTicket | undefined>;
  updateSupportTicket(id: string, data: Partial<SupportTicket>): Promise<SupportTicket | undefined>;
  
  // Analytics
  getAnalytics(): Promise<AnalyticsData>;

  // Player data (serial login)
  getPlayerBySerial(serial: string): Promise<PlayerDataWithUser | undefined>;
  getPlayerByUserId(userId: string): Promise<PlayerData | undefined>;
  createPlayerData(data: InsertPlayerData): Promise<PlayerData>;
  updatePlayerData(id: string, updates: Partial<InsertPlayerData>): Promise<PlayerData>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserBySerial(serial: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.serial, serial));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated || undefined;
  }

  async getProducts(): Promise<Product[]> {
    return db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return updated || undefined;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getCartItems(userId: string): Promise<CartItemWithProduct[]> {
    const items = await db.select().from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId));
    
    return items.map(item => ({
      ...item.cart_items,
      product: item.products
    }));
  }

  async addCartItem(item: InsertCartItem): Promise<CartItem> {
    const existing = await db.select().from(cartItems)
      .where(and(eq(cartItems.userId, item.userId), eq(cartItems.productId, item.productId)));
    
    if (existing.length > 0) {
      const [updated] = await db.update(cartItems)
        .set({ quantity: existing[0].quantity + (item.quantity || 1) })
        .where(eq(cartItems.id, existing[0].id))
        .returning();
      return updated;
    }
    
    const [newItem] = await db.insert(cartItems).values(item).returning();
    return newItem;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    const [updated] = await db.update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updated || undefined;
  }

  async removeCartItem(id: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  async createOrder(orderData: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const [order] = await db.insert(orders).values(orderData).returning();
    
    for (const item of items) {
      await db.insert(orderItems).values({
        ...item,
        orderId: order.id,
      });
    }
    
    return order;
  }

  async getOrders(userId: string): Promise<OrderWithItems[]> {
    const userOrders = await db.select().from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
    
    const result: OrderWithItems[] = [];
    
    for (const order of userOrders) {
      const items = await db.select().from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id));
      
      result.push({
        ...order,
        orderItems: items.map(i => ({
          ...i.order_items,
          product: i.products
        }))
      });
    }
    
    return result;
  }

  async getAllOrders(): Promise<OrderWithUser[]> {
    const allOrders = await db.select().from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt));
    
    const result: OrderWithUser[] = [];
    
    for (const row of allOrders) {
      const items = await db.select().from(orderItems)
        .where(eq(orderItems.orderId, row.orders.id));
      
      result.push({
        ...row.orders,
        user: {
          id: row.users.id,
          username: row.users.username,
          email: row.users.email,
          mtaUsername: row.users.mtaUsername,
        },
        orderItems: items
      });
    }
    
    return result;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<Order | undefined> {
    const [updated] = await db.update(orders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updated || undefined;
  }

  async decrementStock(productId: string, quantity: number): Promise<boolean> {
    const product = await this.getProduct(productId);
    if (!product) return false;
    
    // If stock is -1, it means unlimited
    if (product.stock === -1) return true;
    
    // Check if enough stock available
    if (product.stock < quantity) return false;
    
    // Decrement stock
    await this.updateProduct(productId, { stock: product.stock - quantity });
    return true;
  }

  async restoreStock(productId: string, quantity: number): Promise<void> {
    const product = await this.getProduct(productId);
    if (!product) return;
    if (product.stock === -1) return;
    
    await this.updateProduct(productId, { stock: product.stock + quantity });
  }

  async createDeliveryAttempt(attempt: InsertDeliveryAttempt): Promise<DeliveryAttempt> {
    const [newAttempt] = await db.insert(deliveryAttempts).values(attempt).returning();
    return newAttempt;
  }

  async getDeliveryAttempts(orderId: string): Promise<DeliveryAttempt[]> {
    return db.select().from(deliveryAttempts)
      .where(eq(deliveryAttempts.orderId, orderId))
      .orderBy(desc(deliveryAttempts.createdAt));
  }

  async updateDeliveryAttempt(id: string, data: Partial<DeliveryAttempt>): Promise<DeliveryAttempt | undefined> {
    const [updated] = await db.update(deliveryAttempts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(deliveryAttempts.id, id))
      .returning();
    return updated || undefined;
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const [newTicket] = await db.insert(supportTickets).values(ticket).returning();
    return newTicket;
  }

  async getSupportTickets(userId?: string): Promise<SupportTicketWithUser[]> {
    let query = db.select().from(supportTickets)
      .innerJoin(users, eq(supportTickets.userId, users.id));
    
    if (userId) {
      query = query.where(eq(supportTickets.userId, userId));
    }
    
    const tickets = await query.orderBy(desc(supportTickets.createdAt));
    return tickets.map(t => ({
      ...t.support_tickets,
      user: {
        id: t.users.id,
        username: t.users.username,
        email: t.users.email,
      }
    }));
  }

  async getSupportTicket(id: string): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, id));
    return ticket || undefined;
  }

  async updateSupportTicket(id: string, data: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const [updated] = await db.update(supportTickets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(supportTickets.id, id))
      .returning();
    return updated || undefined;
  }

  async getAnalytics(): Promise<AnalyticsData> {
    // Total revenue
    const revenueResult = await db.select({
      total: sum(orders.totalAmount)
    }).from(orders).where(eq(orders.status, "completed"));
    const totalRevenue = parseFloat(revenueResult[0]?.total || "0");

    // Total orders and customers
    const statsResult = await db.select({
      orderCount: count(orders.id),
      customerCount: count(orders.userId)
    }).from(orders);
    const totalOrders = statsResult[0]?.orderCount || 0;
    const totalCustomers = statsResult[0]?.customerCount || 0;

    // Top products (raw SQL for complex query)
    const topProductsResult = await db.execute(`
      SELECT 
        oi.product_id,
        oi.product_name,
        SUM(CAST(oi.price AS DECIMAL) * oi.quantity) as revenue,
        SUM(oi.quantity) as quantity
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'completed'
      GROUP BY oi.product_id, oi.product_name
      ORDER BY revenue DESC
      LIMIT 5
    `);
    
    const topProducts = topProductsResult.rows.map((row: any) => ({
      productId: row.product_id,
      productName: row.product_name,
      revenue: parseFloat(row.revenue || "0"),
      quantity: row.quantity || 0,
    }));

    // Recent orders
    const recentOrdersResult = await this.getAllOrders();
    const recentOrders = recentOrdersResult.slice(0, 10);

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      topProducts,
      recentOrders,
    };
  }

  async getPlayerBySerial(serial: string): Promise<PlayerDataWithUser | undefined> {
    const result = await db.query.playerData.findFirst({
      where: eq(playerDataTable.serial, serial),
      with: { user: true },
    });
    return result as PlayerDataWithUser | undefined;
  }

  async getPlayerByUserId(userId: string): Promise<PlayerData | undefined> {
    const result = await db.query.playerData.findFirst({
      where: eq(playerDataTable.userId, userId),
    });
    return result;
  }

  async createPlayerData(data: InsertPlayerData): Promise<PlayerData> {
    const [result] = await db.insert(playerDataTable).values(data).returning();
    return result;
  }

  async updatePlayerData(id: string, updates: Partial<InsertPlayerData>): Promise<PlayerData> {
    const [result] = await db
      .update(playerDataTable)
      .set(updates)
      .where(eq(playerDataTable.id, id))
      .returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
