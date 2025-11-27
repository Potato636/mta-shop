import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Loader2,
  ShoppingBag,
  DollarSign,
  Users,
  TrendingUp,
  Truck,
  AlertCircle,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, OrderWithUser } from "@shared/schema";
import { format } from "date-fns";
import { Link } from "wouter";
import vipIcon from "@assets/generated_images/vip_product_icon.png";
import currencyIcon from "@assets/generated_images/game_currency_icon.png";
import specialIcon from "@assets/generated_images/special_item_icon.png";
import Analytics from "./Analytics";
import SupportTickets from "./SupportTickets";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().min(1, "Image URL is required"),
  mtaItemType: z.string().min(1, "MTA item type is required"),
  mtaItemData: z.string().min(1, "MTA item data is required"),
  stock: z.number().int().min(-1),
  isActive: z.number().int().min(0).max(1),
});

type ProductFormData = z.infer<typeof productSchema>;

const STATUS_OPTIONS = [
  { value: "pending_payment", label: "Pending Payment" },
  { value: "paid", label: "Paid" },
  { value: "awaiting_pickup", label: "Awaiting Pickup" },
  { value: "completed", label: "Completed" },
  { value: "delivered", label: "Delivered" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

const PRESET_IMAGES = [
  { label: "VIP Icon", value: vipIcon },
  { label: "Currency Icon", value: currencyIcon },
  { label: "Special Item Icon", value: specialIcon },
];

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: orders, isLoading: ordersLoading } = useQuery<OrderWithUser[]>({
    queryKey: ["/api/admin/orders"],
    enabled: isAdmin,
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      category: "vip",
      imageUrl: vipIcon,
      mtaItemType: "vip",
      mtaItemData: "{}",
      stock: -1,
      isActive: 1,
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const response = await apiRequest("POST", "/api/products", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Product created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setProductDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create product", description: error.message, variant: "destructive" });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductFormData }) => {
      const response = await apiRequest("PATCH", `/api/products/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Product updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setProductDialogOpen(false);
      setEditingProduct(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update product", description: error.message, variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Product deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete product", description: error.message, variant: "destructive" });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, status, triggerDelivery }: { id: string; status: string; triggerDelivery?: boolean }) => {
      const response = await apiRequest("PATCH", `/api/admin/orders/${id}`, { status, triggerDelivery });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Order updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update order", description: error.message, variant: "destructive" });
    },
  });

  const confirmPickupMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await apiRequest("POST", `/api/admin/orders/${orderId}/confirm-pickup`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Pickup confirmed!", description: "MTA delivery has been triggered." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to confirm pickup", description: error.message, variant: "destructive" });
    },
  });

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      mtaItemType: product.mtaItemType,
      mtaItemData: product.mtaItemData,
      stock: product.stock,
      isActive: product.isActive,
    });
    setProductDialogOpen(true);
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    form.reset({
      name: "",
      description: "",
      price: "",
      category: "vip",
      imageUrl: vipIcon,
      mtaItemType: "vip",
      mtaItemData: "{}",
      stock: -1,
      isActive: 1,
    });
    setProductDialogOpen(true);
  };

  const onSubmitProduct = (data: ProductFormData) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 sm:px-6">
        <Card className="mx-auto max-w-lg">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="mb-6 rounded-full bg-destructive/10 p-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <h1 className="mb-2 text-xl font-semibold">Access Denied</h1>
            <p className="mb-6 text-muted-foreground">
              You need admin privileges to access this page.
            </p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingOrders = orders?.filter((o) => o.status === "awaiting_pickup") || [];
  const totalRevenue = orders?.filter((o) => ["paid", "completed", "delivered"].includes(o.status))
    .reduce((sum, o) => sum + parseFloat(o.totalAmount), 0) || 0;

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold" data-testid="text-page-title">Admin Panel</h1>
        <p className="mt-2 text-muted-foreground">Manage your MTA shop</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-primary/10 p-3">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold" data-testid="stat-products">
                {products?.length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold" data-testid="stat-revenue">
                ${totalRevenue.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold" data-testid="stat-orders">
                {orders?.length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900/20">
              <Truck className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Pickup</p>
              <p className="text-2xl font-bold" data-testid="stat-pending">
                {pendingOrders.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="products" data-testid="tab-products">
            <Package className="mr-2 h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="orders" data-testid="tab-orders">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="pickup" data-testid="tab-pickup">
            <Truck className="mr-2 h-4 w-4" />
            Pickup
            {pendingOrders.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingOrders.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="support" data-testid="tab-support">
            <MessageSquare className="mr-2 h-4 w-4" />
            Support
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Products</h2>
            <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleNewProduct} data-testid="button-add-product">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitProduct)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-product-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} data-testid="input-product-description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price ($)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="9.99" data-testid="input-product-price" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-product-category">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="vip">VIP</SelectItem>
                                <SelectItem value="currency">Currency</SelectItem>
                                <SelectItem value="items">Items</SelectItem>
                                <SelectItem value="special">Special</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-product-image">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PRESET_IMAGES.map((img) => (
                                <SelectItem key={img.label} value={img.value}>
                                  {img.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="mtaItemType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>MTA Item Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="vip">VIP Package</SelectItem>
                                <SelectItem value="coins">Coins</SelectItem>
                                <SelectItem value="item">Item</SelectItem>
                                <SelectItem value="special">Special</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="stock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock (-1 = unlimited)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="mtaItemData"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>MTA Item Data (JSON)</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder='{"days": 30, "level": 1}' />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            onValueChange={(v) => field.onChange(parseInt(v))}
                            defaultValue={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">Active</SelectItem>
                              <SelectItem value="0">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createProductMutation.isPending || updateProductMutation.isPending}
                      data-testid="button-save-product"
                    >
                      {(createProductMutation.isPending || updateProductMutation.isPending) ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {editingProduct ? "Update Product" : "Create Product"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {productsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} data-testid={`product-row-${product.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.category}</Badge>
                      </TableCell>
                      <TableCell>${parseFloat(product.price).toFixed(2)}</TableCell>
                      <TableCell>{product.stock === -1 ? "Unlimited" : product.stock}</TableCell>
                      <TableCell>
                        <Badge variant={product.isActive === 1 ? "default" : "secondary"}>
                          {product.isActive === 1 ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditProduct(product)}
                            data-testid={`button-edit-${product.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteProductMutation.mutate(product.id)}
                            data-testid={`button-delete-${product.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center p-12 text-center">
                <Package className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No products yet. Create your first product!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <h2 className="text-xl font-semibold">All Orders</h2>
          {ordersLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : orders && orders.length > 0 ? (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>MTA Delivered</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} data-testid={`order-row-${order.id}`}>
                      <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.user?.username}</p>
                          <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>${parseFloat(order.totalAmount).toFixed(2)}</TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(status) => updateOrderMutation.mutate({ id: order.id, status })}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.mtaDelivered === 1 ? "default" : "secondary"}>
                          {order.mtaDelivered === 1 ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(order.createdAt), "MMM dd, HH:mm")}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateOrderMutation.mutate({ id: order.id, status: order.status, triggerDelivery: true })}
                          disabled={order.mtaDelivered === 1}
                        >
                          Trigger MTA
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center p-12 text-center">
                <Package className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No orders yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pickup" className="space-y-4">
          <h2 className="text-xl font-semibold">Pending Pickups</h2>
          <p className="text-muted-foreground">
            Confirm when customers pick up their products to trigger MTA delivery.
          </p>

          {ordersLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : pendingOrders.length > 0 ? (
            <div className="grid gap-4">
              {pendingOrders.map((order) => (
                <Card key={order.id} data-testid={`pickup-order-${order.id}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Order ID</p>
                        <p className="font-mono font-medium">{order.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Customer</p>
                        <p className="font-medium">{order.user?.username}</p>
                        <p className="text-sm text-muted-foreground">{order.user?.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">MTA Username</p>
                        <p className="font-medium">{order.user?.mtaUsername || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="font-heading text-xl font-bold text-primary">
                          ${parseFloat(order.totalAmount).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="text-sm">{format(new Date(order.createdAt), "MMM dd, yyyy HH:mm")}</p>
                      </div>
                    </div>

                    {order.orderItems && order.orderItems.length > 0 && (
                      <div className="mt-4 rounded-md bg-muted/50 p-4">
                        <p className="mb-2 text-sm font-medium">Items:</p>
                        <ul className="space-y-1 text-sm">
                          {order.orderItems.map((item) => (
                            <li key={item.id}>
                              {item.quantity}x {item.productName} - ${parseFloat(item.price).toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-4 flex justify-end">
                      <Button
                        onClick={() => confirmPickupMutation.mutate(order.id)}
                        disabled={confirmPickupMutation.isPending}
                        data-testid={`button-confirm-pickup-${order.id}`}
                      >
                        {confirmPickupMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="mr-2 h-4 w-4" />
                        )}
                        Confirm Pickup & Deliver
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center p-12 text-center">
                <CheckCircle className="mb-4 h-12 w-12 text-green-600" />
                <p className="font-medium">All caught up!</p>
                <p className="text-muted-foreground">No pending pickups at the moment.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Analytics />
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <SupportTickets />
        </TabsContent>
      </Tabs>
    </div>
  );
}
