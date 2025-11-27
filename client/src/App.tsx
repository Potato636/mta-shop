import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { ThemeProvider } from "@/lib/theme";
import { LanguageProvider } from "@/lib/language";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import Checkout from "@/pages/Checkout";
import MyOrders from "@/pages/MyOrders";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AdminLogin from "@/pages/AdminLogin";
import Admin from "@/pages/Admin";
import SupportTickets from "@/pages/SupportTickets";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/my-orders" component={MyOrders} />
      <Route path="/profile" component={Profile} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={Admin} />
      <Route path="/support" component={SupportTickets} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <main className="flex-1">
        <Router />
      </main>
      <Footer />
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <TooltipProvider>
                <Toaster />
                <AppContent />
              </TooltipProvider>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
