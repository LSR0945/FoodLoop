import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/app/listing/$id")({
  component: AppListingRedirect,
});

function AppListingRedirect() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/donations/$id", params: { id }, replace: true });
  }, [id, navigate]);

  return (
    <div className="grid min-h-[50vh] place-items-center">
      <p className="animate-pulse text-sm text-muted-foreground">Loading FoodLoop donation details…</p>
    </div>
  );
}
