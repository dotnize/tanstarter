import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
});

export default function DashboardIndex() {
  return (
    <div className="flex flex-col gap-1">
      Dashboard index page
      <pre className="rounded-md border bg-slate-50 p-1">routes/dashboard/index.tsx</pre>
    </div>
  );
}
