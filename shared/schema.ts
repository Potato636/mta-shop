import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serial: text("serial").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  isAdmin: integer("is_admin").notNull().default(0),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  mtaItemType: text("mta_item_type").notNull(),
  mtaItemData: text("mta_item_data").notNull(),
  stock: integer("stock").notNull().default(-1),
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending_payment"),
  paymentMethod: text("payment_method"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  mtaDelivered: integer("mta_delivered").notNull().default(0),
  deliveryError: text("delivery_error"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  productName: text("product_name").notNull(),
  mtaItemType: text("mta_item_type").notNull(),
  mtaItemData: text("mta_item_data").notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const deliveryAttempts = pgTable("delivery_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  attemptNumber: integer("attempt_number").notNull().default(1),
  status: text("status").notNull().default("pending"),
  error: text("error"),
  nextRetryAt: timestamp("next_retry_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const supportTickets = pgTable("support_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  orderId: varchar("order_id").references(() => orders.id),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("open"),
  priority: text("priority").notNull().default("medium"),
  adminResponse: text("admin_response"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const playerData = pgTable("player_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  serial: text("serial").notNull().unique(),
  mtaName: text("mta_name").notNull(),
  health: decimal("health", { precision: 5, scale: 2 }).notNull().default("100"),
  armor: decimal("armor", { precision: 5, scale: 2 }).notNull().default("0"),
  money: decimal("money", { precision: 15, scale: 2 }).notNull().default("0"),
  cityCoins: decimal("city_coins", { precision: 15, scale: 2 }).notNull().default("0"),
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  cartItems: many(cartItems),
  tickets: many(supportTickets),
}));

export const productsRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
  cartItems: many(cartItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
  deliveryAttempts: many(deliveryAttempts),
  ticket: one(supportTickets),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const deliveryAttemptsRelations = relations(deliveryAttempts, ({ one }) => ({
  order: one(orders, {
    fields: [deliveryAttempts.orderId],
    references: [orders.id],
  }),
}));

export const supportTicketsRelations = relations(supportTickets, ({ one }) => ({
  user: one(users, {
    fields: [supportTickets.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [supportTickets.orderId],
    references: [orders.id],
  }),
}));

export const playerDataRelations = relations(playerData, ({ one }) => ({
  user: one(users, {
    fields: [playerData.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  serial: true,
  password: true,
  email: true,
  phone: true,
}).extend({
  email: z.string().email("Invalid email address"),
  serial: z.string().min(1, "Serial is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(1, "Phone number is required"),
});

export const loginSchema = z.object({
  serial: z.string().min(1, "Serial is required"),
  password: z.string().min(1, "Password is required"),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
}).extend({
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  stock: z.number().int().min(-1, "Stock must be -1 (unlimited) or positive"),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});

export const insertDeliveryAttemptSchema = createInsertSchema(deliveryAttempts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const serialLoginSchema = z.object({
  serial: z.string().min(1, "Serial is required"),
});

export const insertPlayerDataSchema = createInsertSchema(playerData).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

// Select types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type DeliveryAttempt = typeof deliveryAttempts.$inferSelect;
export type InsertDeliveryAttempt = z.infer<typeof insertDeliveryAttemptSchema>;

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;

export type PlayerData = typeof playerData.$inferSelect;
export type InsertPlayerData = z.infer<typeof insertPlayerDataSchema>;
export type SerialLoginRequest = z.infer<typeof serialLoginSchema>;

// Extended types with relations
export type CartItemWithProduct = CartItem & {
  product: Product;
};

export type OrderWithItems = Order & {
  orderItems: (OrderItem & { product: Product })[];
};

export type OrderWithUser = Order & {
  user: Pick<User, "id" | "serial" | "email" | "phone">;
  orderItems: OrderItem[];
};

export type SupportTicketWithUser = SupportTicket & {
  user: Pick<User, "id" | "serial" | "email">;
};

export type PlayerDataWithUser = PlayerData & {
  user: Pick<User, "id" | "serial" | "email" | "phone">;
};

export type AnalyticsData = {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    revenue: number;
    quantity: number;
  }>;
  recentOrders: OrderWithUser[];
};
