import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Clock, CheckCircle, AlertCircle, XCircle, ShoppingBag, RefreshCw, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { OrderWithItems } from "@shared/schema";
import { format } from "date-fns";

const STATUS_CONFIG = {
  pending_payment: {
    label: "Pending Payment",
    icon: Clock,
    variant: "secondary" as const,
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
  },
  paid: {
    label: "Paid",
    icon: CheckCircle,
    variant: "default" as const,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
  },
  awaiting_pickup: {
    label: "Awaiting Pickup",
    icon: Package,
    variant: "secondary" as const,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    variant: "default" as const,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/20",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle,
    variant: "default" as const,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/20",
  },
  failed: {
    label: "Failed",
    icon: AlertCircle,
    variant: "destructive" as const,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/20",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    variant: "destructive" as const,
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-100 dark:bg-gray-900/20",
  },
};

export default function MyOrders() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const { data: orders, isLoading, refetch, isRefetching } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await apiRequest("POST", `/api/orders/${orderId}/cancel`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: t("orders.cancelled"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCancelOrder = (orderId: string, orderStatus: string) => {
    if (!["pending_payment", "paid", "awaiting_pickup"].includes(orderStatus)) {
      toast({
        title: "Error",
        description: "Cannot cancel order in this status",
        variant: "destructive",
      });
      return;
    }

    if (confirm(t("orders.cancelConfirm"))) {
      cancelOrderMutation.mutate(orderId);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 sm:px-6">
        <Card className="mx-auto max-w-lg">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="mb-6 rounded-full bg-muted p-4">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="mb-2 text-xl font-semibold">Please login</h1>
            <p className="mb-6 text-muted-foreground">
              You need to be logged in to view your orders.
            </p>
            <Link href="/login">
              <Button data-testid="button-login">Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold" data-testid="text-page-title">My Orders</h1>
          <p className="mt-2 text-muted-foreground">Track your purchases</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          disabled={isRefetching}
          data-testid="button-refresh"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-16 w-16 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending_payment;
            const StatusIcon = statusConfig.icon;

            return (
              <Card key={order.id} className="overflow-hidden" data-testid={`order-${order.id}`}>
                <CardHeader className="border-b bg-card pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Order ID</p>
                      <p className="font-mono text-sm font-medium" data-testid={`text-order-id-${order.id}`}>
                        {order.id}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Order Date</p>
                      <p className="text-sm font-medium">
                        {format(new Date(order.createdAt), "MMM dd, yyyy HH:mm")}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-4 flex flex-wrap items-center gap-4">
                    <div className={`flex items-center gap-2 rounded-full px-3 py-1 ${statusConfig.bgColor}`}>
                      <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                      <span className={`text-sm font-medium ${statusConfig.color}`} data-testid={`text-order-status-${order.id}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    {order.mtaDelivered === 1 && (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        MTA Delivered
                      </Badge>
                    )}
                    {order.paymentMethod && (
                      <Badge variant="outline">
                        {order.paymentMethod.toUpperCase()}
                      </Badge>
                    )}
                  </div>

                  {order.orderItems && order.orderItems.length > 0 && (
                    <div className="space-y-3">
                      {order.orderItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 rounded-md bg-muted/50 p-3"
                        >
                          <div className="h-12 w-12 overflow-hidden rounded-md bg-muted">
                            <div className="flex h-full items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                            </p>
                          </div>
                          <p className="font-medium">
                            ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between border-t pt-4">
                    <span className="font-medium">Total</span>
                    <span className="font-heading text-xl font-bold text-primary" data-testid={`text-order-total-${order.id}`}>
                      ${parseFloat(order.totalAmount).toFixed(2)}
                    </span>
                  </div>

                  {order.deliveryError && (
                    <div className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-3">
                      <p className="text-sm text-destructive">
                        <AlertCircle className="mr-2 inline h-4 w-4" />
                        {order.deliveryError}
                      </p>
                    </div>
                  )}

                  {["pending_payment", "paid", "awaiting_pickup"].includes(order.status) && (
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelOrder(order.id, order.status)}
                        disabled={cancelOrderMutation.isPending}
                        data-testid={`button-cancel-order-${order.id}`}
                      >
                        {cancelOrderMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          t("orders.cancel")
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center p-12 text-center">
            <div className="mb-6 rounded-full bg-muted p-6">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-medium">No orders yet</h3>
            <p className="mb-6 text-muted-foreground">
              Start shopping to see your orders here!
            </p>
            <Link href="/products">
              <Button data-testid="button-browse-products">Browse Products</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
