import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
});

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: parsed.data.email, source: "footer" });
    setBusy(false);
    if (error) {
      if (error.code === "23505") {
        toast.success("You're already subscribed", { description: "Thanks for sticking with us." });
        setEmail("");
        return;
      }
      toast.error("Could not subscribe", { description: error.message });
      return;
    }
    toast.success("Subscribed", { description: "We'll send occasional plan releases & tips." });
    setEmail("");
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="min-w-0 flex-1 rounded-md border border-ink-foreground/15 bg-ink-foreground/5 px-3 py-2 text-sm text-ink-foreground placeholder:text-ink-foreground/40 outline-none focus:border-primary"
      />
      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        <Send className="h-3.5 w-3.5" /> Join
      </button>
    </form>
  );
}
