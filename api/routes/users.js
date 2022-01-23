"use strict";

const register = (server, options) => {
  const { user } = server.plugins.validators;
  const { post, patch } = server.methods.User;

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
    {
      method: "PATCH",
      path: "/{id}",
      handler: patch,
      options: {
        tags: ["api", "user"],
        validate: { payload: user.patch },
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
