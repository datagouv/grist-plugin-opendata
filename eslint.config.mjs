// Flat config, replacing the `eslintConfig` block that used to live in package.json.
// Mapping from the old eslintrc config:
//   plugin:vue/vue3-essential  ->  pluginVue.configs['flat/essential']
//   eslint:recommended          ->  subsumed by vueTsConfigs.recommended, which extends
//                                   eslintRecommended (eslint:recommended with the core
//                                   rules TypeScript already covers switched off)
//   @vue/typescript             ->  vueTsConfigs.recommended + withVueTs() wiring
import pluginVue from 'eslint-plugin-vue'
import { withVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'

export default withVueTs(
  {
    name: 'project/ignores',
    ignores: ['**/dist/', '**/dist-vite/'],
  },
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
