import * as cache from '@actions/cache'
import * as core from '@actions/core'
import * as fs from 'fs'
import * as github from '@actions/github'
import {
  setOutputs,
  downloadFile,
  createDirectoryIfMissing,
  getInputs
} from './helpers'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const {
      token,
      version,
      installPath,
      ignoreCachedInstall,
      googleJavaFormatPath
    } = getInputs()
    if (cache.isFeatureAvailable()) {
      core.info('Restoring cached install...')
      await cache.restoreCache([googleJavaFormatPath], 'google-java-format')
    }

    await createDirectoryIfMissing(installPath)

    if (fs.existsSync(googleJavaFormatPath) && !ignoreCachedInstall) {
      core.info(
        `Nothing to do since google-java-format is already installed to ${googleJavaFormatPath}. You can force download with force-download input.`
      )
      setOutputs(googleJavaFormatPath, version)
      return Promise.resolve()
    }

    const ocktokit = github.getOctokit(token)

    const regex = /google-java-format-\d+\.\d+\.\d+-all-deps\.jar/

    let tagName
    let asset

    if ('latest' === version) {
      core.info('Fetching latest release info of google-java-format...')
      const release = await ocktokit.rest.repos.getLatestRelease({
        owner: 'google',
        repo: 'google-java-format'
      })
      tagName = release.data.tag_name
      asset = release.data.assets.find(item => regex.test(item.name))
      core.info(`Found latest version: ${tagName}`)
    } else {
      core.info(`Fetching release ${version} info of google-java-format...`)
      const release = await ocktokit.rest.repos.getReleaseByTag({
        owner: 'google',
        repo: 'google-java-format',
        tag: version
      })
      tagName = release.data.tag_name
      asset = release.data.assets.find(item => regex.test(item.name))
      core.info(`Found version: ${tagName}`)
    }

    if (asset) {
      await downloadFile(asset.browser_download_url, googleJavaFormatPath)
      core.info(
        `Installed google-java-format ${tagName} to ${googleJavaFormatPath}`
      )
      setOutputs(googleJavaFormatPath, tagName)
    } else {
      return Promise.reject(
        new Error(
          `Could not find google-java-format version ${tagName}. Please try-again or specify a valid version.`
        )
      )
    }

    if (cache.isFeatureAvailable()) {
      core.info('Caching install...')
      await cache.saveCache([googleJavaFormatPath], 'google-java-format')
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
