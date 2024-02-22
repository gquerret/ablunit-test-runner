/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-console */
// @ts-nocheck

import { defineConfig } from '@vscode/test-cli'
import { fileURLToPath } from 'url'
import * as glob from 'glob'
import * as path from 'path'
import * as fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const enableExtensions = []
enableExtensions.push('DebugLines')
enableExtensions.push('proj2')
enableExtensions.push('proj3')
enableExtensions.push('proj4')
enableExtensions.push('proj7A')
enableExtensions.push('proj7B')
enableExtensions.push('proj8')
enableExtensions.push('proj9')

// let version = 'insiders'
let vsVersion = 'stable'
let oeVersion = '12.2.12'

function initialize () {
	if (process.env['ABLUNIT_TEST_RUNNER_VSCODE_VERSION']) {
		vsVersion = process.env['ABLUNIT_TEST_RUNNER_VSCODE_VERSION']
	}
	if (vsVersion !== 'insiders' && vsVersion !== 'stable') {
		throw new Error('Invalid version: ' + vsVersion)
	}

	if (process.env['ABLUNIT_TEST_RUNNER_OE_VERSION']) {
		oeVersion = process.env['ABLUNIT_TEST_RUNNER_OE_VERSION']
	}
}

function writeConfigToFile (name, config) {
	fs.writeFileSync('.vscode-test.' + name + '.json.bk', JSON.stringify(config, null, 4).replace('    ', '\t'))
}

function getMochaTimeout (projName) {
	if (projName === 'proj0') {
		return 20000
	}
	if (projName === 'proj4') {
		return 30000
	}
	if (projName === 'proj1') {
		return 45000
	}
	if (projName === 'DebugLines') {
		return 60000
	}
	if (projName.startsWith('proj7')) {
		// return 60000
		return 90000
	}
	// return 15000
	return 15000
}

function getMochaOpts (projName) {

	const reporterDir = path.resolve(__dirname, '..', 'artifacts', vsVersion + '-' + oeVersion)
	fs.mkdirSync(reporterDir, { recursive: true })
	const jsonFile = path.resolve(reporterDir, 'mocha_results_' + projName + '.json')
	const mochaFile = path.resolve(reporterDir, 'mocha_results_junit_' + projName + '.xml')
	const sonarFile = path.resolve(reporterDir, 'mocha_results_sonar_' + projName + '.xml')
	const xunitFile = path.resolve(reporterDir, 'mocha_results_xunit_' + projName + '.xml')

	const mochaOpts = {
		preload: [
			// './dist/extension.js',

			'ts-node/register/transpile-only',

			'ts-node/register',
			// 'source-map-support',
			// 'source-map-support/register',
			// 'source-map-support/register-hook-require',
		],
		// preload: [ 'ts-node/register/transpile-only' ],
		// preload: [ 'ts-node/register/transpile-only' ],
		timeout: getMochaTimeout(projName),
		ui: 'tdd',
		retries: 0,
		recursive: true,
		color: true,
		exit: true,
		extension: [ 'js', 'ts', 'test.ts' ],
		require: [
			// './dist/extension.js',
			// 'ts-node/register',
			// 'source-map-support',
			'source-map-support/register',
			// 'source-map-support/register-hook-require',
		]
	}

	// TODO - prevents results from reporting to vscode-extension-test-runner
	mochaOpts.reporter = 'mocha-multi-reporters'
	mochaOpts.reporterOptions = {
		reporterEnabled: [ 'spec', 'mocha-junit-reporter', 'mocha-sonarqube-reporter' ],
		// reporterEnabled: [ 'spec', 'mocha-junit-reporter', 'mocha-sonarqube-reporter', 'fullJsonStreamReporter', 'xunit', 'json' ],
		jsonReporterOptions: { output: jsonFile },
		xunitReporterOptions: { output: xunitFile },
		mochaJunitReporterReporterOptions: { mochaFile: mochaFile },
		mochaSonarqubeReporterReporterOptions: { output: sonarFile }
	}

	return mochaOpts
}

function getLaunchArgs (projName) {
	const args = [
		// 'test_projects/' + projName, // workspaceFolder is set in the config
		'--disable-gpu',
		// '--reuse-window',
		// '--user-data-dir=./test_projects/' + projName + '/.vscode-data/',
		// '--profile=' + projName,
		'--sync=off',
		// '--telemetry',
		// '--log=debug',
		// '--log=verbose',
		// '--verbose',
	]
	if (!enableExtensions.includes(projName)) {
		// args.push('--disable-extensions')
	}
	// args.push('--enable-source-maps')
	// args.push('--produce-source-map')
	return args
}

function getTestConfig (projName) {

	let ws = './test_projects/' + projName
	if (projName === 'proj3') {
		ws = ws + '_debugLines'
	} else if(projName === 'proj5') {
		ws = ws + '_suites'
	} else if(projName === 'proj6') {
		ws = ws + '_dot_dir'
	} else if(projName === 'proj7A' || projName === 'proj7B') {
		ws = 'test_projects/proj7_load_performance'
	} else if(projName === 'proj8') {
		ws = ws + '_custom_command'
	} else if(projName.startsWith('workspace')) {
		ws = ws + '.code-workspace'
	}

	return {
		label: 'suite:' + projName,
		extensionDevelopmentPath: './',
		workspaceFolder: ws,
		files: './test/suites/' + projName + '.test.ts',
		version: vsVersion,
		launchArgs: getLaunchArgs(projName),
		mocha: getMochaOpts(projName),
		srcDir: './',
		env: {
			// VSCODE_VERSION: 'stable',
			ABLUNIT_TEST_RUNNER_UNIT_TESTING: 'true',
			VSCODE_SKIP_PRELAUNCH: '1',
			NODE_OPTIONS: [
				'--enable-source-maps',
				// 	// '--produce-source-map',
				// 	// '--register source-map-support/register',
				'--require source-map-support/register',
			],
			// NODE_OPTIONS: '--produce-source-map',
		}
	}
}
function getTests () {

	let tests = []
	if (process.env['ABLUNIT_TEST_RUNNER_PROJECT_NAME']) {
		const projects = process.env['ABLUNIT_TEST_RUNNER_PROJECT_NAME'].split(',')
		for (const p of projects) {
			tests.push(getTestConfig(p))
		}
	} else {
		const g = glob.globSync('test/suites/*.test.ts').reverse()
		for (const f of g) {
			tests.push(getTestConfig(path.basename(f, '.test.ts')))
		}
	}
	return tests
}

function getCoverageOpts () {
	const coverageDir = path.resolve(__dirname, '..', 'coverage', vsVersion + '-' + oeVersion)
	fs.mkdirSync(coverageDir, { recursive: true })
	return {
		reporter: [ 'text', 'lcov' ],
		output: coverageDir,
		includeAll: true,
		exclude: [
			// working below this line
			'dist',
			'.vscode-test.mjs',
			'test_projects',
			'dummy-ext',
			'webpack.config.js',
			'vscode.proposed.*.d.ts',
		],
		include: [
			'**/*'
		],
		require: [ 'ts-node/register' ],
		cache: false,
		// 'produce-source-map': true,
		'enable-source-maps': true,
		sourceMap: false,
		instrument: false,
	}
}

export function createTestConfig () { // NOSONAR
	initialize()
	const testConfig = defineConfig({
		tests: getTests(),
		coverage: getCoverageOpts(),
	})

	writeConfigToFile('config', testConfig)
	return testConfig
}
