"use strict";

function extractHmacParameter({ query }) {
  if (!query.hmac) {
    throw new Error(
      "Could not extract Hmac parameter: no Hmac parameter found in query."
    );
  }
  return query.hmac;
}

module.exports = extractHmacParameter;
