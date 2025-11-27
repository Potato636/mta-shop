import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { useLocation } from "wouter";
import { Separator } from "@/components/ui/separator";

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function CartSidebar({ open, onClose }: CartSidebarProps) {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();
  const [, setLocation] = useLocation();

  const handleCheckout = () => {
    onClose();
    setLocation("/checkout");
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-2xl">Shopping Cart</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4" data-testid="cart-empty-state">
            <div className="rounded-full bg-muted p-6">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-medium">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">Add some products to get started</p>
            </div>
            <Button onClick={() => { onClose(); setLocation("/products"); }} data-testid="button-browse-products">
              Browse Products
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-4 rounded-md border bg-card p-4"
                    data-testid={`cart-item-${item.product.id}`}
                  >
                    <div className="h-20 w-20 overflow-hidden rounded-md bg-muted">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium" data-testid={`text-product-name-${item.product.id}`}>
                            {item.product.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">{item.product.category}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeFromCart(item.product.id)}
                          data-testid={`button-remove-${item.product.id}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            data-testid={`button-decrease-${item.product.id}`}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium" data-testid={`text-quantity-${item.product.id}`}>
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            data-testid={`button-increase-${item.product.id}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="font-semibold" data-testid={`text-item-price-${item.product.id}`}>
                          ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span data-testid="text-subtotal">${totalPrice.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span data-testid="text-total">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                data-testid="button-checkout"
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
