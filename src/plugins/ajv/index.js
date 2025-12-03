const Ajv = require("ajv");

const validate = (schema, request) => {
  const ajv = new Ajv({ allErrors: true, jsPropertySyntax: true, useDefaults: true });

  const valid = {
    headers: true,
    params: true,
    body: true,
    query: true,
    error: null
  };

  // Ajv overwrite the error if you use same instance thats why theres return at each validation

  if (schema.headers && !ajv.validate(schema.headers, request.headers)) {
    valid.headers = false;
    return { ...valid, error: ajv.errors[0] };
  }

  if (schema.params && !ajv.validate(schema.params, request.params)) {
    valid.params = false;
    return { ...valid, error: ajv.errors[0] };
  }

  if (schema.query) {
    if (!ajv.validate(schema.query, request.query)) {
      valid.query = false;
      return { ...valid, error: ajv.errors[0] };
    }
  }

  if (schema.body && !ajv.validate(schema.body, request.body)) {
    valid.body = false;
    return { ...valid, error: ajv.errors[0] };
  }

  return valid;
};


exports.parseUpdateError = ({ error }) => ({
  success_response: false,
  message: error && `${error.dataPath} ${error.message}`
});

exports.validateSchema = schema => (request, reply, next) => {
  const { headers, params, body, query, error } = validate(schema, request);
  if (headers && params && query && body) {
    return next();
  }
  const storeErrorData = {};
  if (schema.storeValidationErrorInDB) {
    storeErrorData.req_data = request.body;
    storeErrorData.entity = schema.entity;
  }
  return reply.status(400).send(error);
};
