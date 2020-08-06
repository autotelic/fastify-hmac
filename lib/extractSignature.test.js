'use strict'

const tap = require('tap')
const extractSignature = require('./extractSignature')

tap.test('Signature Extracted from Request', async ({ equal, same }) => {
  const standardRequest = {
    headers: { signature: 'signature=1d3g5h7,biff=buzz' }
  }
  const standardResult = '1d3g5h7'
  equal(
    extractSignature(standardRequest),
    standardResult,
    'Signature extracted from valid signature header'
  )

  const multipleEquals = {
    headers: { signature: 'signature=2d3g=5h7,biff=buzz' }
  }
  const multipleEqualsResult = '2d3g=5h7'
  equal(
    extractSignature(multipleEquals),
    multipleEqualsResult,
    "Signature respects '=' in field values as valid character"
  )

  const noSignatureField = { headers: { signature: 'fail=test,biff=buzz' } }
  const noSignatureFieldResult = new Error('Signature not extracted.')
  same(
    extractSignature(noSignatureField),
    noSignatureFieldResult,
    'No signature field in signature header returns an error'
  )

  const noSignature = { headers: {} }
  const noSignatureResult = new Error('Request not signed.')
  same(
    extractSignature(noSignature),
    noSignatureResult,
    'No signature header returns an error'
  )
})
