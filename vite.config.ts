import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// base: "./" keeps asset + data URLs relative, so the app works whether it is
// served from the domain root or a GitHub Pages project subpath (/repo/).
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
});
