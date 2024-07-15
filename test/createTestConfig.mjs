/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// @ts-nocheck

import { defineConfig } from '@vscode/test-cli'
import { fileURLToPath } from 'url'
import * as glob from 'glob'
import * as path from 'path'
import * as fs from 'fs'
import process from 'process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const vsVersionNum = '1.88.0'
const vsVersion = process.env['ABLUNIT_TEST_RUNNER_VSCODE_VERSION'] ?? 'stable'
const oeVersion = process.env['ABLUNIT_TEST_RUNNER_OE_VERSION'] ?? '12.2.12'
let firstTest = true
const enableExtensions = [
	'AtStart',
	'DebugLines',
	'proj2',
	'proj3',
	'proj4',
	'proj7A',
	'proj7B',
	'proj8',
	'proj9',
]

function initialize () {
	if (vsVersion !== 'insiders' && vsVersion !== 'stable') {
		throw new Error('Invalid version: ' + vsVersion)
	}
}

function writeConfigToFile (name, config) {
	fs.writeFileSync('.vscode-test.' + name + '.bk.json', JSON.stringify(config, null, 4).replace('    ', '\t'))
}

function getMochaTimeout (projName) {
	if (projName === 'examples') {
		return 1000
	}
	if (firstTest) {
		firstTest = false
		// return 180000
		return 30000
	}
	// if (projName === 'proj3' && projName === 'proj4') {
	// 	return 30000
	// }
	// if (projName === 'proj1') {
	// 	return 55000
	// }
	// if (projName === 'DebugLines') {
	// 	return 60000
	// }
	// if (projName.startsWith('proj7')) {
	// 	// return 60000
	// 	return 90000
	// }
	// return 15000
	// return 25000
	return 15000
}

/**
* Additional options to pass to the Mocha runner.
* @see https://mochajs.org/api/mocha
*/
function getMochaOpts (projName) {
	const reporterDir = path.resolve(__dirname, '..', 'artifacts', vsVersion + '-' + oeVersion)
	fs.mkdirSync(reporterDir, { recursive: true })
	const jsonFile = path.resolve(reporterDir, 'mocha_results_' + projName + '.json')
	const xunitFile = path.resolve(reporterDir, 'mocha_results_xunit_' + projName + '.xml')
	const mochaFile = path.resolve(reporterDir, 'mocha_results_junit_' + projName + '.xml')
	const sonarFile = path.resolve(reporterDir, 'mocha_results_sonar_' + projName + '.xml')
	// const bail = process.env['CIRCLECI'] != 'true' || false

	const mochaOpts = {
		// fullTrace: true
		retries: 0,
		timeout: getMochaTimeout(projName),
		// ui: 'tdd', // describe, it, etc
		// ui: 'bdd' // default; suite, test, etc
		parallel: false,
		bail: false,
		require: [
			'mocha',
		// 	// './dist/extension.js',
		// 	'source-map-support',
		// 	'source-map-support/register',
		// 	'source-map-support/register-hook-require',
		// 	'ts-node/register',
		],
		reporter: 'mocha-multi-reporters',
		reporterOptions: {
			reporterEnabled: [ 'spec', 'mocha-junit-reporter' ],
			jsonReporterOptions: { output: jsonFile },
			xunitReporterOptions: { output: xunitFile },
			mochaJunitReporterReporterOptions: { mochaFile: mochaFile },
		},
		// preload: [ 'ts-node/register/transpile-only' ],
		preload: [
			// './dist/extension.js',
			'mocha',
			'ts-node/register/transpile-only',
			'ts-node/register',
		],
	}

	if (process.env['ABLUNIT_TEST_RUNNER_RUN_SCRIPT_FLAG']) {
		// eslint-disable-next-line no-console
		// console.log('adding reporter...')
		mochaOpts.reporter = 'mocha-multi-reporters'
		mochaOpts.reporterOptions = {
			reporterEnabled: [ 'json-stream', 'spec', 'mocha-junit-reporter', 'mocha-sonarqube-reporter' ],
			// jsonReporterOptions: { output: jsonFile },
			// xunitReporterOptions: { output: xunitFile },
			mochaJunitReporterReporterOptions: { mochaFile: mochaFile },
			mochaSonarqubeReporterReporterOptions: { output: sonarFile }
		}
	}

	if (process.env['CIRCLECI']) {
		mochaOpts.bail = true
	}

	return mochaOpts
}

// function getExtensionVersion () {
// 	const contents = fs.readFileSync('package.json')
// 	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
// 	const packageJSON = JSON.parse(contents)
// 	if (packageJSON['version']) {
// 		return toString(packageJSON['version'])
// 	}
// 	throw new Error('unable to get extension version')
// }

