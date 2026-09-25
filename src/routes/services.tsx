import { createFileRoute, redirect } from "@tanstack/react-router";

/** Old URL — keep working for bookmarks and external links. */
export const Route = createFileRoute("/services")({
  beforeLoad: () => {
    throw redirect({ to: "/about/services" });
  },
});
