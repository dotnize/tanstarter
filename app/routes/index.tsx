import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	const router = useRouter();

	return <div className="px-6 py-4 m-2 rounded-lg bg-blue-300 text-lg">Hello world</div>;
}
