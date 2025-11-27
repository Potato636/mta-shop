import { Link, useLocation } from "wouter";
import { ShoppingCart, User, LogOut, LayoutDashboard, Moon, Sun, Menu, X, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { useTheme } from "@/lib/theme";
import { useLanguage } from "@/lib/language";
import { useState } from "react";

export function Navbar({ onCartOpen }: { onCartOpen: () => void }) {
  const [location] = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/products", label: t("nav.products") },
    ...(user ? [{ href: "/my-orders", label: t("nav.myOrders") }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2" data-testid="link-home">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
              <span className="font-heading text-xl font-bold text-primary-foreground">M</span>
            </div>
            <span className="hidden font-heading text-xl font-bold sm:inline-block">
              MTA SHOP
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={location === link.href ? "default" : "ghost"}
                  size="sm"
                  data-testid={`link-${link.label.toLowerCase().replace(" ", "-")}`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  data-testid="button-language-select"
                  title={t("common.language")}
                >
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onSelect={() => {
                    setLanguage("pt");
                  }}
                  className={language === "pt" ? "bg-accent" : ""}
                  data-testid="select-language-pt"
                >
                  {t("common.portuguese")}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onSelect={() => {
                    setLanguage("en");
                  }}
                  className={language === "en" ? "bg-accent" : ""}
                  data-testid="select-language-en"
                >
                  {t("common.english")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={onCartOpen}
              data-testid="button-cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-xs"
                  data-testid="badge-cart-count"
                >
                  {totalItems}
                </Badge>
              )}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-user-menu">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-medium" data-testid="text-username">
                      {user.serial}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <Link href="/my-orders">
                    <DropdownMenuItem data-testid="link-my-orders">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      {t("nav.myOrders")}
                    </DropdownMenuItem>
                  </Link>
                  {isAdmin && (
                    <Link href="/admin">
                      <DropdownMenuItem data-testid="link-admin">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        {t("nav.admin")}
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} data-testid="button-logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button size="sm" data-testid="button-login">
                  {t("auth.login")}
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="border-t py-4 md:hidden">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={location === link.href ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
