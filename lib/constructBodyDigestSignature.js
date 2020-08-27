const crypto = require('crypto')

const constructBodyDigestSignature = (req) => {
  const { headers: { digest, 'content-type': contentType, 'content-encoding': contentEncoding }, body } = req
  console.log('\n\n******* req ******* \n\n', req, '\n\n===================')
  console.log('\n\n******* requestDigestHeader ******* \n\n', digest, '\n\n===================')
  console.log('content-type', contentType)
  console.log('content-encoding', contentEncoding)

  const [digestAlgorithm, digestValue] = parseBodyDigestHeader(digest)

  const formattedAlgorithm = digestAlgorithm.toLowerCase().split('-').join('')

  console.log(formattedAlgorithm)

  console.log('body is', body)
  console.log('stringify', JSON.stringify(body))
  console.log('encode', encodeURIComponent('{"hello": "world"}'))
  console.log('encode', encodeURI('{"hello": "world"}'))

  const calculatedDigest = calculateDigest({
    algorithm: formattedAlgorithm,
    message: JSON.stringify(body),
    digest: 'base64'
  })

  console.log('calculatedDigest')
  console.log(calculatedDigest)
  console.log('Digest Value')
  console.log(digestValue)

  console.log('====================\n\n')

  return `${digestAlgorithm}=${calculatedDigest}`
//   return requestDigestHeader
}

const parseBodyDigestHeader = (requestDigestHeader) => {
  // TODO - Parse for multiple digests?
  return requestDigestHeader.split(/=(.+)/)
}

const calculateDigest = ({ algorithm, message, digest }) =>
  crypto
    .createHash(algorithm)
    .update(message)
    .digest(digest)

module.exports = constructBodyDigestSignature
