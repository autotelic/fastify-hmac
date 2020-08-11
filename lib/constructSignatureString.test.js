"use strict";

const { test } = require("tap");
const constructSignatureString = require("./constructSignatureString");

test("Constructs a signature string from the incoming request", async ({
  equal,
}) => {
  const tests = [
    {
      description: "Signature extracted from valid signature header",
      input: {
        headers: {
          signature:
            'keyId="key-a", headers="(request-target) host", signature="027aa75dfe88bbd2e69bb4a7286a65c5228d91846c1fe0bfb2b21b382749367698d8e2164d947c1f8386edda8eb0482e778242af98a75d14ec702ce14c8a94cc"',
        },
        method: "POST",
        url: "/",
      },
      expected:
        "027aa75dfe88bbd2e69bb4a7286a65c5228d91846c1fe0bfb2b21b382749367698d8e2164d947c1f8386edda8eb0482e778242af98a75d14ec702ce14c8a94cc",
    },
  ];

  tests.forEach(({ description, input, expected }) => {
    equal(constructSignatureString(input, "topSecret"), expected, description);
  });
});
