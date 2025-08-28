// eslint.config.mjs
import next from "eslint-config-next";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  ...next,
  // You can add project-wide overrides here
  {
    rules: {
      // ✅ turn off the rule that’s blocking your build
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
