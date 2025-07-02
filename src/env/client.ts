import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_BASE_URL: z.string().url().default("http://localhost:3000"),
  },
  runtimeEnv: import.meta.env,
});
