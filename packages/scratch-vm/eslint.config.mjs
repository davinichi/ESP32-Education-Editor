import {eslintConfigScratch} from 'eslint-config-scratch';
import {globalIgnores} from 'eslint/config';
import globals from 'globals';
import {fixupPluginRules} from '@eslint/compat';
import formatMessage from 'eslint-plugin-format-message';

export default eslintConfigScratch.defineConfig(
    eslintConfigScratch.legacy.base,
    {
        files: ['src/**/*.{,c,m}js'],
        extends: [eslintConfigScratch.legacy.es6],
        plugins: {
            'format-message': fixupPluginRules(formatMessage)
        },
        settings: {
            'format-message': {
                sourceLocale: 'en',
                generateId: 'literal'
            }
        },
        languageOptions: {
            globals: globals.browser
        },
        rules: {
            ...formatMessage.configs.default.rules,
            'no-unused-vars': 'warn'
        }
    },
    {
        files: ['src/extension-support/extension-worker.js'],
        languageOptions: {
            globals: globals.worker
        }
    },
    {
        files: [
            '*.{,c,m}js', // for example, webpack.config.js
            'test/**/*.{,c,m}js'
        ],
        extends: [eslintConfigScratch.legacy.node],
        languageOptions: {
            globals: globals.node
        },
        rules: {
            'no-undefined': 'warn'
        }
    },
    globalIgnores([
        'benchmark/**/*',
        'coverage/**/*',
        'dist/**/*',
        'node_modules/**/*',
        'playground/**/*',
        'tap-snapshots/**/*'
    ])
);
