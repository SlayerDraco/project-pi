import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        Float32Array: 'readonly',
        Infinity: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      // react-three-fiber renders Three.js objects as custom JSX elements
      // (mesh, geometry, material props like `intensity`/`args`/`position`)
      // that eslint-plugin-react's DOM-attribute allowlist doesn't know
      // about — this rule produces wall-to-wall false positives for any
      // R3F codebase and is disabled for that reason, not because
      // unknown-prop bugs don't matter.
      'react/no-unknown-property': 'off',
      // This app is intentionally prose-heavy (exhibit descriptions use
      // natural apostrophes/quotes); escaping every one hurts readability
      // in source for no real benefit here.
      'react/no-unescaped-entities': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
];
