import canvaPlugin from "@canva/app-eslint-plugin";

export default [
  {
    ignores: [
      "**/node_modules/",
      "**/dist",
      "**/*.d.ts",
      "**/*.d.tsx",
      "**/*.config.*",
    ],
  },
  ...canvaPlugin.configs.apps,
  {
    rules: {
      // Allow console.error and console.warn for debugging in production
      "no-console": ["error", { allow: ["warn", "error"] }],
      // Allow untranslated strings for English-only apps
      "formatjs/no-literal-string-in-jsx": "off",
    },
  },
];
