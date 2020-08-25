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
  //   console.log('query', query);
  const { hmac, ...rest } = query;

  const hash = { ...rest };
  //   console.log('hash', hash);

  const hashKeys = Object.keys(hash);
  hashKeys.sort();
  const message = hashKeys
    .reduce((accumulator, key) => {
      if (key === 'ids[]') {
        accumulator.push(`ids=${query[key]}`);
      } else {
        accumulator.push(`${key}=${query[key]}`);
      }
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
