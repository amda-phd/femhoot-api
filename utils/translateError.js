"use strict";

const Boom = require("@hapi/boom");
const Accept = require("@hapi/accept");
const Joi = require("joi");
const { BOOM, MONGOOSE, JOI, JWT } = require("@errMessages");
const { headers } = require("@settings").app;

module.exports = (request, error) => {
  const language = Accept.language(request.headers[headers.language]) || "en";
  const { name, code, output, message } = error;

  const refLan = (ref) => ref[language] || ref.en;

  // This first because Joi errors are Boom
  if (Joi.isError(error)) {
    const path = error.details[0].path[0];
    const { type } = error.details[0];
    if (JOI[path] && JOI[path][type]) return refLan(JOI[path][type]);
  }

  if (Boom.isBoom(error)) {
    const { message: innerMessage, statusCode } = output;
    if (BOOM[message]) return refLan(BOOM[message]);
    if (BOOM[innerMessage]) return refLan(BOOM[innerMessage]);
    if (BOOM[statusCode]) return refLan(BOOM[statusCode]);
    return message;
  }

  if (name && Object.keys(JWT).includes(name)) return refLan(JWT[name]);

  if (code === 11000)
    return `${Object.keys(error.keyPattern)} ${refLan(MONGOOSE.duplicated)}`;

  return message || "Unknown Error";
};
