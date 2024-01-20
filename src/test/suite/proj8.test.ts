import { strict as assert } from 'assert'
import { before } from 'mocha'
import { Uri } from 'vscode'
import { assertResults, doesFileExist, getRecentResults, getWorkspaceUri, runAllTests, waitForExtensionActive } from '../testCommon'
import { getEnvVars } from '../../ABLUnitRun'

const projName = 'proj8'

before(async () => {
	await waitForExtensionActive()
})

suite(projName + ' - Extension Test Suite', () => {

	test(projName + '.1 - test count', async () => {
		await runAllTests()

		const resultsXml = Uri.joinPath(getWorkspaceUri(),'target','results.xml')
		const resultsJson = Uri.joinPath(getWorkspaceUri(),'target','results.json')

		assert(await doesFileExist(resultsXml), "missing results.xml (" + resultsXml.fsPath + ")")
		assert(await doesFileExist(resultsJson), "missing results.json (" + resultsJson.fsPath + ")")

		await assertResults.count(2)
		await assertResults.errored(0)
		await assertResults.failed(0)
		await assertResults.passed(2)
	})

	test(projName + '.2 - getEnvVars confirm PATH is set correctly', async () => {
		await runAllTests()
		const recentResults = await getRecentResults()
		const res = recentResults?.[0]
		if (!res) {
			assert.fail("res is null")
		}
		const envVars = getEnvVars(res.dlc?.uri)
		const envPath = envVars['PATH']
		if (envPath) {
			assert(!envPath.includes('${env:PATH}'), 'env should not contain ${env.PATH}, but does')
		} else {
			assert.fail("env is undefined")
		}
	})

})
