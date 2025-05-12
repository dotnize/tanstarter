export const Route = createFileRoute({
  component: DashboardIndex,
});

function DashboardIndex() {
  return (
    <div className="flex flex-col items-center gap-1">
      Dashboard index page
      <pre className="bg-card text-card-foreground rounded-md border p-1">
        routes/dashboard/index.tsx
      </pre>
    </div>
  );
}
