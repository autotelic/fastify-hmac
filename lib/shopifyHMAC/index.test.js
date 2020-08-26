'use strict';

const { test } = require('tap');
const {extractShopifySignature, constructShopifySignature} = require('.');

test('Extracts a Hmac parameter from a valid query object', async ({
  equal,
}) => {
  const tests = [
    {
      description: 'HMAC Parameter extracted from valid query object',
      input: {
        query: {
          code: '0907a61c0c8d55e99db179b68161bc00',
          hmac:
            '700e2dadb827fcc8609e9d5ce208b2e9cdaab9df07390d2cbca10d7c328fc4bf',
          shop: 'some-shop.myshopify.com',
          state: '0.6784241404160823',
          timestamp: '1337178173',
        },
      },
      expected:
        '700e2dadb827fcc8609e9d5ce208b2e9cdaab9df07390d2cbca10d7c328fc4bf',
    },
  ];

  tests.forEach(({ description, input, expected }) => {
    equal(extractShopifySignature(input), expected, description);
  });
});

test('Throws an error when HMAC parameter cannot be extracted', async ({
  throws,
}) => {
  const tests = [
    {
      description: 'No HMAC parameter in query string returns an error',
      input: {
        query: {
          param: 'value',
          pet: 'dog',
        },
      },
      expected: new Error(
        'Could not extract HMAC parameter: no HMAC parameter found in query.'
      ),
    },
  ];

  tests.forEach(({ description, input, expected }) => {
    throws(
      function () {
        extractShopifySignature(input);
      },
      expected,
      description
    );
  });
});

const defaultOptions = {
  sharedSecret: null,
  getAlgorithm: () => {
    throw new Error('No getAlgorithm function provided.');
  },
  getDigest: () => {
    throw new Error('No getDigest function provided.');
  },
};

const defaultSignature =
  '700e2dadb827fcc8609e9d5ce208b2e9cdaab9df07390d2cbca10d7c328fc4bf';
const defaultRequest = {
  query: {
    code: '0907a61c0c8d55e99db179b68161bc00',
    hmac: '700e2dadb827fcc8609e9d5ce208b2e9cdaab9df07390d2cbca10d7c328fc4bf',
    shop: 'some-shop.myshopify.com',
    state: '0.6784241404160823',
    timestamp: '1337178173',
  },
};

test('Constructs a HMAC signature parameter string from the incoming request query', async ({
  equal,
}) => {
  const tests = [
    {
      description:
        'Matching HMAC signature parameter constructed when a valid request is provided',
      input: defaultRequest,
      options: {
        ...defaultOptions,
        sharedSecret: 'hush',
        getAlgorithm: () => 'sha256',
        getDigest: () => 'hex',
      },
      expected: defaultSignature,
    },
    {
      description:
        'Matching HMAC signature parameter constructed when a valid request containing an ids array parameter is provided',
      input: {
        query: {
          code: '0907a61c0c8d55e99db179b68161bc00',
          hmac:
            '089cd381a3cbe82ba96e75d3244ec036621c4dfcb13285facd686bc4a7ed95dd',
          shop: 'some-shop.myshopify.com',
          state: '0.6784241404160823',
          timestamp: '1337178173',
          'ids[]': ['1', '2'],
        },
      },
      options: {
        ...defaultOptions,
        sharedSecret: 'hush',
        getAlgorithm: () => 'sha256',
        getDigest: () => 'hex',
      },
      expected:
        '089cd381a3cbe82ba96e75d3244ec036621c4dfcb13285facd686bc4a7ed95dd',
    },
  ];

  tests.forEach(({ description, input, options, expected }) => {
    equal(constructShopifySignature(input, options), expected, description);
  });
});

test('Throws an error when a HMAC signature parameter string cannot be constructed', async ({
  throws,
}) => {
  const tests = [
    {
      description:
        'Throws an error when no getAlgorithm function is provided to plugin',
      input: defaultRequest,
      options: {
        ...defaultOptions,
        sharedSecret: 'topSecret',
        getDigest: () => 'base64',
      },
      expected: new Error('No getAlgorithm function provided.'),
    },
    {
      description:
        'Throws an error when no getDigest function is provided to plugin',
      input: defaultRequest,
      options: {
        ...defaultOptions,
        sharedSecret: 'topSecret',
        getAlgorithm: () => 'sha512',
      },
      expected: new Error('No getDigest function provided.'),
    },
  ];

  tests.forEach(({ description, input, options, expected }) => {
    throws(
      function () {
        constructShopifySignature(input, options);
      },
      expected,
      description
    );
  });
});
