"use strict";

const Joi = require("joi");
const Boom = require("@hapi/boom");
const { pick } = require("lodash");

const register = (server) => {
  const errorSchema = (name, message) =>
    Joi.object(Boom[name](message).output.payload);

  const swaggerResponses = (codes, name) => {
    const responses = {
      400: {
        description: "Bad Request",
        schema: errorSchema("badRequest"),
      },
      401: {
        description:
          "User unauthorized due to token expired, invalid or missing. Please log in",
        schema: errorSchema("unauthorized"),
      },
      403: {
        description:
          "This action is forbidden. This can happen either due to the user's lack of permission or to absence of CSRF token and/or cookie",
        schema: errorSchema("forbidden"),
      },
      404: name
        ? {
            description: `${name} not found`,
            schema: errorSchema("notFound"),
          }
        : {},
      413: {
        description:
          "Entity too large. The payload exceeds the server's stablished limit. Try something smaller",
        schema: errorSchema("entityTooLarge"),
      },
      500: {
        description:
          "Internal server error: check API logs for more information",
        schema: errorSchema("internal"),
      },
    };

    if (!codes) return responses;
    if (typeof codes === "string") {
      if (codes === "all") return responses;
      if (codes === "basic") return pick(responses, ["500"]);
      if (responses[codes]) return responses[codes];
    }

    if (Array.isArray(codes)) return pick(responses, codes);
    server.log(
      ["warn", "server", "documentation"],
      `${codes} are not valid swaggerResponse codes. These responses haven't been loaded into the documentation`
    );
    return responses;
  };

  server.method("errorSchema", errorSchema);
  server.method("swaggerResponses", swaggerResponses);

  return server;
};

exports.plugin = {
  register,
  name: "swagger-responses",
  description:
    "Returns patterns that are meant to be reused frequently when documentating the routes with Swagger.",
  version: require("@pack").version,
  once: true,
};
