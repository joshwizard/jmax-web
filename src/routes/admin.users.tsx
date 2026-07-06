import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, ShieldPlus, ShieldOff, UserPlus } from "lucide-react";
import { listAdmins, promoteAdminByEmail, revokeAdmin } from "@/lib/admin-users.functions";

export const Route = createFileRoute("/admin/users")({
  component: UsersAdmin,
});

type Admin = { user_id: string; email: string | null; created_at: string };

function UsersAdmin() {
  const list = useServerFn(listAdmins);
  const promote = useServerFn(promoteAdminByEmail);
  const revoke = useServerFn(revokeAdmin);
  const [admins, setAdmins] = useState<Admin[] | null>(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const res = await list({});
      setAdmins(res.admins);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    }
  };
  useEffect(() => { load(); }, []);

  const onPromote = async () => {
    if (!email.trim()) return;
    setBusy(true);
    try {
      await promote({ data: { email: email.trim() } });
      toast.success(`${email} is now an admin`);
      setEmail("");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally { setBusy(false); }
  };

  const onRevoke = async (user_id: string, who: string) => {
    if (!confirm(`Revoke admin from ${who}?`)) return;
    try {
      await revoke({ data: { user_id } });
      toast.success("Admin revoked");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold">
          <UserPlus className="h-4 w-4" /> Promote a user to admin
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          The user must sign up first with this email. Promotion is immediate.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            className="flex-1 rounded-md border border-input bg-background px-3 py-2.5 text-sm"
          />
          <button
            onClick={onPromote}
            disabled={busy || !email.trim()}
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-ink px-4 py-2.5 text-xs font-bold text-ink-foreground hover:opacity-90 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldPlus className="h-3.5 w-3.5" />}
            Make admin
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-display text-lg font-bold">Current admins</h2>
          <span className="text-xs text-muted-foreground">{admins?.length ?? "—"} total</span>
        </div>
        {admins === null ? (
          <p className="p-6 text-sm text-muted-foreground">Loading…</p>
        ) : admins.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No admins yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Granted</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.user_id} className="border-t border-border">
                  <td className="p-3 font-medium">{a.email ?? <span className="font-mono text-xs text-muted-foreground">{a.user_id}</span>}</td>
                  <td className="p-3 text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onRevoke(a.user_id, a.email ?? a.user_id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-destructive hover:underline"
                    >
                      <ShieldOff className="h-3.5 w-3.5" /> Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
