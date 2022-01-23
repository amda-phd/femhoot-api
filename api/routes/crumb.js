"use strict";

const Joi = require("joi");

const register = (server) => {
  server.route([
    {
      method: "GET",
      path: "/",
      handler: server.methods.Crumb.create,
      options: {
        auth: false,
        tags: ["api", "auth", "users"],
        description:
          "Returns a fresh crumb, required as X-CSRF-Token header for POST, PUT, PATCHA and DELETE requests.",
        plugins: {
          "hapi-swagger": {
            responses: {
              ...server.methods.swaggerResponses("basic"),
              201: {
                description: "Crumb created and served",
                schema: Joi.object({ crumb: Joi.string() }),
              },
            },
          },
        },
      },
    },
  ]);
};

exports.plugin = {
  register,
  name: "Crumb routes",
  version: require("@pack").version,
  once: true,
};
