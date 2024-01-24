import { Uri, workspace, WorkspaceFolder } from 'vscode'
import { readStrippedJsonFile } from '../ABLUnitCommon'
import log from '../ChannelLogger'
import { getOpenEdgeProfileConfig, IBuildPathEntry } from './openedgeConfigFile'

interface IRuntime {
	name: string,
	path: string,
	default?: boolean
}

export interface IDlc {
	uri: Uri,
	version?: string
}

export interface IProjectJson {
	propathEntry: IBuildPathEntry[]
}

const dlcMap = new Map<WorkspaceFolder, IDlc>()

function getProjectJson (workspaceFolder: WorkspaceFolder) {
	const data = JSON.stringify(readStrippedJsonFile(Uri.joinPath(workspaceFolder.uri,"openedge-project.json")))
	return data
}

export function getDLC (workspaceFolder: WorkspaceFolder, openedgeProjectProfile?: string, projectJson?: string) {
	const dlc = dlcMap.get(workspaceFolder)
	if (dlc) {
		return dlc
	}

	let runtimeDlc: Uri | undefined = undefined
	const oeversion = getOEVersion(workspaceFolder, openedgeProjectProfile, projectJson)
	const runtimes: IRuntime[] = workspace.getConfiguration("abl.configuration").get("runtimes",[])

	for (const runtime of runtimes) {
		if (runtime.name === oeversion) {
			runtimeDlc = Uri.file(runtime.path)
			break
		}
		if (runtime.default) {
			runtimeDlc = Uri.file(runtime.path)
		}
	}
	if (!runtimeDlc && process.env['DLC']) {
		runtimeDlc = Uri.file(process.env['DLC'])
	}
	if (runtimeDlc) {
		log.info("using DLC = " + runtimeDlc.fsPath)
		const dlcObj: IDlc = { uri: runtimeDlc }
		dlcMap.set(workspaceFolder, dlcObj)
		return dlcObj
	}
	throw new Error("unable to determine DLC")
}

export function getOEVersion (workspaceFolder: WorkspaceFolder, openedgeProjectProfile?: string, projectJson?: string) {
	const profileJson = getOpenEdgeProfileConfig(workspaceFolder.uri, openedgeProjectProfile)
	if (!profileJson) {
		log.debug("[getOEVersion] profileJson not found")
		return undefined
	}

	if (profileJson.oeversion) {
		log.debug("[getOEVersion] profileJson.value.oeversion = " + profileJson.oeversion)
		return profileJson.oeversion
	}

	if (!projectJson) {
		projectJson = getProjectJson(workspaceFolder)
		if (!projectJson) {
			return undefined
		}
	}
	if(projectJson) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
		const tmpVer: string = JSON.parse(projectJson).oeversion
		if(tmpVer) {
			return tmpVer
		}
	}
	return undefined
}
