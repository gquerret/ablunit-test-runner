import { strict as assert } from 'assert'
import { before } from 'mocha'
import { Uri } from 'vscode'
import { parseSuiteLines } from '../../parse/TestSuiteParser'
import { parseTestClass } from '../../parse/TestClassParser'
import { parseTestProgram } from '../../parse/TestProgramParser'
import { getTestCount, getWorkspaceUri, log, runAllTests, waitForExtensionActive } from '../testCommon'
import { getContentFromFilesystem, getLines } from '../../parse/TestParserCommon'


const projName = 'proj5'
const workspaceUri = getWorkspaceUri()

suite(projName + ' - Extension Test Suite', () => {

	before(projName + ' - before', async () => {
		await waitForExtensionActive()
	})

	test(projName + '.1 - test count', async () => {
		await runAllTests()

		const resultsJson = Uri.joinPath(workspaceUri, 'ablunit', 'results.json')
		const testCount = await getTestCount(resultsJson)
		assert(testCount > 100)
	})


	// //////// TEST SUITES //////////

	test(projName + '.2 - TestSuite - suite1.cls', async () => {
		const lines = await readLinesFromFile('test/suites/suite1.cls', '@testsuite')
		const suiteRet = parseSuiteLines(lines)
		assert.strictEqual(suiteRet.name, 'suites.suite1')
		assert.strictEqual(suiteRet.classes.length, 4, 'expected 4 classes in suite1.cls')
		assert.strictEqual(suiteRet.procedures.length, 7, 'expected 7 procedures in suite1.cls')
	})

	// //////// TEST CLASSES //////////

	test(projName + '.3 - TestClass - login/test2.cls - ablunit.explorer.classlabel=class-type-name (default)', async () => {
		const lines = await readLinesFromFile('test/login/test2.cls')
		const classRet = parseTestClass(lines, 'class-type-name', 'login/test2.cls')
		assert.strictEqual(classRet.classname, 'login.test2')
		assert.strictEqual(classRet.label, 'login.test2')
	})

	test(projName + '.4 - TestClass - login/test2.cls - ablunit.explorer.classlabel=filename', async () => {
		const lines = await readLinesFromFile('test/login/test2.cls')
		const classRet = parseTestClass(lines, 'filename', 'login/test2.cls')
		assert.strictEqual(classRet.classname, 'login.test2')
		assert.strictEqual(classRet.label, 'test2.cls')
	})

	test(projName + '.5 - TestClass - login/test5.cls - test count', async () => {
		const lines = await readLinesFromFile('test/login/test5.cls')
		const classRet = parseTestClass(lines, 'filename', 'login/test5.cls')
		assert.strictEqual(classRet.testcases.length, 8, 'testcase count in test/login/test5.cls')
	})

	test(projName + '.6 - TestClass - login/test5.cls - test count', async () => {
		const lines = await readLinesFromFile('test/login/test7.cls')
		const classRet = parseTestClass(lines, 'filename', 'login/test7.cls')
		assert.strictEqual(classRet.testcases.length, 0, 'testcase count in test/login/test5.cls')
	})

	// //////// TEST PROGRAMS //////////

	test(projName + '.7 - TestProgram - test/proc2/proc2.p - test count', async () => {
		const lines = await readLinesFromFile('test/proc2/proc2.p')
		const classRet = parseTestProgram(lines, 'filename')
		assert.strictEqual(classRet.testcases.length, 9, 'testcase count in test/proc2/proc2.p')
	})

	test(projName + '.8 - TestClass - test/proc2/test7.p- test count', async () => {
		const lines = await readLinesFromFile('test/proc2/test7.p')
		const classRet = parseTestProgram(lines, 'filename')
		assert.strictEqual(classRet.testcases.length, 0, 'testcase count in test/proc2/test7.p')
	})

})


async function readLinesFromFile (relativeFile: string, annotation = '@test') {
	const uri = Uri.joinPath(workspaceUri, relativeFile)
	return getContentFromFilesystem(uri).then((content) => {
		const [ lines, ] = getLines(content, annotation)
		return lines
	}, (err) => {
		log.error('Error reading file (' + relativeFile + '): ' + err)
		throw err
	})
}
