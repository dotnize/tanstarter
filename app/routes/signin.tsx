import { createFileRoute, redirect } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";

export const Route = createFileRoute("/signin")({
  component: AuthPage,
  beforeLoad: async ({ context }) => {
    if (context.user) {
      throw redirect({
        to: "/dashboard",
      });
    }
  },
});

function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-8 rounded-xl border bg-card p-10">
        Logo here
        <form method="GET" className="flex flex-col gap-2">
          <Button
            formAction="/api/auth/discord"
            type="submit"
            variant="outline"
            size="lg"
          >
            Sign in with Discord
          </Button>
          <Button formAction="/api/auth/github" type="submit" variant="outline" size="lg">
            Sign in with GitHub
          </Button>
          <Button formAction="/api/auth/google" type="submit" variant="outline" size="lg">
            Sign in with Google
          </Button>
        </form>
      </div>
    </div>
  );
}
