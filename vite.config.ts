import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { mkdir, copyFile } from "node:fs/promises";
import { join } from "node:path";

export default defineConfig({
	optimizeDeps: { exclude: ["pyodide"] },
	plugins: [sveltekit(),
	{
		name: "vite-plugin-pyodide",
		generateBundle: async () => {
			const assetsDir = "dist/assets";
			await mkdir(assetsDir, { recursive: true });
			const files = [
				"pyodide-lock.json",
				"pyodide.asm.js",
				"pyodide.asm.wasm",
				"python_stdlib.zip",
			];
			for (const file of files) {
				await copyFile(
					join("node_modules/pyodide", file),
					join(assetsDir, file),
				);
			}
		},
	},
	],

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
