var vUgcError = require("stderror");
var vUgcException = vUgcError.extend("Exception");

vUgcException.define({code: "INVALID_CONFIGURATION_ERROR", name: "InvalidConfigurationError", message: "Missing Configuration Option."});
vUgcException.define({code: "E_EXCEEDS_UPLOAD_LIMIT", name: "FileSizeLimitError", message: "File Size Limit Exceeded."});
vUgcException.define({code: "FORBIDDEN_ERROR", name: "ForbiddenError", message: "Access Forbidden."});
vUgcException.define({code: "INTERNALSERVER_ERROR", name: "InternalServerError", message: "Internal Server Error."});
vUgcException.define({code: "UGC_SERVER_ERROR", name: "UgcServerError", message: "UGC Server Error."});

module.exports = vUgcException;
