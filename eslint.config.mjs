// `eslint-config-next` (desde v15+) ya exporta un flat config NATIVO (un
// array de objetos {name, files, plugins, rules, ...}), no un config legacy
// estilo `.eslintrc`. Pasarlo por `FlatCompat.extends()` (pensado para
// reinterpretar configs legacy) provocaba un
// `TypeError: Converting circular structure to JSON` al validar el shape,
// porque `eslint-plugin-react` ya se autoreferencia en su propio export flat
// (`configs.flat.recommended.plugins.react === plugin`), algo que el
// validador legacy de `@eslint/eslintrc` no maneja.
// Ver docs/audit/informe-auditoria-cajarus.md #5.1.
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    ignores: ["src/generated/**"],
  },
];

export default eslintConfig;
