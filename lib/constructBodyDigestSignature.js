
const crypto = require('crypto')

const constructBodyDigestSignature = (digestHeader, body) => {
  console.log('\n\n******* digestHeader ******* \n\n', digestHeader, '\n\n===================')

  const [digestAlgorithm, digestValue] = parseBodyDigestHeader(digestHeader)

  const formattedAlgorithm = digestAlgorithm.toLowerCase().split('-').join('')

  console.log(formattedAlgorithm)

  console.log('body is', body)

  const calculatedDigest = calculateDigest({
    algorithm: formattedAlgorithm,
    message: body.toString(),
    digest: 'base64'
  })

  console.log('calculatedDigest')
  console.log(calculatedDigest)
  console.log('Digest Value')
  console.log(digestValue)

  console.log('====================\n\n')

  return digestHeader
}

const parseBodyDigestHeader = (digestHeader) => {
  // TODO - Parse for multiple digests?
  return digestHeader.replace(/"/g, '').replace(/'/g, '').split(/=(.+)/)
}

const calculateDigest = ({ algorithm, message, digest }) =>
  crypto
    .createHash(algorithm)
    .update(message)
    .digest(digest)
    .toString()

module.exports = constructBodyDigestSignature
