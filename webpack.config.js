'use strict'
const path = require('path')
const { sourceMapsEnabled } = require('process')

/** @type {import('webpack').Configuration} */
const config = {
	target: 'node', // TODO: recommended: 'webworker'
	// node: false,
	mode: 'development',
	infrastructureLogging: {
		colors: false,
		appendOnly: true,
		level: 'log'
	},
	devtool: 'source-map', // https://code.visualstudio.com/docs/nodejs/nodejs-debugging#_tool-configuration
	// devtool: 'inline-source-map', // https://code.visualstudio.com/docs/nodejs/nodejs-debugging#_tool-configuration
	// devtool: 'inline-cheap-module-source-map',
	entry: {
		'extension': './src/extension.ts',
		// 'extension-insiders': './src/extension-insiders.ts',
	},
	output: {
		clean: true,
		path: path.resolve(__dirname, 'dist'),
		filename: 'extension.js',
		libraryTarget: 'commonjs2',
		// libraryTarget: 'commonjs',
		// devtoolNamespace: '',
		devtoolModuleFilenameTemplate: '../[resource-path]',
		// devtoolModuleFilenameTemplate: 'src/[resource-path]',    // "ablunit-test-runner/dist/src/extension.ts"
		// devtoolModuleFilenameTemplate: '[resource-path]',        // "ablunit-test-runner/dist/extension.ts"
		// devtoolModuleFilenameTemplate: '[absolute-resource-path]',
	},
	externals: {
		// the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed -> https://webpack.js.org/configuration/externals/
		vscode: 'commonjs vscode',
	},
	resolve: {
		mainFields: ['browser', 'module', 'main'],
		extensions: ['.ts', '.js'],
		// modules: ['src', 'node_modules'],
		modules: [ '.', 'src', 'node_modules' ],
		// alias: {
		// 	'*': path.resolve(__dirname, 'src')
		// }
	},
	module: {
		rules: [{
			test: /\.ts$/,
			exclude: /node_modules/,
			use: [{
				loader: 'ts-loader',
				options: {
					compilerOptions: {
						'module': 'es6' // override `tsconfig.json` so that TypeScript emits native JavaScript modules.
					}
				}
			}]
		}]
	},
}

module.exports = config
