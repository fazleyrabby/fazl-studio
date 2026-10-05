import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { siteUrl } from "./scripts/site-url.mjs";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  define: {
    "import.meta.env.VITE_SITE_URL": JSON.stringify(siteUrl()),
  },
  resolve: {
    tsconfigPaths: true,
  },
});
