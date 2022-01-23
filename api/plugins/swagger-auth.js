"use strict";

const register = (server) => {
  const validate = function (request, username, password) {
    const isValid =
      username === process.env.SWAGGER_USER &&
      password === process.env.SWAGGER_PASSWORD;
    return { isValid, credentials: { username } };
  };

  server.auth.strategy("swagger", "basic", { validate });
  return server;
};

exports.plugin = {
  register,
  name: "swagger-auth",
  description: "Really basic auth to access Swagger documentation.",
  version: require("@pack").version,
  once: true,
};