function getLaunchArgs (projName) {
	const args = []
	// const extVersion = getExtensionVersion()

	// --- start in directory --- //
	// 'test_projects/' + projName, // workspaceFolder is set in the config

	// --- args defined by `code -h` --- //
	// args.push('--add', '<folder>')
	// args.push('--goto', '<file:line[:character]>')
	// args.push('--new-window')
	// args.push('--reuse-window')
	// args.push('--wait')
	// args.push('--locale <locale>')
	// args.push('--user-data-dir', '<dir>')
	// args.push('--profile <profileName>')
	args.push('--profile-temp') // create a temporary profile for the test run in lieu of cleaning up user data
	// args.push('--help')
	// args.push('--extensions-dir', '<dir>')
	// args.push('--list-extensions')
	// args.push('--show-versions')
	// args.push('--category', '<category>')
	// args.push('--install-extension <ext-id>')

	// if (vsVersion === 'insiders') {
	// 	args.push('--install-extension', '../ablunit-test-runner-' + extVersion + '.vsix')
	// } else {
	// 	args.push('--install-extension', './ablunit-test-runner-insiders-' + extVersion + '.vsix')
	// }
	// args.push('--pre-release')
	// args.push('--uninstall-extension <ext-id>')
	// args.push('--update-extensions')
	// if (vsVersion === 'insiders') {
	// 	args.push('--enable-proposed-api', 'TestCoverage') // '<ext-id>'
	// }
	if (vsVersion === 'insiders') {
		args.push('--enable-proposed-api', 'kherring.ablunit-test-runner')
	}
	// args.push('--version')
	// args.push('--verbose')
	// args.push('--trace')
	// args.push('--log', '<level>')
	if (process.env['VERBOSE'] == 'true') {
		args.push('--log', 'debug')
		// args.push('--log', 'trace')
	}
	// args.push('--log', 'debug') // '<level>'
	// args.push('--log', 'trace') // '<level>'
	// args.push('--log', 'kenherring.ablunit-test-runner:debug') // <extension-id>:<level>
	// args.push('--log', 'kenherring.ablunit-test-runner:trace') // <extension-id>:<level>
	// args.push('--logsPath', './artifacts/vscode_logs/') // undocumented
	// args.push('--status')
	// args.push('--prof-startup')
	// args.push('--disable-extension <ext-id>')

	// if (enableExtensions.includes(projName)) {
	// 	args.push('--install-extension', 'riversidesoftware.openedge-abl-lsp')
	// }
	if (!enableExtensions.includes(projName)) {
		args.push('--disable-extensions')
		args.push('--disable-extension', 'riversidesoftware.openedge-abl-lsp')
	}
	if (vsVersion === 'insiders') {
		args.push('--enable-proposed-api=TestCoverage')
	}
	args.push('--disable-extension', 'vscode.builtin-notebook-renderers')
	args.push('--disable-extension', 'vscode.emmet')
	args.push('--disable-extension', 'vscode.git')
	args.push('--disable-extension', 'vscode.github')
	args.push('--disable-extension', 'vscode.grunt')
	args.push('--disable-extension', 'vscode.gulp')
	args.push('--disable-extension', 'vscode.jake')
	args.push('--disable-extension', 'vscode.ipynb')
	args.push('--disable-extension', 'vscode.tunnel-forwarding')
	args.push('--sync', 'off') // '<on | off>'
	// args.push('--inspect-extensions', '<port>')
	// args.push('--inspect-brk-extensions', '<port>')
	// args.push('--logExtensionHostCommunication')

	// --- disable functionality not needed for testing - https://github.com/microsoft/vscode/issues/174744 --- //
	args.push('--disable-chromium-sandbox')
	// args.push('--no-sandbox', '--sandbox=false')  ## super user only
	// args.push('--disable-gpu-sandbox')
	args.push('--disable-crash-reporter')
	args.push('--disable-gpu')
	args.push('--disable-dev-shm-usage', '--no-xshm')
	args.push('--disable-telemetry')
	args.push('--disable-updates')
	args.push('--disable-workspace-trust')
	// Warning: 'xshm' is not in the list of known options, but still passed to Electron/Chromium.


	// --- possible coverage (nyc) related args --- //
	// args.push('--enable-source-maps')
	// args.push('--produce-source-map')

	return args
}

