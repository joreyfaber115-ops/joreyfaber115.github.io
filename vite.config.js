import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// joreyfaber115.github.io is a user-pages site served from the domain root,
// so the base path is "/".
export default defineConfig({
  base: "/",
  plugins: [react()],
});
