import { Link } from "wouter";
import { Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { label: "Browse Products", href: "/products" },
      { label: "VIP Packages", href: "/products?category=vip" },
      { label: "Game Currency", href: "/products?category=currency" },
    ],
    Support: [
      { label: "Help Center", href: "#" },
      { label: "Contact Us", href: "#" },
      { label: "Order Status", href: "/my-orders" },
    ],
    Legal: [
      { label: "Terms of Service", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Refund Policy", href: "#" },
    ],
  };

  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
                <span className="font-heading text-xl font-bold text-primary-foreground">M</span>
              </div>
              <span className="font-heading text-xl font-bold">MTA SHOP</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Premium gaming products for your MTA server. Secure checkout and instant delivery.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-4 font-semibold">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}>
                      <span className="text-sm text-muted-foreground hover:text-foreground">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © {currentYear} MTA Shop. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="mailto:support@mtashop.com"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Mail className="h-4 w-4" />
                support@mtashop.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
