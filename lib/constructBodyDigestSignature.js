const crypto = require('crypto')

const constructBodyDigestSignature = (req) => {
  const {
    headers: {
      digest
      //   'content-type': contentType,
      //   'content-encoding': contentEncoding
    },
    body
  } = req

  const [digestAlgorithm, digestValue] = parseBodyDigestHeader(digest)

  console.log(digestValue)

  const formattedAlgorithm = digestAlgorithm.toLowerCase().split('-').join('')

  const calculatedDigest = calculateDigest({
    algorithm: formattedAlgorithm,
    message: JSON.stringify(body),
    digest: 'base64'
  })

  //   function generateDigest (request) { // generateDigest example from cybersource - produces the same digests
  //     var buffer = Buffer.from(JSON.stringify(body), 'utf8')

  //     const hash = crypto.createHash('sha256')

  //     hash.update(buffer)

  //     var digest = hash.digest('base64')

  //     return digest
  //   }
  //   console.log('generate', generateDigest())

  //   if (calculatedDigest === digestValue) {
  //     return `${digestAlgorithm}=${calculatedDigest}`
  //   } else {
  //     return new Error('Resource digest does not match digest header')
  //   }
  return `${digestAlgorithm}=${calculatedDigest}`
}

const parseBodyDigestHeader = (requestDigestHeader) => {
  // TODO - Parse for multiple digests?
  return requestDigestHeader.split(/=(.+)/)
}

const calculateDigest = ({ algorithm, message, digest }) =>
  crypto.createHash(algorithm).update(message).digest(digest)

module.exports = constructBodyDigestSignature
