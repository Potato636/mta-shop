import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DollarSign, ShoppingBag, Users, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import type { AnalyticsData } from "@shared/schema";

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

export default function Analytics() {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return <div>No analytics data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card data-testid="card-total-revenue">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-revenue">
              ${analytics.totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-total-orders">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <ShoppingBag className="h-4 w-4" />
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-orders">
              {analytics.totalOrders}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-total-customers">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4" />
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-customers">
              {analytics.totalCustomers}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-avg-order">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              Average Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-order">
              ${analytics.totalOrders > 0 ? (analytics.totalRevenue / analytics.totalOrders).toFixed(2) : "0.00"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Products */}
        <Card data-testid="card-top-products">
          <CardHeader>
            <CardTitle>Top Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="productName" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Bar dataKey="revenue" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No sales data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card data-testid="card-product-distribution">
          <CardHeader>
            <CardTitle>Product Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.topProducts}
                    dataKey="quantity"
                    nameKey="productName"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ productName, quantity }) => `${productName}: ${quantity}`}
                  >
                    {analytics.topProducts.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No sales data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card data-testid="card-recent-orders">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recentOrders.length > 0 ? (
              analytics.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div>
                    <p className="font-medium" data-testid={`text-order-${order.id}`}>
                      Order #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-muted-foreground">{order.user.username}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium" data-testid={`text-amount-${order.id}`}>
                      ${order.totalAmount}
                    </p>
                    <p className="text-sm text-muted-foreground" data-testid={`text-status-${order.id}`}>
                      {order.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No orders yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
