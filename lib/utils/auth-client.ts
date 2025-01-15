import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BASE_URL,
});

export default authClient;
