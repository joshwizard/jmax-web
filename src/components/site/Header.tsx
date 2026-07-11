import { Link } from "@tanstack/react-router";
import { ShoppingCart, Menu, X, Heart, Calculator, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useAuth } from "@/lib/auth";
import { useIsAdmin } from "@/lib/roles";
import { toast } from "sonner";

const nav = [
  { to: "/marketplace", label: "Marketplace" },
  { to: "/services", label: "Services" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/consult", label: "Book" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
          <img
            src="/jmax.png"
            alt="Jmax Builders"
            className="h-9 w-9 object-contain"
          />
          <span>
            Jmax<span className="text-primary">.</span>Builders
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{ className: "rounded-md px-3 py-2 text-sm font-semibold text-foreground bg-accent" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/calculator"
            className="hidden h-10 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs font-semibold transition-colors hover:bg-accent md:inline-flex"
            aria-label="Cost calculator"
          >
            <Calculator className="h-3.5 w-3.5" /> Calculator
          </Link>
          <Link
            to="/account/wishlist"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card transition-colors hover:bg-accent"
            aria-label="Wishlist"
          >
            <Heart className="h-4 w-4" />
            {wishCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                {wishCount}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card transition-colors hover:bg-accent"
            aria-label="Cart"
          >
            <ShoppingCart className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-3 text-xs font-semibold hover:bg-accent"
                aria-label="Account menu"
              >
                <User className="h-3.5 w-3.5" />
                <span className="max-w-[100px] truncate">{user.email?.split("@")[0]}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-12 z-50 w-48 rounded-md border border-border bg-card p-1 shadow-lg">
                  <Link to="/account" onClick={() => setMenuOpen(false)} className="block rounded px-3 py-2 text-sm hover:bg-accent">My account</Link>
                  <Link to="/account/library" onClick={() => setMenuOpen(false)} className="block rounded px-3 py-2 text-sm hover:bg-accent">Library</Link>
                  <Link to="/account/wishlist" onClick={() => setMenuOpen(false)} className="block rounded px-3 py-2 text-sm hover:bg-accent">Wishlist</Link>
                  <button
                    onClick={async () => { setMenuOpen(false); await signOut(); toast.success("Signed out"); }}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-destructive hover:bg-accent"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/auth"
              className="hidden h-10 items-center gap-1.5 rounded-md bg-ink px-3 text-xs font-semibold text-ink-foreground hover:opacity-90 md:inline-flex"
            >
              <User className="h-3.5 w-3.5" /> Sign in
            </Link>
          )}
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container-page flex flex-col py-2">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-medium text-foreground hover:bg-accent"
              >
                {n.label}
              </Link>
            ))}
            <div className="my-2 border-t border-border" />
            {user ? (
              <>
                <Link to="/account" onClick={() => setOpen(false)} className="rounded-md px-3 py-3 text-sm font-medium hover:bg-accent">My account</Link>
                <button
                  onClick={async () => { setOpen(false); await signOut(); toast.success("Signed out"); }}
                  className="rounded-md px-3 py-3 text-left text-sm font-medium text-destructive hover:bg-accent"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="rounded-md px-3 py-3 text-sm font-semibold text-primary hover:bg-accent">Sign in / Create account</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
