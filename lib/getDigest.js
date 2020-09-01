const crypto = require('crypto')

const getDigest = (
  {
    headers: {
      digest
    },
    body
  }, options
) => {
  const [digestAlgorithm, digestValue] = digest.split(/=(.+)/)
  const formattedAlgorithm = digestAlgorithm.toLowerCase().split('-').join('')

  const calculatedDigest = calculateDigest({
    algorithm: formattedAlgorithm,
    message: JSON.stringify(body),
    encoding: options.digestEncoding
  })

  if (calculatedDigest !== digestValue) {
    throw new Error('Calculated Digest does not match Digest from Request Header')
  }

  return `${digestAlgorithm}=${calculatedDigest}`
}

const calculateDigest = ({ algorithm, message, encoding }) =>
  crypto.createHash(algorithm)
    .update(message)
    .digest(encoding)
    .toString()

module.exports = getDigest
