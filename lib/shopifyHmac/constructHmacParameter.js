'use strict';

const crypto = require('crypto');

const constructHmacParameter = (req, options) =>
  calculateHmacParam({
    algorithm: options.getAlgorithm(),
    sharedSecret: options.sharedSecret,
    message: getMessage({ ...req }),
    digest: options.getDigest(),
  });

const getMessage = ({ query }) => {
  // console.log('query', query);
  const { hmac, ...hash } = query;

  // Resolves query "...ids[]=1&ids[]=2..." into 'ids=["1", "2"]' as per Shopify Docs
  // TODO - Determine if it is necessary to account for query array formats: "...ids=1&ids=2..." and "...ids=1,2..."
  if (Object.keys(hash).includes('ids[]')) {
    hash.ids = `["${hash['ids[]'].join('", "')}"]`;
    delete hash['ids[]'];
  }

  const hashKeys = Object.keys(hash);
  hashKeys.sort();

  //   console.log(hashKeys);

  const message = hashKeys
    .reduce((accumulator, key) => {
      accumulator.push(`${key}=${hash[key]}`);
      return accumulator;
    }, [])
    .join('&');

//   console.log('message', message);

  return message;
};

const calculateHmacParam = ({ algorithm, sharedSecret, message, digest }) =>
  crypto
    .createHmac(algorithm, sharedSecret)
    .update(message)
    .digest(digest)
    .toString();

module.exports = constructHmacParameter;
