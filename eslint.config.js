import { fileURLToPath } from 'node:url';

import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import { loadConfig } from '@sveltejs/load-config';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import svelte from 'eslint-plugin-svelte';
import unusedImports from 'eslint-plugin-unused-imports';
import yml from 'eslint-plugin-yml';
import globals from 'globals';
import ts from 'typescript-eslint';
import * as yamlParser from 'yaml-eslint-parser';

const loadedConfig = await loadConfig('./', { traverse: false });
if (loadedConfig && 'error' in loadedConfig) throw loadedConfig.error;
const svelteConfig = loadedConfig?.config;
const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		plugins: {
			'simple-import-sort': simpleImportSort,
			'unused-imports': unusedImports
		},
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		},
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off',
			'simple-import-sort/imports': 'error',
			'simple-import-sort/exports': 'error',
			'unused-imports/no-unused-imports': 'error',
			'unused-imports/no-unused-vars': [
				'warn',
				{
					vars: 'all',
					varsIgnorePattern: '^_',
					args: 'after-used',
					argsIgnorePattern: '^_'
				}
			]
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		}
	},
	{
		files: ['**/*.yml', '**/*.yaml'],
		languageOptions: {
			parser: yamlParser,
			parserOptions: {
				yamlVersion: '1.2'
			}
		},
		plugins: {
			yml: yml
		},
		rules: {
			'yml/indent': ['error', 2],
			'yml/quotes': ['error', { prefer: 'single' }],
			'yml/sort-keys': ['error', 'asc'],
			'yml/no-empty-document': 'error',
			'yml/no-empty-key': 'error',
			'yml/no-empty-mapping-value': 'error',
			'yml/no-empty-sequence-entry': 'error',
			'yml/no-irregular-whitespace': 'error',
			'yml/no-tab-indent': 'error',
			'yml/plain-scalar': 'error'
		}
	}
);
