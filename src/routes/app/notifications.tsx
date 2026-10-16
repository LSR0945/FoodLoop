import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { markRead, useNotifications } from "@/lib/db";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({
    meta: [
      { title: "Alerts — AnnSetu" },
      { name: "description", content: "Updates on your donations, reservations and pickups." },
      { property: "og:title", content: "Alerts — AnnSetu" },
      { property: "og:description", content: "Updates on your donations, reservations and pickups." },
    ],
  }),
  component: Notifications,
});

function Notifications() {
  const { user } = useAuth();
  const { data, loading } = useNotifications(user?.uid);
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-3xl font-bold">Alerts</h1>
      {loading ? <p className="text-muted-foreground">Loading…</p> : data.length === 0 ? (
        <p className="rounded-2xl bg-card p-8 text-center text-muted-foreground shadow-card">No alerts yet.</p>
      ) : data.map((n) => {
        const body = (
          <div className={`rounded-2xl p-4 shadow-card ${n.read ? "bg-card" : "border-l-4 border-saffron bg-card"}`}>
            <p className="font-semibold">{n.title}</p>
            <p className="text-sm text-muted-foreground">{n.body}</p>
            <p className="mt-1 text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</p>
          </div>
        );
        return n.listingId ? (
          <Link key={n.id} to="/app/listing/$id" params={{ id: n.listingId }} onClick={() => !n.read && markRead(n.id)} className="block">{body}</Link>
        ) : <div key={n.id} onClick={() => !n.read && markRead(n.id)}>{body}</div>;
      })}
    </div>
  );
}
