import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, ShoppingCart } from "lucide-react";
import type { Product } from "@shared/schema";
import { useCart } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language";

const CATEGORIES = ["all", "vip", "currency", "items", "special"];

export default function Products() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { t } = useLanguage();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const filteredProducts = products
    ?.filter((p) => p.isActive === 1)
    .filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    )
    .filter((p) => category === "all" || p.category.toLowerCase() === category)
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price-low") return parseFloat(a.price) - parseFloat(b.price);
      if (sortBy === "price-high") return parseFloat(b.price) - parseFloat(a.price);
      return 0;
    });

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast({
      title: t("common.addedToCart"),
      description: `${product.name} ${t("common.hasBeenAdded")}`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold sm:text-4xl" data-testid="text-page-title">
          {t("products.title")}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t("home.subtitle")}
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("products.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[140px]" data-testid="select-category">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder={t("products.category")} />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat} data-testid={`option-category-${cat}`}>
                  {cat === "all" ? t("products.category") : t(`products.${cat}` as any)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[150px]" data-testid="select-sort">
              <SelectValue placeholder={t("products.sort")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name" data-testid="option-sort-name">{t("products.sort")} A-Z</SelectItem>
              <SelectItem value="price-low" data-testid="option-sort-price-low">{t("products.price")}: Menor</SelectItem>
              <SelectItem value="price-high" data-testid="option-sort-price-high">{t("products.price")}: Maior</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={category === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setCategory(cat)}
            data-testid={`button-filter-${cat}`}
          >
            {cat === "all" ? t("common.filter") : t(`products.${cat}` as any)}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square" />
              <CardContent className="p-4">
                <Skeleton className="mb-2 h-6 w-3/4" />
                <Skeleton className="mb-4 h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProducts && filteredProducts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <Card 
              key={product.id} 
              className="group overflow-hidden hover-elevate"
              data-testid={`card-product-${product.id}`}
            >
              <div className="aspect-square overflow-hidden bg-muted">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <CardContent className="p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight" data-testid={`text-product-name-${product.id}`}>
                    {product.name}
                  </h3>
                  <Badge variant="secondary" className="shrink-0">
                    {product.category}
                  </Badge>
                </div>
                <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                  {product.description}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-heading text-xl font-bold text-primary" data-testid={`text-product-price-${product.id}`}>
                    ${parseFloat(product.price).toFixed(2)}
                  </p>
                  <Button 
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    data-testid={`button-add-to-cart-${product.id}`}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {t("products.addToCart")}
                  </Button>
                </div>
                {product.stock !== -1 && product.stock <= 5 && product.stock > 0 && (
                  <p className="mt-2 text-xs text-destructive">Only {product.stock} left!</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-6">
            <Search className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-medium">{t("checkout.noProducts")}</h3>
          <p className="text-muted-foreground">
            Tente ajustar sua pesquisa ou critérios de filtro
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setSearch("");
              setCategory("all");
            }}
            data-testid="button-clear-filters"
          >
            {t("common.filter")}
          </Button>
        </div>
      )}
    </div>
  );
}
