const esbuild = require('esbuild')
// import * as esbuild from 'esbuild'
// import * as glob from 'glob'
// import GlobSync  from 'glob'

// const g = new GlobSync('./src/**/*.ts', { cwd: './' })
// console.log("g=" + JSON.stringify(g,null,2))
// const files = g.found

// // console.log('files=' + JSON.stringify(files,null,2))
// console.log('building ' + files.length + ' files from ./src/**/*.ts')

// esbuild.build({
// 	entryPoints: [
// 		'./src/**/*.ts'
// 	],
// 	// bundle: false,
// 	platform: 'node',
// 	outdir: 'out',
// 	sourcemap: true,
// 	format: 'cjs',
// 	// target: "es2019",
// 	// external: ['vscode']
// 	// strict: true
// })

// esbuild.build({
// 	entryPoints: [
// 		'./extension.ts'
// 	],
// 	bundle: true,
// 	minify: true,
// 	outdir: 'dist',
// 	sourcemap: true,
// 	format: 'cjs',
// 	external: [ 'vscode' ]

// })

console.log("build complete!")


/*

import BuildOptions from 'esbuild'

export default {
	entryPoints: [ './src/index.ts' ],

	bundle: true,
	platform: 'node',
	outfile: 'build/main.js',
	sourcemap: true,
}
{
	"entry": "./index.js",
	"outfile": "./bundle.js",
	"external": ["react", "react-dom"],
	"loader": { ".js": "jsx", ".png": "base64" },
	"minify": true
}

*/
