"use strict";

const register = (server, options) => {
  const { login } = server.plugins.validators;

  server.route([
    {
      method: "POST",
      path: "/",
      handler: server.methods.Login.in,
      options: {
        auth: false,
        tags: ["api", "login"],
        validate: { payload: login.post },
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
