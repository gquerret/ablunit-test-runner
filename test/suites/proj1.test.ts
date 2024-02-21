import * as vscode from 'vscode'
import { assert, deleteTestFiles, getTestCount, getWorkspaceUri, log, runAllTests, sleep, updateConfig, workspace } from '../testCommon'
log.info('LOADING ' + __filename)

suite('proj1Suite', () => {

	// suiteSetup('proj1 - suiteSetup', async () => {
	// 	log.info('100')
	// 	log.info('101')
	// 	await sleep(100)
	// 	log.info('102')
	// })

	setup('proj1 - setup', async () => {
		await updateConfig('files.exclude', undefined)
		log.info('110')
		deleteTestFiles()
		log.info('111')
	})

	teardown('proj1 - teardown', () => {
		log.info('120')
		deleteTestFiles()
		log.info('121')
	})

	test('proj1.0 output files exist one', () => {
		log.info('130')
		log.info('proj1.0-1 workspaceFolder=' + workspace.workspaceFolders?.[0].uri.fsPath)
		log.info('131')
		if (!workspace.workspaceFolders) {
			// throw new Error('proj1.0 - workspaceFolder not set')
			log.error('proj1.0 - workspaceFolder not set')
			process.exit(1)
		}
		log.info('132')
		if (!workspace.workspaceFolders[0].uri.fsPath.replace(/\\/g, '/').endsWith('test_projects/proj1')) {
			// throw new Error('proj1.0 - workspaceFolder not set to proj1 (' + workspace.workspaceFolders[0].uri.fsPath + ')')
			log.error('proj1.0 - workspaceFolder not set to proj1 (' + workspace.workspaceFolders[0].uri.fsPath + ')')
			process.exit(1)
		}
		log.info('proj1.0-2 workspaceFolder=' + workspace.workspaceFolders[0].uri.fsPath)
		assert.assert(true)
	})

	test('proj1.1 output files exist two', async () => {
		log.info('proj1.1 - output files exist - 1')
		assert.assert(true)
		const workspaceUri = getWorkspaceUri()
		const ablunitJson = vscode.Uri.joinPath(workspaceUri, 'ablunit.json')
		const resultsXml = vscode.Uri.joinPath(workspaceUri, 'results.xml')
		const resultsJson = vscode.Uri.joinPath(workspaceUri, 'results.json')
		assert.notFileExists(ablunitJson)
		assert.notFileExists(resultsXml)

		await runAllTests()

		assert.fileExists(ablunitJson)
		if (process.platform === 'win32' || process.env['WSL_DISTRO_NAME'] !== undefined) {
			assert.fileExists(resultsXml)
		} else {
			assert.notFileExists(resultsXml)
		}
		assert.notFileExists(resultsJson)
	})

	test('proj1.2 - output files exist 2 - exclude compileError.p', async () => {
		await updateConfig('files.exclude', [ '.builder/**', 'compileError.p' ])
		await runAllTests()

		const resultsJson = vscode.Uri.joinPath(getWorkspaceUri(), 'results.json')
		const testCount = await getTestCount(resultsJson)
		assert.equal(testCount, 12)
	})

	test('proj1.3 - output files exist 3 - exclude compileError.p as string', async () => {
		// this isn't officially supported and won't syntac check in the settings.json file(s), but it works
		await updateConfig('files.exclude', 'compileError.p')
		await runAllTests()

		const resultsJson = vscode.Uri.joinPath(getWorkspaceUri(), 'results.json')
		const testCount = await getTestCount(resultsJson)
		assert.equal(testCount, 12)
	})

	test('proj1.4 - run test case in file', async () => {
		await vscode.commands.executeCommand('vscode.open', vscode.Uri.joinPath(getWorkspaceUri(), 'procedureTest.p'))
		await vscode.commands.executeCommand('testing.runCurrentFile')

		const resultsJson = vscode.Uri.joinPath(getWorkspaceUri(), 'results.json')
		const testCount: number = await getTestCount(resultsJson)
		const pass = await getTestCount(resultsJson, 'pass')
		const fail = await getTestCount(resultsJson, 'fail')
		const error = await getTestCount(resultsJson, 'error')
		assert.equal(6, testCount, 'test count')
		assert.equal(2, pass, 'pass count')
		assert.equal(2, fail, 'fail count')
		assert.equal(2, error, 'error count')
	})

	test('proj1.5 - run test case at cursor', async () => {
		await vscode.commands.executeCommand('vscode.open', vscode.Uri.joinPath(getWorkspaceUri(), 'procedureTest.p'))
		if(vscode.window.activeTextEditor) {
			vscode.window.activeTextEditor.selection = new vscode.Selection(21, 0, 21, 0)
		} else {
			assert.fail('vscode.window.activeTextEditor is undefined')
		}
		await vscode.commands.executeCommand('testing.runAtCursor')

		const resultsJson = vscode.Uri.joinPath(getWorkspaceUri(), 'results.json')
		const testCount = await getTestCount(resultsJson)
		const pass = await getTestCount(resultsJson, 'pass')
		const fail = await getTestCount(resultsJson, 'fail')
		const error = await getTestCount(resultsJson, 'error')
		assert.equal(1, testCount)
		assert.equal(1, pass)
		assert.equal(0, fail)
		assert.equal(0, error)
	})
})
