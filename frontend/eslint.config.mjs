import js from "@eslint/js";

export default [
  {
    ignores: ["node_modules/**", "dist/**", "src/lib/db.js"],
  },
  js.configs.recommended,
];
