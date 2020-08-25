'use strict';

const { test } = require('tap');
const extractHmacParameter = require('./extractHmacParameter');

test('Extracts a Hmac parameter from a valid query object', async ({
  equal,
}) => {
  const tests = [
    {
      description: 'Hmac Parameter extracted from valid query object',
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
    equal(extractHmacParameter(input), expected, description);
  });
});

test('Throws an error when Hmac parameter cannot be extracted', async ({
  throws,
}) => {
  const tests = [
    {
      description: 'No Hmac parameter in query string returns an error',
      input: {
        query: {
          param: 'value',
          pet: 'dog',
        },
      },
      expected: new Error(
        'Could not extract Hmac parameter: no Hmac parameter found in query.'
      ),
    },
  ];

  tests.forEach(({ description, input, expected }) => {
    throws(
      function () {
        extractHmacParameter(input);
      },
      expected,
      description
    );
  });
});
