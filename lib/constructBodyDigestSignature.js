const crypto = require('crypto')

const constructBodyDigestSignature = ({
  headers: {
    digest,
    'content-type': contentType,
    'content-encoding': contentEncoding
  },
  body
}) => {
  const { formattedAlgorithm, digestAlgorithm, digestValue } = parseBodyDigestHeader(digest)

  const calculatedDigest = calculateDigest({
    algorithm: formattedAlgorithm,
    message: parseContentType(contentType, contentEncoding)(body),
    encoding: lookupEncoding(formattedAlgorithm)
  })

  if (calculatedDigest !== digestValue) {
    throw new Error('Calculated Digest does not match Digest from Request Header')
  }

  return `${digestAlgorithm}=${calculatedDigest}`
}

const parseBodyDigestHeader = (requestDigestHeader) => {
  // TODO:(jeff-sexton) - Parse for multiple digests in comma separated list and select one
  const [digestAlgorithm, digestValue] = requestDigestHeader.split(/=(.+)/)
  const formattedAlgorithm = digestAlgorithm.toLowerCase().split('-').join('')

  return { formattedAlgorithm, digestAlgorithm, digestValue }
}

const parseContentType = (requestContentTypeHeader, requestContentEncodingHeader) => {
  // TODO:(jeff-sexton) - Add other media types and support for ContentEncoding
  const mediaTypeFuncMap = {
    'application/json': (resource) => JSON.stringify(resource),
    default: () => { throw new Error('Unrecognized media-type') }
  }

  if (!requestContentTypeHeader) {
    throw new Error('No Content-Type Header in request')
  }

  return mediaTypeFuncMap[requestContentTypeHeader.split(';')[0]] || mediaTypeFuncMap.default
}

const lookupEncoding = (algorithm) => {
  const encodingAlgorithmMap = {
    sha256: 'base64',
    sha512: 'base64'
  }

  return encodingAlgorithmMap[algorithm]
}

const calculateDigest = ({ algorithm, message, encoding }) =>
  crypto.createHash(algorithm).update(message).digest(encoding).toString()

module.exports = constructBodyDigestSignature
