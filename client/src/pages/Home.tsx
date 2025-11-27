import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Clock, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/language";
import { useAuth } from "@/lib/auth";
import type { Product } from "@shared/schema";
import { useCart } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@assets/generated_images/mta_gaming_hero_background.png";

export default function Home() {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const featuredProducts = products?.filter(p => p.isActive === 1).slice(0, 6) || [];

  const trustFeatures = [
    {
      icon: Shield,
      title: t("home.securePayments"),
      description: t("home.secureTransactions"),
    },
    {
      icon: Zap,
      title: t("home.instantDelivery"),
      description: t("home.mtaDelivery"),
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: t("home.supportHelp"),
    },
  ];

  return (
    <div className="flex flex-col">
      <section 
        className="relative flex min-h-[90vh] items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-background" />
        <div className="container relative z-10 mx-auto px-4 py-20 text-center sm:px-6">
          <Badge className="mb-6 bg-primary/20 text-primary-foreground backdrop-blur" data-testid="badge-featured">
            {t("hero.premium")}
          </Badge>
          <h1 className="mb-6 font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl" data-testid="text-hero-title">
            {t("hero.levelUp")}<br />
            <span className="text-primary">{t("hero.mtaExp")}</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-300 sm:text-xl" data-testid="text-hero-description">
            {t("hero.purchase")}<br />
            {t("hero.secureCheckout")}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/products">
              <Button size="lg" className="gap-2 font-semibold uppercase tracking-wide" data-testid="button-browse-products">
                {t("home.shopNow")}
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
            {/* "Get Started" button only shows for non-authenticated users */}
            {!user && (
              <Link href="/register">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="bg-white/10 font-semibold uppercase tracking-wide text-white backdrop-blur hover:bg-white/20"
                  data-testid="button-get-started"
                >
                  {t("home.getStarted")}
                </Button>
              </Link>
            )}
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            {[
              { value: "500+", label: t("home.ordersDelivered") },
              { value: "24/7", label: t("home.instantDelivery") },
              { value: "100%", label: t("home.securePayments") },
            ].map((stat) => (
              <Card 
                key={stat.label}
                className="border-white/10 bg-white/5 backdrop-blur"
              >
                <CardContent className="p-4 text-center">
                  <p className="font-heading text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-heading text-3xl font-bold sm:text-4xl" data-testid="text-featured-title">
              {t("home.featured")}
            </h2>
            <p className="text-muted-foreground">
              {t("home.checkPopular")}
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-square" />
                  <CardContent className="p-4">
                    <Skeleton className="mb-2 h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className="group overflow-hidden hover-elevate"
                  data-testid={`card-product-${product.id}`}
                >
                  <div className="overflow-hidden bg-muted">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold" data-testid={`text-product-name-${product.id}`}>
                      {product.name}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span 
                        className="font-heading text-xl font-bold text-primary"
                        data-testid={`text-price-${product.id}`}
                      >
                        R$ {parseFloat(product.price).toFixed(2)}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => {
                          addToCart(product);
                          toast({
                            title: t("common.addedToCart"),
                            description: `${product.name} ${t("common.hasBeenAdded")}`,
                          });
                        }}
                        data-testid={`button-add-cart-${product.id}`}
                      >
                        {t("products.addToCart")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t("checkout.noProducts")}</p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-muted/50 py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-heading text-3xl font-bold sm:text-4xl">
              {t("home.whyChooseUs")}
            </h2>
            <p className="text-muted-foreground">
              {t("home.subtitle")}
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {trustFeatures.map((feature, idx) => (
              <div key={idx} className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-primary/10 p-3">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
