"use strict";

const Joi = require("joi");

const register = (server, options) => {
  const { login } = server.plugins.validators;
  const { instance: user } = server.plugins.validators.user;

  server.route([
    {
      method: "POST",
      path: "/",
      handler: server.methods.Login.in,
      options: {
        auth: false,
        tags: ["api", "login"],
        validate: { payload: login.post },
        description:
          "Introduce your email, get a token, put it in your headers and start playing!",
        plugins: {
          "hapi-swagger": {
            responses: {
              ...server.methods.swaggerResponses(["500"]),
              201: {
                description: "Token created, user logged in",
                schema: Joi.object({
                  user,
                  token: Joi.string(),
                }),
              },
              400: {
                description: "Email missing",
                schema: server.methods.errorSchema("badRequest"),
              },
              401: {
                description: "Email incorrect",
                schema: server.methods.errorSchema("unauthorized"),
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
  name: "Login routes",
  version: require("@pack").version,
  once: true,
};
