import * as core from '@actions/core'
import * as io from '@actions/io'
import axios from 'axios'
import fs from 'fs'
import path from 'path'

/**
 * Downloads a file to disk
 * @param url the download url
 * @param filePath the download path location on disk
 */
export async function downloadFile(
  url: string,
  filePath: string
): Promise<void> {
  core.info(`Downloading ${url}...`)
  const response = await axios.get(url, {
    responseType: 'stream'
  })

  const writer = fs.createWriteStream(filePath)
  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve).on('error', reject)
  })
}

/**
 * Creates a directory path if missing.
 * @param directory the directory's path.
 */
export async function createDirectoryIfMissing(
  directory: string
): Promise<void> {
  if (!fs.existsSync(directory)) {
    core.info(`Creating ${directory} as it does not exist...`)
    return io.mkdirP(directory)
  }
  return Promise.resolve()
}

/**
 * Gets the action's inputs
 */
export function getInputs(): {
  token: string
  version: string
  installPath: string
  ignoreCachedInstall: boolean
  googleJavaFormatPath: string
} {
  const token: string = core.getInput('token')
  const version: string = core.getInput('version').toLowerCase() || 'latest'
  const installPath: string = path.resolve(core.getInput('install-path') || '.')
  const ignoreCachedInstall: boolean =
    core.getBooleanInput('ignore-cached-install') || false

  const googleJavaFormatPath: string = path.join(
    installPath,
    'google-java-format.jar'
  )
  return {
    token,
    version,
    installPath,
    ignoreCachedInstall,
    googleJavaFormatPath
  }
}

/**
 * Sets the action's outputs
 * @param googleJavaFormatPath the google-java-format install path
 * @param googleJavaFormatVersion the installed google-java-format version
 */
export function setOutputs(
  googleJavaFormatPath: string,
  googleJavaFormatVersion: string
): void {
  core.setOutput('path', googleJavaFormatPath)
  core.setOutput('version', googleJavaFormatVersion)
}
