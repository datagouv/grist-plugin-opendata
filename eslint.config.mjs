// Flat config, replacing the `eslintConfig` block that used to live in package.json.
// Mapping from the old eslintrc config:
//   eslint:recommended          ->  js.configs.recommended
//   plugin:vue/vue3-essential  ->  pluginVue.configs['flat/essential']
//   @vue/typescript             ->  vueTsConfigs.recommended + withVueTs() wiring
//
// js.configs.recommended is listed explicitly because vueTsConfigs.recommended only
// *disables* the core rules TypeScript already covers (eslint-recommended); it never
// enables them. Without this, `no-empty`, `no-prototype-builtins`, `no-useless-escape`
// and friends go unenforced outside `src/**` (vue-tsc does not cover plain `.js`).
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import { withVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'

export default withVueTs(
  {
    name: 'project/ignores',
    ignores: ['**/dist/', '**/dist-vite/'],
  },
  js.configs.recommended,
  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  {
    name: 'project/rules',
    rules: {
      // This codebase types most Grist / data.gouv API payloads as `any`. The old
      // eslintrc never enabled this rule, so it stays off to keep the config
      // migration behaviour-neutral. Tightening it belongs in a dedicated typing
      // pass, not in a lint-config commit.
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
)
