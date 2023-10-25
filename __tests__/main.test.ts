/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as main from '../src/main'
import { expect } from '@jest/globals'

const getInputMock = jest.spyOn(core, 'getInput')
const getBooleanInputMock = jest.spyOn(core, 'getBooleanInput')

const runMock = jest.spyOn(main, 'run')

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('installs the latest google-java-format version', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return 'secret'
        case 'version':
          return '1.0.0'
        case 'install-path':
          return 'path/'
        default:
          return ''
      }
    })
    getBooleanInputMock.mockImplementation((name: string): boolean => {
      switch (name) {
        case 'force-download':
          return true
        default:
          return false
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()
  })

  it('installs a particular google-java-format version', async () => {
    // TODO
    expect(true).toBeTruthy()
  })
})
