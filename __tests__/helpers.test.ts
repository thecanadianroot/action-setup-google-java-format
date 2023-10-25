import * as core from '@actions/core'
import * as io from '@actions/io'
import axios from 'axios'
import axiosMock from 'axios-mock-adapter'
import fs from 'fs'
import path from 'path'
import { expect } from '@jest/globals'
import {
  createDirectoryIfMissing,
  downloadFile,
  getInputs,
  setOutputs
} from '../src/helpers'

describe('downloadFile', () => {
  it('should download a file', async () => {
    const url = 'http://localhost/file.txt'
    const outputFile = '__tests__/tmp/output.txt'
    const axiosMockInstance = new axiosMock(axios)

    const infoMock = jest.spyOn(core, 'info')
    axiosMockInstance
      .onGet(url, { responseType: 'stream' })
      .reply(
        200,
        fs.createReadStream('__tests__/assets/input.txt', { autoClose: true })
      )

    await downloadFile(url, outputFile)

    expect(infoMock).toHaveBeenCalledWith(
      'Downloading http://localhost/file.txt...'
    )
    expect(axiosMockInstance.history.get.length).toBe(1)

    const output = await fs.promises.readFile(outputFile, 'utf-8')
    expect(output).toStrictEqual('Hello world!')
  })
})

describe('setOutputs', () => {
  it('should set outputs', () => {
    const infoMock = jest.spyOn(core, 'setOutput')

    const googleJavaFormatPath = 'path/'
    const googleJavaFormatVersion = '1.0.0'
    setOutputs(googleJavaFormatPath, googleJavaFormatVersion)

    expect(infoMock).toHaveBeenNthCalledWith(1, 'path', googleJavaFormatPath)
    expect(infoMock).toHaveBeenNthCalledWith(
      2,
      'version',
      googleJavaFormatVersion
    )
  })
})

describe('createPathIfMissing', () => {
  it('should return a resolved promise if the path already exists', async () => {
    const existingPath = 'path/'

    const infoMock = jest.spyOn(core, 'info')
    const mkdirPMock = jest.spyOn(io, 'mkdirP')
    const existsSyncMock = jest.spyOn(fs, 'existsSync')
    existsSyncMock.mockReturnValue(true)

    const result = await createDirectoryIfMissing(existingPath)

    expect(result).toBeUndefined()
    expect(existsSyncMock).toHaveBeenCalledWith(existingPath)
    expect(infoMock).not.toHaveBeenCalled()
    expect(mkdirPMock).not.toHaveBeenCalled()
  })

  it('should create the path and return a resolved promise', async () => {
    const missingPath = 'path/'

    const infoMock = jest.spyOn(core, 'info')
    const mkdirPMock = jest.spyOn(io, 'mkdirP')
    const existsSyncMock = jest.spyOn(fs, 'existsSync')
    existsSyncMock.mockReturnValue(false)
    mkdirPMock.mockReturnValue(Promise.resolve())

    const result = await createDirectoryIfMissing(missingPath)

    expect(result).toBeUndefined()
    expect(existsSyncMock).toHaveBeenCalledWith(missingPath)
    expect(infoMock).toHaveBeenCalledWith(
      'Creating path/ as it does not exist...'
    )
    expect(mkdirPMock).toHaveBeenCalledWith(missingPath)
  })
})

describe('getInputs', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  it('should return the correct inputs when all inputs are provided', () => {
    const getBooleanInputMock = jest.spyOn(core, 'getBooleanInput')
    const resolveMock = jest.spyOn(path, 'resolve')
    const getInputMock = jest.spyOn(core, 'getInput')
    resolveMock.mockImplementation((...paths: string[]): string => {
      return paths[0]
    })
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return 'myToken'
        case 'version':
          return '2.0.0'
        case 'install-path':
          return 'path/'
        default:
          return ''
      }
    })
    getBooleanInputMock.mockReturnValue(true)

    const result = getInputs()

    expect(result).toEqual({
      token: 'myToken',
      version: '2.0.0',
      installPath: 'path/',
      ignoreCachedInstall: true,
      googleJavaFormatPath: `path/google-java-format.jar`
    })
  })

  it('should return default values when inputs are not provided', () => {
    const getBooleanInputMock = jest.spyOn(core, 'getBooleanInput')
    const resolveMock = jest.spyOn(path, 'resolve')
    resolveMock.mockImplementation((...paths: string[]): string => {
      return paths[0]
    })
    getBooleanInputMock.mockReturnValueOnce(false) // bug: Input does not meet YAML 1.2 "Core Schema" specification: force-download

    const result = getInputs()

    expect(result).toEqual({
      token: '',
      version: 'latest',
      installPath: '.',
      ignoreCachedInstall: false,
      googleJavaFormatPath: 'google-java-format.jar'
    })
  })
})
