import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import pluginImport from 'eslint-plugin-import';
import tailwind from 'eslint-plugin-tailwindcss'; // v4 support via @beta

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  // Tailwind's beta flat config supports Tailwind CSS v4.
  tailwind.configs.recommended,

  // Your project-specific rules
  {
    settings: {
      tailwindcss: {
        cssConfigPath: 'app/globals.css',
      },
    },
    plugins: {
      import: pluginImport,
      tailwindcss: tailwind,
    },
    rules: {
      // Import ordering (groups + alpha + newlines)
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
          ],
          pathGroups: [
            { pattern: 'react', group: 'external', position: 'before' },
          ],
          pathGroupsExcludedImportTypes: ['react'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // Prettier's Tailwind plugin owns class sorting. Custom classes are
      // required by third-party components such as TinyMCE.
      'tailwindcss/classnames-order': 'off',
      'tailwindcss/no-custom-classname': 'off',

      // Existing shadcn components initialize external state in effects.
      // Keep this visible without blocking the baseline lint command.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },

  // Keep your ignores
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);
