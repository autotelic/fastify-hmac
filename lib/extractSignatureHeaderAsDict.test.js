'use strict'

const tap = require('tap')
const extractSignatureHeaderAsDict = require('./extractSignatureHeaderAsDict')

tap.test(
  'Signature Header Extracted as Dictionary',
  async ({ same, error }) => {
    const standardRequest = {
      headers: { signature: 'signature=1d3g5h7,biff=buzz' }
    }
    const standardResult = { signature: '1d3g5h7', biff: 'buzz' }
    same(
      extractSignatureHeaderAsDict(standardRequest),
      standardResult,
      'Dictionary created from valid signature header'
    )

    const multipleEquals = {
      headers: { signature: 'signature=2d3g=5h7,biff=buzz' }
    }
    const multipleEqualsResult = { signature: '2d3g=5h7', biff: 'buzz' }
    same(
      extractSignatureHeaderAsDict(multipleEquals),
      multipleEqualsResult,
      "Dictionary respects '=' in field values as valid character"
    )

    const noSignature = { headers: {} }
    const noSignatureResult = new Error('Request not signed.')
    same(
      extractSignatureHeaderAsDict(noSignature),
      noSignatureResult,
      'No signature header returns an error'
    )
  }
)
