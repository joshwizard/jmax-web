import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
export default defineConfig({
  server: {
    port: 8080,
    host: true,
    strictPort: true,
  },
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({
      server: { entry: "server" },
    }),
    nitro(),
    viteReact(),
  ],
});
