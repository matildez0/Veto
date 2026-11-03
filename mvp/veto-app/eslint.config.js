import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        // Adiciona aqui variáveis globais personalizadas se o teu projeto usar (ex: window, etc.)
      },
    },
    rules: {
      // Podes colocar aqui as regras específicas do teu projeto ou manter as recomendadas
      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },
];
