import cloudflareAdapter from '@sveltejs/adapter-cloudflare';
import nodeAdapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { playwright } from '@vitest/browser-playwright';
import devtoolsJson from 'vite-plugin-devtools-json';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		devtoolsJson(),
		tailwindcss(),
		sveltekit({
			preprocess: [vitePreprocess()],
			adapter:
				process.env.ENVIRONMENT === 'ci'
					? nodeAdapter()
					: cloudflareAdapter({
							routes: { include: ['/*'], exclude: ['<all>'] },
							platformProxy: {
								configPath: 'wrangler.jsonc',
								environment: process.env.ENVIRONMENT,
								persist: false
							}
						}),
			...(process.env.NODE_ENV === 'development'
				? {}
				: {
						csp: {
							directives: { 'script-src': ['self'], 'frame-src': ['none'] }
						}
					}),
			env: { dir: '.' }
		})
	],
	server: {
		port: 3000
	},
	preview: {
		port: 3000
	},
	test: {
		includeTaskLocation: true,
		expect: { requireAssertions: true },
		projects: [
			{
				extends: true,
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium' }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./vitest-setup-client.ts']
				}
			},
			{
				extends: true,
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
