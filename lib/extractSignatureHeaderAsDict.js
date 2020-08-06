"use strict";

function extractSignatureHeaderAsDict({ headers: { signature = null } }) {
  return signature.split(",").reduce((dict, fields) => {
    // Regex split captures only the first instance of '=' delimiter
    // avoids further splitting a b64 signature with valid '=' symbols
    const [fieldKey, fieldValue] = fields.split(/=(.+)/);
    return { ...dict, [fieldKey]: fieldValue };
  });
}

module.exports = extractSignatureHeaderAsDict;
