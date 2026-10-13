import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import reactHooks from "eslint-plugin-react-hooks";

const eslintConfig = [...nextCoreWebVitals, ...nextTypescript, {
  plugins: {
    "react-hooks": reactHooks,
  },
  rules: {
    // TypeScript — keep explicit-any off (API routes need it)
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/ban-ts-comment": "warn",
    "@typescript-eslint/prefer-as-const": "error",

    // React — re-enabled hooks rules via explicit plugin
    "react-hooks/exhaustive-deps": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/purity": "off",
    "react/no-unescaped-entities": "off",
    "react/display-name": "off",
    "react/prop-types": "off",
    "react-compiler/react-compiler": "off",
    // eslint-plugin-react-hooks 7 ships React Compiler readiness checks as
    // errors. This site does not run the React Compiler, and these flagged
    // long-standing, working patterns (reading storage in a mount effect,
    // the motion shim's refs), which turned `bun run lint` red with no code
    // change. Kept visible as warnings so they can be cleaned up deliberately.
    "react-hooks/set-state-in-effect": "warn",
    "react-hooks/refs": "warn",
    "react-hooks/immutability": "warn",
    "react-hooks/preserve-manual-memoization": "warn",

    // Next.js
    "@next/next/no-img-element": "off",
    "@next/next/no-html-link-for-pages": "off",

    // JavaScript — safety rules
    "prefer-const": "error",
    "no-unused-vars": "off",
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-debugger": "error",
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
  ignores: ["node_modules/**", ".next/**", ".next-built/**", "out/**", "build/**", "next-env.d.ts", "skills/**", "supabase/**", "*.js", "*.cjs", "!*.config.*"]
}];

export default eslintConfig;
