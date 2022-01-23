"use strict";

const register = (server, options) => {
  const { user } = server.plugins.validators;
  const { post } = server.methods.User;

  server.route([
    {
      method: "POST",
      path: "/",
      handler: post,
      options: {
        auth: false,
        tags: ["api", "user"],
        validate: { payload: user.post },
      },
    },
  ]);
};

exports.plugin = {
  register,
  name: "User routes",
  version: require("@pack").version,
  once: true,
};
