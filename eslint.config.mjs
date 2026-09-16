import { defineConfig } from "eslint/config";
import next from "eslint-config-next";

/**
 * `next lint` was removed in Next 16, so ESLint is wired up directly here.
 * Run it with `npm run lint`.
 */
export default defineConfig([
  ...next,
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
]);
