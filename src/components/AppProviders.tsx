import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { queryClient } from "@/lib/query-client";
import { WishlistProvider } from "@/lib/wishlist";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>{children}</CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
