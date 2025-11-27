import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CreditCard, QrCode, ShoppingBag, CheckCircle, Loader2, Shield, Lock, Copy } from "lucide-react";
import { Link } from "wouter";
import { QRCodeSVG } from "qrcode.react";

const checkoutSchema = z.object({
  mtaUsername: z.string().min(1, "MTA username is required"),
  paymentMethod: z.enum(["pix", "card"], {
    required_error: "Please select a payment method",
  }),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);

  const pixKey = "f7d0554d-038f-4a1a-ac7b-799841ba9c03";
  const pixStaticQr = "00020126580014BR.GOV.BCB.PIX0136f7d0554d-038f-4a1a-ac7b-799841ba9c035204000053039865802BR5925Edrielton de Andrade Silv6009SAO PAULO62140510lrvBQ7aoMR6304086F";

  const copyPixKey = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      mtaUsername: "",
      paymentMethod: "pix",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      const orderData = {
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          productName: item.product.name,
          mtaItemType: item.product.mtaItemType,
          mtaItemData: item.product.mtaItemData,
        })),
        totalAmount: totalPrice.toFixed(2),
        paymentMethod: data.paymentMethod,
        mtaUsername: data.mtaUsername,
      };
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: (data) => {
      setOrderId(data.id);
      setOrderComplete(true);
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: t("common.success"),
        description: "Seu pedido foi recebido e está sendo processado.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao fazer pedido",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CheckoutFormData) => {
    if (!user) {
      toast({
        title: t("auth.login"),
        description: "Você precisa estar logado para fazer um pedido.",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }
    createOrderMutation.mutate(data);
  };

  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-16 sm:px-6">
        <Card className="mx-auto max-w-lg">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="mb-6 rounded-full bg-green-100 p-4 dark:bg-green-900/20">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="mb-2 font-heading text-2xl font-bold" data-testid="text-order-success">
              Pedido Confirmado!
            </h1>
            <p className="mb-6 text-muted-foreground">
              Seu pedido foi feito com sucesso. Você receberá seus itens após a confirmação do pagamento.
            </p>
            <div className="mb-6 w-full rounded-md bg-muted p-4">
              <p className="text-sm text-muted-foreground">{t("orders.order")} ID</p>
              <p className="font-mono text-lg font-semibold" data-testid="text-order-id">
                {orderId}
              </p>
            </div>
            <Badge className="mb-6" variant="secondary">
              Status: Aguardando Pagamento
            </Badge>
            <div className="flex flex-col gap-2 w-full">
              <Link href="/my-orders">
                <Button className="w-full" data-testid="button-view-orders">
                  {t("nav.myOrders")}
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="outline" className="w-full" data-testid="button-continue-shopping">
                  {t("cart.continue")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 sm:px-6">
        <Card className="mx-auto max-w-lg">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="mb-6 rounded-full bg-muted p-4">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="mb-2 text-xl font-semibold">{t("cart.empty")}</h1>
            <p className="mb-6 text-muted-foreground">
              Adicione alguns produtos ao seu carrinho antes de fazer checkout.
            </p>
            <Link href="/products">
              <Button data-testid="button-browse-products">{t("home.shopNow")}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold" data-testid="text-page-title">{t("checkout.title")}</h1>
        <p className="mt-2 text-muted-foreground">Conclua sua compra</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Conta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user ? (
                    <div className="rounded-md bg-muted p-4">
                      <p className="font-medium" data-testid="text-username">{user.serial}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  ) : (
                    <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
                      <p className="text-sm">
                        Por favor,{" "}
                        <Link href="/login" className="font-medium text-primary underline">
                          faça login
                        </Link>{" "}
                        para completar sua compra.
                      </p>
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="mtaUsername"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usuário MTA *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Seu nome de usuário no jogo"
                            {...field}
                            data-testid="input-mta-username"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("checkout.paymentMethod")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="space-y-3"
                          >
                            <div className="flex items-center space-x-3 rounded-md border p-4 hover-elevate" data-testid="radio-pix">
                              <RadioGroupItem value="pix" id="pix" />
                              <Label htmlFor="pix" className="flex flex-1 cursor-pointer items-center gap-3">
                                <QrCode className="h-5 w-5 text-primary" />
                                <div>
                                  <p className="font-medium">PIX</p>
                                  <p className="text-sm text-muted-foreground">
                                    Instant payment via PIX
                                  </p>
                                </div>
                              </Label>
                            </div>
                            <div className="flex items-center space-x-3 rounded-md border p-4 hover-elevate" data-testid="radio-card">
                              <RadioGroupItem value="card" id="card" />
                              <Label htmlFor="card" className="flex flex-1 cursor-pointer items-center gap-3">
                                <CreditCard className="h-5 w-5 text-primary" />
                                <div>
                                  <p className="font-medium">{t("checkout.card")}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Pague com Visa, Mastercard, etc.
                                  </p>
                                </div>
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("paymentMethod") === "pix" && (
                    <div className="rounded-md bg-blue-50 p-6 dark:bg-blue-950/20">
                      <p className="mb-4 font-medium text-blue-900 dark:text-blue-300">{t("checkout.pixInfo")}</p>
                      
                      <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row">
                        <div className="flex-shrink-0 rounded-lg bg-white p-3 dark:bg-slate-900">
                          <QRCodeSVG 
                            value={pixStaticQr} 
                            size={150} 
                            level="H"
                            includeMargin={true}
                            data-testid="qrcode-pix"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="mb-2 text-sm text-blue-800 dark:text-blue-400">{t("checkout.pixCopyInstructions")}</p>
                          <div className="flex flex-col gap-2">
                            <div className="rounded-md bg-white p-2 font-mono text-xs dark:bg-slate-900" data-testid="text-pix-key">
                              {pixKey}
                            </div>
                            <button
                              type="button"
                              onClick={copyPixKey}
                              className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-800"
                              data-testid="button-copy-pix"
                            >
                              <Copy className="h-4 w-4" />
                              {copiedPix ? "Copiado!" : "Copiar Chave"}
                            </button>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-blue-700 dark:text-blue-400">{t("checkout.pixPaymentInfo")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={createOrderMutation.isPending || !user}
                data-testid="button-place-order"
              >
                {createOrderMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    {t("checkout.placeOrder")} - R$ {totalPrice.toFixed(2)}
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  <span>{t("checkout.secure")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Lock className="h-4 w-4" />
                  <span>{t("checkout.encrypted")}</span>
                </div>
              </div>
            </form>
          </Form>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>{t("checkout.orderSummary")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-4"
                  data-testid={`checkout-item-${item.product.id}`}
                >
                  <div className="h-16 w-16 overflow-hidden rounded-md bg-muted">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                  <span>R$ {totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("cart.tax")}</span>
                  <span>R$ 0.00</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>{t("cart.total")}</span>
                  <span className="text-xl" data-testid="text-order-total">
                    R$ {totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
