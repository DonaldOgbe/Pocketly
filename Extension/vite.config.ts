import { readFileSync } from "node:fs";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import webExtension from "vite-plugin-web-extension";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const apiBaseUrl = env.VITE_API_BASE_URL ?? "http://localhost:3000";

  return {
    plugins: [
      react(),
      tailwindcss(),
      webExtension({
        // host_permissions has to match wherever the API actually lives, so it
        // is derived from the same value the client fetches against.
        manifest: () => ({
          ...JSON.parse(readFileSync("src/manifest.json", "utf8")),
          host_permissions: [`${new URL(apiBaseUrl).origin}/*`],
        }),
        browser: "chrome",
      }),
    ],
  };
});
