import { createFileRoute, redirect } from "@tanstack/react-router";
import { Button } from "~/lib/components/ui/button";
import authClient from "~/lib/utils/auth-client";

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
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => {
              authClient.signIn.social({ provider: "discord" });
            }}
            type="button"
            variant="outline"
            size="lg"
          >
            Sign in with Discord
          </Button>
          <Button
            onClick={() => {
              authClient.signIn.social({ provider: "github" });
            }}
            type="button"
            variant="outline"
            size="lg"
          >
            Sign in with GitHub
          </Button>
          <Button
            onClick={() => {
              authClient.signIn.social({ provider: "google" });
            }}
            type="button"
            variant="outline"
            size="lg"
          >
            Sign in with Google
          </Button>
        </div>
      </div>
    </div>
  );
}
