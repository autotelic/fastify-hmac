"use strict";

const createError = require("http-errors");
const { type } = require("os");
const extractSignatureHeaderAsDict = require("./extractSignatureHeaderAsDict");

function plugin(pluginOptions) {
  const defaultOptions = {
    sharedSecret: null,
    verificationError: "Unauthorized",
    verificationErrorMessage: "Signature verification failed",
    extractSignature: (req) => {
      const signatureDict = extractSignatureHeaderAsDict(req);
      const { signature } = signatureDict;
      return signature;
    },
    constructSignatureString: () => {},
  };

  const options = {
    ...defaultOptions,
    ...pluginOptions,
  };

  function verificationHook(req, reply, next) {
    if (options.sharedSecret === null) {
      return next(new Error("missing shared secret"));
    }

    const extractedSignature = options.extractSignature(req);

    return next(
      new createError[options.verificationError](
        options.verificationErrorMessage
      )
    );
  }

  return verificationHook;
}

module.exports = plugin;
