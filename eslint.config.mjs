import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [...nextCoreWebVitals, ...nextTypescript, {
  rules: {
    // TypeScript — keep explicit-any off (API routes need it), but catch real issues
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/ban-ts-comment": "warn",
    "@typescript-eslint/prefer-as-const": "error",

    // React — keep exhaustive-deps on for safety
    "react-hooks/exhaustive-deps": "warn",
    "react-hooks/purity": "off",
    "react/no-unescaped-entities": "off",
    "react/display-name": "off",
    "react/prop-types": "off",
    "react-compiler/react-compiler": "off",

    // Next.js
    "@next/next/no-img-element": "off",
    "@next/next/no-html-link-for-pages": "off",

    // JavaScript — re-enable safety rules
    "prefer-const": "error",
    "no-unused-vars": "off",        // handled by @typescript-eslint/no-unused-vars
    "no-console": "warn",
    "no-debugger": "warn",
    "no-empty": "warn",
    "no-irregular-whitespace": "off",
    "no-case-declarations": "off",
    "no-fallthrough": "off",
    "no-mixed-spaces-and-tabs": "error",
    "no-redeclare": "off",
    "no-undef": "off",
    "no-unreachable": "error",
    "no-useless-escape": "off",
  },
}, {
  ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts", "skills/**"]
}];

export default eslintConfig;
