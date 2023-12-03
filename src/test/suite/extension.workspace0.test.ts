import * as assert from 'assert';
import { after, before } from 'mocha';
import * as vscode from 'vscode';
import { getStorageUri } from '../../extension'
import { doesDirExist, doesFileExist, runAllTests } from '../common'


const projName = 'workspace0'

before(async () => {
    console.log("before")
})

after(() => {
	console.log("after")
})

suite(projName + ' - Extension Test Suite', () => {

	test(projName + '.1 - <storageUri>/ablunit.json file exists', async () => {
		await runAllTests()

		const storageUri = await getStorageUri(vscode.workspace.workspaceFolders![0])
		if (!storageUri) {
			assert.fail("storage uri not defined")
		}
		const ablunitJson = vscode.Uri.joinPath(storageUri,'ablunit.json')
		const resultsXml = vscode.Uri.joinPath(storageUri,'results.xml')
		const resultsJson = vscode.Uri.joinPath(storageUri,'results.json')
		const listingsDir = vscode.Uri.joinPath(storageUri,'listings')

		console.log("storageUri= " + storageUri.fsPath)
		assert(await doesFileExist(ablunitJson), "missing ablunit.json (" + ablunitJson.fsPath + ")")
		assert(await doesFileExist(resultsXml), "missing results.xml (" + resultsXml.fsPath + ")")
		assert(!await doesFileExist(resultsJson), "results.json exists and should not (" + resultsJson.fsPath + ")")
		assert(!await doesDirExist(listingsDir), "listings dir exists and should not (" + listingsDir.fsPath + ")")
	})

})
