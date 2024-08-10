import { defineConfig } from "vite"
import { viteSingleFile } from "vite-plugin-singlefile"
import path from 'path'

export default defineConfig({
	build: {
		minify: false,
	},
	terserOptions: { compress: false, mangle: false },
	plugins: [viteSingleFile()],
	resolve: {
		alias: {
			"@triplit/tuple-database": path.resolve(__dirname, "./tuple-database/build"),
		}
  }
})
