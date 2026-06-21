import { fileURLToPath } from "url";
import path from "path";

// Resolve the Tailwind config by absolute path so it works even when the dev
// server is launched from a different working directory.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: { config: path.join(__dirname, "tailwind.config.ts") },
    autoprefixer: {},
  },
};

export default config;
