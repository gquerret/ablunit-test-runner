import * as path from 'path'
import { getTestConfig } from './createTestConfig'
import { runTests } from '@vscode/test-electron'

async function main () {
	const config = getTestConfig()

	let testRunCount = 0
	for (const conf of config) {
		// await testProject(conf.projName, conf.workspaceFolder, conf.launchArgs)
		console.log('process.execArgv=' + JSON.stringify(process.execArgv,null,2))
		if (conf.projName === 'proj7B') {
			await testProject(conf.projName, conf.workspaceFolder, conf.launchArgs)
		}
		testRunCount++
	}
	console.log('[runTest.ts main] testRunCount=' + testRunCount)
	if (testRunCount === 0) {
		console.log('[runTest.ts main] no tests have run!  exiting with code 1')
		process.exit(1)
	}
}

async function testProject (projName: string, projDir?: string, launchArgs: string[] = []) {
	if(!projDir) {
		projDir = projName
	}

	const extensionDevelopmentPath = path.resolve(__dirname, '../../')
	const extensionTestsPath = path.resolve(__dirname)
	try {
		const args: string[] = [
			projDir,
			'--disable-gpu',
			// '--verbose',
			// '--telemetry'
		]
		args.push(...launchArgs)

		console.log('[runTest.ts testProject] (projName=' + projName + ') running tests with args=' + args)
		await runTests({
			extensionDevelopmentPath,
			extensionTestsPath,
			launchArgs: args
		})
		console.log("[runTest.ts testProject] (projName=" + projName + ") tests completed successfully!")
	} catch (err) {
		console.error('[runTest.ts testProject] (projName=' + projName + ') failed to run tests, err=' + err)
		process.exit(1)
	} finally {
		console.log('[runTest.ts testProject] (projName=' + projName + ') finally')
	}
}

main().then(() => {
	console.log('[runTest.ts main] completed successfully!')
}, (err) => {
	console.error('[runTest.ts main] Failed to run tests, err=' + err)
	process.exit(1)
})
