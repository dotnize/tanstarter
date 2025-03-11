import {
  ErrorComponent,
  type ErrorComponentProps,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
} from "@tanstack/react-router";
import { Button } from "./ui/button";

export function DefaultCatchBoundary({ error }: Readonly<ErrorComponentProps>) {
  const router = useRouter();
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  });

  console.error(error);

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 p-4">
      <ErrorComponent error={error} />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={() => {
            router.invalidate();
          }}
        >
          Try Again
        </Button>
        {isRoot ? (
          <Button asChild variant="secondary">
            <Link to="/">Home</Link>
          </Button>
        ) : (
          <Button asChild variant="secondary">
            <Link
              to="/"
              onClick={(e) => {
                e.preventDefault();
                window.history.back();
              }}
            >
              Go Back
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