function getTestConfig (projName) {

	let workspaceFolder = '' + projName
	if (projName.startsWith('proj7')) {
		workspaceFolder = 'proj7_load_performance'
	} else if (projName.startsWith('workspace')) {
		workspaceFolder = projName + '.code-workspace'
	}
	workspaceFolder = path.resolve(__dirname, '..', 'test_projects', workspaceFolder)

	if (!fs.existsSync(workspaceFolder)) {
		const g = glob.globSync('test_projects/' + projName + '_*')
		if (g.length > 1) {
			throw new Error('Multiple workspaces found: ' + workspaceFolder)
		}
		if (!g[0]) {
			throw new Error('No workspace found: ' + workspaceFolder)
		}
		workspaceFolder = g[0]
	}

	let useInstallation
	if (fs.existsSync('.vscode-test/vscode-win32-x64-archive-' + vsVersionNum + '/Code.exe')) {
		useInstallation = { fromPath: '.vscode-test/vscode-win32-x64-archive-' + vsVersionNum + '/Code.exe' }
	}

	const files = './test/suites/' + projName + '.test.ts'

	const env = {
		ABLUNIT_TEST_RUNNER_ENABLE_EXTENSIONS: enableExtensions.includes('' + projName),
		ABLUNIT_TEST_RUNNER_UNIT_TESTING: 'true',
		ABLUNIT_TEST_RUNNER_VSCODE_VERSION: vsVersion,
		DONT_PROMPT_WSL_INSTAL: true,
		VSCODE_SKIP_PRELAUNCH: true,
	}

	const extensionDevelopmentPath = './'
	// let extensionDevelopmentPath = path.resolve(__dirname, '..', 'ablunit-test-runner-0.2.1.vsix')
	// if (vsVersion === 'insiders') {
	// 	extensionDevelopmentPath = path.resolve(__dirname, '..', 'ablunit-test-runner-insiders-0.2.1.vsix')
	// }

	let installExtensions
	if (enableExtensions.includes(projName)) {
		installExtensions = ['riversidesoftware.openedge-abl-lsp']
	}

	process.env['ABLUNIT_TEST_RUNNER_ENABLE_EXTENSIONS'] = enableExtensions.includes('' + projName)
	process.env['ABLUNIT_TEST_RUNNER_UNIT_TESTING'] = 'true'
	process.env['DONT_PROMPT_WSL_INSTALL'] = 'true'
	process.env['VSCODE_SKIP_PRELAUNCH'] = 'true'

	return {
		// --- IBaseTestConfiguration --- //
		files,
		version: vsVersion,
		extensionDevelopmentPath,
		workspaceFolder,
		mocha: getMochaOpts(projName),
		label: 'suite_' + projName,
		srcDir: './',


		// --- IDesktopTestConfiguration --- //
		// platform: 'desktop',
		// desktopPlatform: 'win32',
		launchArgs: getLaunchArgs(projName),
		env,
		useInstallation,
		// download: ?
		installExtensions,
		skipExtensionDependencies: true,
	}
}

function getTests () {
	const tests = []
	const envProjectName = process.env['ABLUNIT_TEST_RUNNER_PROJECT_NAME'] ?? undefined

	// --- run only the specified projects --- //
	if (envProjectName && envProjectName != '') {
		const projects = envProjectName.split(',')
		for (const p of projects) {
			tests.push(getTestConfig(p))
		}
		return tests
	}

	// --- run all projects --- //
	const g = glob.globSync('test/suites/*.test.ts').reverse()
	for (const f of g) {
		const basename = path.basename(f, '.test.ts')
		if (basename != 'proj2' &&
			basename != 'proj3' &&
			basename != 'proj4' &&
			basename != 'proj7B' &&
			basename != 'proj9'
		) {
			tests.push(getTestConfig(basename))
		}
	}
	return tests
}

function getCoverageOpts () {
	const coverageDir = path.resolve(__dirname, '..', 'coverage', vsVersion + '-' + oeVersion)
	fs.mkdirSync(coverageDir, { recursive: true })
	return {
		exclude: [
			'dist',
			'.vscode-test.mjs',
			'test_projects',
			'dummy-ext',
			'webpack.config.js',
			'vscode.proposed.*.d.ts',
			'vscode',
		],
		include: [
			// '**/*',
			'**/src/**',
			'**/test/**',
		],
		// https://istanbul.js.org/docs/advanced/alternative-reporters/
		// * default = ['html'], but somehow also prints the 'text-summary' to the console
		// * 'lcov' includes 'html' output
		reporter: [ 'lcov', 'text' ],
		// includeAll: true,
		output: coverageDir,

		// TODO - not reporting extension, or other files loaded w/ vscode extension activate

		// ----- NOT REAL OPTIONS?? ----- //
		require: [ 'ts-node/register' ],
		cache: false,
		// 'enable-source-maps': true,
		// sourceMap: false,
		// instrument: false,
	}
}

export function createTestConfig () { // NOSONAR
	initialize()

	const testConfig = {
		tests: getTests(),
		coverage: getCoverageOpts(),
	}

	const definedConfig = defineConfig(testConfig)
	writeConfigToFile('testConfig', testConfig)
	writeConfigToFile('defined', definedConfig)
	return definedConfig
}
